import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { fundInputSchema, importFundsCsv, validateFundLifecycle } from './funds.js';
import { importMetricsCsv, validateMetricsCsv } from './quick-update.js';
import { taxonomy } from './taxonomy.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function sendValidationError(response: Response, message: string) {
  return response.status(422).json({ error: message });
}

function parseFundInput(request: Request, response: Response) {
  const result = fundInputSchema.safeParse(request.body);
  if (!result.success) {
    response.status(422).json({ error: 'Invalid fund payload.', details: result.error.issues });
    return null;
  }
  return result.data;
}

function buildWhere(query: Request['query'], approvedOnly: boolean) {
  const where: Record<string, unknown> = approvedOnly
    ? { validated: true, origin: 'APPROVED' }
    : {};
  for (const key of ['domicile', 'fundType', 'status', 'assetClass', 'subtype'] as const) {
    if (typeof query[key] === 'string') where[key] = query[key];
  }
  if (!approvedOnly && typeof query.validated === 'string') {
    where.validated = query.validated === 'null' ? null : query.validated === 'true';
  }
  if (approvedOnly && typeof query.recommended === 'string') {
    where.recommended = query.recommended === 'true';
  }
  if (typeof query.search === 'string' && query.search.trim()) {
    const search = query.search.trim();
    where.OR = ['name', 'managerName', 'fundRegistrationNumber'].map((field) => ({
      [field]: { contains: search },
    }));
  }
  return where;
}

function listFunds(prisma: PrismaClient, approvedOnly: boolean) {
  return async (request: Request, response: Response) => {
    const requestedPage = Number(request.query.page ?? 1);
    const requestedPageSize = Number(request.query.pageSize ?? 50);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const pageSize = Number.isInteger(requestedPageSize)
      ? Math.min(Math.max(requestedPageSize, 1), 100)
      : 50;
    const where = buildWhere(request.query, approvedOnly);
    const [items, total] = await Promise.all([
      prisma.fund.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.fund.count({ where }),
    ]);
    response.json({ items, page, pageSize, total });
  };
}

