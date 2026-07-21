import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { fundInputSchema, importFundsCsv, validateFundLifecycle } from './funds.js';
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

function buildWhere(query: Request['query'], validatedOnly: boolean) {
  const where: Record<string, unknown> = validatedOnly ? { validated: true } : {};
  for (const key of ['domicile', 'fundType', 'status', 'assetClass', 'subtype'] as const) {
    if (typeof query[key] === 'string') where[key] = query[key];
  }
  if (!validatedOnly && typeof query.validated === 'string') {
    where.validated = query.validated === 'null' ? null : query.validated === 'true';
  }
  if (typeof query.search === 'string' && query.search.trim()) {
    const search = query.search.trim();
    where.OR = ['name', 'managerName', 'fundRegistrationNumber'].map((field) => ({ [field]: { contains: search } }));
  }
  return where;
}

function listFunds(prisma: PrismaClient, validatedOnly: boolean) {
  return async (request: Request, response: Response) => {
    const requestedPage = Number(request.query.page ?? 1);
    const requestedPageSize = Number(request.query.pageSize ?? 50);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const pageSize = Number.isInteger(requestedPageSize) ? Math.min(Math.max(requestedPageSize, 1), 100) : 50;
    const where = buildWhere(request.query, validatedOnly);
    const [items, total] = await Promise.all([
      prisma.fund.findMany({ where, orderBy: { name: 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.fund.count({ where }),
    ]);
    response.json({ items, page, pageSize, total });
  };
}

export function createApp(prisma = new PrismaClient()) {
  const app = express();
  app.use(express.json());

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
    if (!request.file) return response.status(400).json({ error: 'Attach a CSV file in the file field.' });
    try {
      return response.status(201).json(await importFundsCsv(prisma, request.file.buffer));
    } catch (error) {
      return response.status(422).json({ error: error instanceof Error ? error.message : 'Unable to import CSV.' });
    }
  });

  app.post('/admin/funds', async (request, response) => {
    const input = parseFundInput(request, response);
    if (!input) return;
    if (!input.classCode || !input.name) return sendValidationError(response, 'classCode and name are required.');
    const lifecycleError = validateFundLifecycle(input);
    if (lifecycleError) return sendValidationError(response, lifecycleError);
    try {
      const { classCode, name, ...optionalData } = input;
      return response.status(201).json(await prisma.fund.create({ data: { classCode, name, ...optionalData } }));
    } catch (error) {
      return response.status(409).json({ error: error instanceof Error ? error.message : 'Unable to create fund.' });
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
      return response.status(409).json({ error: error instanceof Error ? error.message : 'Unable to update fund.' });
    }
  });

  app.delete('/admin/funds/:id', async (request, response) => {
    const existing = await prisma.fund.findUnique({ where: { id: request.params.id } });
    if (!existing) return response.status(404).json({ error: 'Fund not found.' });
    await prisma.fund.delete({ where: { id: existing.id } });
    return response.status(204).send();
  });

  return app;
}