export function createApp(prisma = new PrismaClient()) {
  const app = express();
  app.use(express.json());
  app.use((_request, response, next) => {
    response.setHeader(
      'Access-Control-Allow-Origin',
      process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    );
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.get('/health', async (_request, response) => {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: 'ok' });
  });
  app.get('/fund-taxonomy', (_request, response) => response.json(taxonomy));
  app.get('/funds', listFunds(prisma, true));
  app.get('/admin/funds', listFunds(prisma, false));

  app.get('/funds/:id', async (request, response) => {
    const fund = await prisma.fund.findFirst({ where: { id: request.params.id, validated: true } });
    if (!fund) return response.status(404).json({ error: 'Fund not found.' });
    return response.json(fund);
  });
  app.get('/admin/funds/:id', async (request, response) => {
    const fund = await prisma.fund.findUnique({ where: { id: request.params.id } });
    if (!fund) return response.status(404).json({ error: 'Fund not found.' });
    return response.json(fund);
  });

  app.post('/funds/import', upload.single('file'), async (request, response) => {
    if (!request.file)
      return response.status(400).json({ error: 'Attach a CSV file in the file field.' });
    try {
      return response.status(201).json(await importFundsCsv(prisma, request.file.buffer));
    } catch (error) {
      return response
        .status(422)
        .json({ error: error instanceof Error ? error.message : 'Unable to import CSV.' });
    }
  });

  app.post(
    '/admin/funds/quick-update/validate',
    upload.single('file'),
    async (request, response) => {
      if (!request.file)
        return response.status(400).json({ error: 'Attach a CSV file in the file field.' });
      try {
        const result = await validateMetricsCsv(prisma, request.file.buffer);
        return response.json({ processed: result.processed, valid: true });
      } catch (error) {
        return response
          .status(422)
          .json({ error: error instanceof Error ? error.message : 'Unable to validate CSV.' });
      }
    },
  );

  app.post('/admin/funds/quick-update/import', upload.single('file'), async (request, response) => {
    if (!request.file)
      return response.status(400).json({ error: 'Attach a CSV file in the file field.' });
    try {
      return response.json(await importMetricsCsv(prisma, request.file.buffer));
    } catch (error) {
      return response
        .status(422)
        .json({ error: error instanceof Error ? error.message : 'Unable to import CSV.' });
    }
  });

  app.post('/admin/funds', async (request, response) => {
    const input = parseFundInput(request, response);
    if (!input) return;
    if (!input.name) return sendValidationError(response, 'name is required.');
    const lifecycleError = validateFundLifecycle(input);
    if (lifecycleError) return sendValidationError(response, lifecycleError);
    try {
      const { classCode, name, ...optionalData } = input;
      return response
        .status(201)
        .json(
          await prisma.fund.create({
            data: { classCode: classCode ?? `manual-${randomUUID()}`, name, ...optionalData },
          }),
        );
    } catch (error) {
      return response
        .status(409)
        .json({ error: error instanceof Error ? error.message : 'Unable to create fund.' });
    }
  });

  app.patch('/admin/funds/:id', async (request, response) => {
    const input = parseFundInput(request, response);
    if (!input) return;
    const existing = await prisma.fund.findUnique({ where: { id: request.params.id } });
    if (!existing) return response.status(404).json({ error: 'Fund not found.' });
    const merged = { ...existing, ...input };
    const lifecycleError = validateFundLifecycle(merged);
    if (lifecycleError) return sendValidationError(response, lifecycleError);
    try {
      return response.json(await prisma.fund.update({ where: { id: existing.id }, data: input }));
    } catch (error) {
      return response
        .status(409)
        .json({ error: error instanceof Error ? error.message : 'Unable to update fund.' });
    }
  });

  app.delete('/admin/funds/:id', async (request, response) => {
    const existing = await prisma.fund.findUnique({ where: { id: request.params.id } });
    if (!existing) return response.status(404).json({ error: 'Fund not found.' });
    await prisma.fund.delete({ where: { id: existing.id } });
    return response.status(204).send();
  });

  app.post('/admin/funds/metrics', async (request, response) => {
    const parsed = z
      .object({
        updates: z
          .array(
            z.object({
              id: z.string(),
              ret: z.number().finite().nullable(),
              vol: z.number().finite().nullable(),
              updatedAt: z.coerce.date().nullable(),
            }),
          )
          .min(1),
      })
      .safeParse(request.body);
    if (!parsed.success)
      return response
        .status(422)
        .json({ error: 'Invalid metrics payload.', details: parsed.error.issues });
    await prisma.$transaction(
      parsed.data.updates.map((update) =>
        prisma.fund.update({
          where: { id: update.id },
          data: {
            annualizedReturnSinceInception: update.ret,
            annualizedVolatilitySinceInception: update.vol,
            sharePriceDate: update.updatedAt,
          },
        }),
      ),
    );
    return response.status(204).send();
  });

  const indexInput = z
    .object({
      name: z.string().trim().min(1),
      ret: z.number().finite().nullable(),
      vol: z.number().finite().nullable(),
      color: z.string().nullable().optional(),
      dashed: z.boolean(),
    })
    .strict();
  app.get('/indices', async (_request, response) =>
    response.json(await prisma.index.findMany({ orderBy: { name: 'asc' } })),
  );
  app.post('/indices', async (request, response) => {
    const parsed = indexInput.safeParse(request.body);
    if (!parsed.success)
      return response
        .status(422)
        .json({ error: 'Invalid index payload.', details: parsed.error.issues });
    return response.status(201).json(await prisma.index.create({ data: parsed.data }));
  });
  app.patch('/indices/:id', async (request, response) => {
    const parsed = indexInput.safeParse(request.body);
    if (!parsed.success)
      return response
        .status(422)
        .json({ error: 'Invalid index payload.', details: parsed.error.issues });
    const existing = await prisma.index.findUnique({ where: { id: request.params.id } });
    if (!existing) return response.status(404).json({ error: 'Index not found.' });
    return response.json(
      await prisma.index.update({ where: { id: existing.id }, data: parsed.data }),
    );
  });
  app.delete('/indices/:id', async (request, response) => {
    const existing = await prisma.index.findUnique({ where: { id: request.params.id } });
    if (!existing) return response.status(404).json({ error: 'Index not found.' });
    await prisma.index.delete({ where: { id: existing.id } });
    return response.status(204).send();
  });

  const comparisonInput = z
    .object({
      refId: z.string().nullable(),
      selected: z.array(z.string()),
      title: z.string(),
      source: z.string(),
      period: z.string(),
      correlations: z.record(z.string(), z.number().min(-1).max(1)),
    })
    .strict();
  app.get('/comparison', async (_request, response) => {
    const comparison = await prisma.comparison.findUnique({ where: { id: 'default' } });
    return response.json(
      comparison ?? {
        refId: null,
        selected: [],
        title: 'Comparativo de fundos',
        source: 'Troon Capital',
        period: '',
        correlations: {},
      },
    );
  });
  app.put('/comparison', async (request, response) => {
    const parsed = comparisonInput.safeParse(request.body);
    if (!parsed.success)
      return response
        .status(422)
        .json({ error: 'Invalid comparison payload.', details: parsed.error.issues });
    if (parsed.data.refId && parsed.data.selected.includes(parsed.data.refId))
      return sendValidationError(response, 'The reference fund cannot be a participant.');
    return response.json(
      await prisma.comparison.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...parsed.data },
        update: parsed.data,
      }),
    );
  });

  return app;
}
