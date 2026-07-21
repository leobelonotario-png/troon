import { parse } from 'csv-parse/sync';
import {
  AssetClass,
  Domicile,
  FundStatus,
  FundType,
  Prisma,
  PrismaClient,
  Subtype,
} from '@prisma/client';
import { z } from 'zod';
import { hasValidTaxonomyCombination } from './taxonomy.js';

const nullableEnum = <T extends Record<string, string>>(values: T) => z.nativeEnum(values).nullable().optional();
const nullableNumber = z.number().finite().nullable().optional();

export const fundInputSchema = z.object({
  classCode: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  fundRegistrationNumber: z.string().trim().nullable().optional(),
  managerName: z.string().trim().nullable().optional(),
  managerRegistrationNumber: z.string().trim().nullable().optional(),
  anbimaCategory: z.string().trim().nullable().optional(),
  netAssetsBillions: nullableNumber,
  investorCount: z.number().int().nonnegative().nullable().optional(),
  trailingTwelveMonthsReturn: nullableNumber,
  sharePrice: nullableNumber,
  sharePriceDate: z.coerce.date().nullable().optional(),
  domicile: nullableEnum(Domicile),
  fundType: nullableEnum(FundType),
  status: nullableEnum(FundStatus),
  assetClass: nullableEnum(AssetClass),
  subtype: nullableEnum(Subtype),
  annualizedReturnSinceInception: nullableNumber,
  annualizedVolatilitySinceInception: nullableNumber,
  validated: z.boolean().nullable().optional(),
}).strict();

export type FundInput = z.infer<typeof fundInputSchema>;

export function validateFundLifecycle(input: FundInput): string | null {
  const classification = [input.fundType, input.assetClass, input.subtype];
  if (classification.some((value) => value != null) && classification.some((value) => value == null)) {
    return 'fundType, assetClass, and subtype must be provided together.';
  }
  if (input.fundType && input.assetClass && input.subtype && !hasValidTaxonomyCombination(input.fundType, input.assetClass, input.subtype)) {
    return 'The supplied assetClass and subtype are not valid for this fundType.';
  }
  if (input.validated === true) {
    const required = [
      input.domicile, input.fundType, input.status, input.assetClass, input.subtype,
      input.annualizedReturnSinceInception, input.annualizedVolatilitySinceInception,
    ];
    if (required.some((value) => value == null)) {
      return 'A validated fund requires domicile, fundType, status, assetClass, subtype, annualizedReturnSinceInception, and annualizedVolatilitySinceInception.';
    }
  }
  return null;
}

type CsvRecord = Record<string, string>;

function nullableText(value: string | undefined): string | null {
  const result = value?.trim();
  return result ? result : null;
}

function parseBrazilianNumber(value: string | undefined): number | null {
  const text = nullableText(value);
  if (!text) return null;
  const parsed = Number(text.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: string | undefined): Date | null {
  const text = nullableText(value);
  if (!text) return null;
  const date = new Date(`${text}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function csvRecordToData(row: CsvRecord): Prisma.FundCreateInput {
  const classCode = nullableText(row['Código da Classe']);
  const name = nullableText(row['Nome']);
  if (!classCode || !name) throw new Error('Código da Classe and Nome are required.');
  return {
    classCode,
    name,
    fundRegistrationNumber: nullableText(row.CNPJ),
    managerName: nullableText(row.Gestora),
    managerRegistrationNumber: nullableText(row['CNPJ da Gestora']),
    anbimaCategory: nullableText(row['Tipo ANBIMA']),
    netAssetsBillions: parseBrazilianNumber(row['Patrimônio Líquido (R$ bi)']),
    investorCount: (() => {
      const value = parseBrazilianNumber(row.Cotistas);
      return value == null ? null : Math.trunc(value);
    })(),
    trailingTwelveMonthsReturn: parseBrazilianNumber(row['Rentabilidade 12m (%)']),
    sharePrice: parseBrazilianNumber(row.Cota),
    sharePriceDate: parseDate(row['Data da Cota']),
    lastImportedAt: new Date(),
  };
}

export async function importFundsCsv(prisma: PrismaClient, content: Buffer) {
  const rows = parse(content, {
    bom: true,
    columns: true,
    delimiter: ';',
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRecord[];
  const summary = { processed: rows.length, created: 0, updated: 0, rejected: 0, errors: [] as { row: number; message: string }[] };
  const batchSize = 250;

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    await prisma.$transaction(async (transaction) => {
      for (const [offset, row] of batch.entries()) {
        try {
          const data = csvRecordToData(row);
          const existing = await transaction.fund.findUnique({ where: { classCode: data.classCode } });
          if (existing) {
            const { classCode, ...importData } = data;
            await transaction.fund.update({
              where: { classCode },
              data: importData,
            });
            summary.updated += 1;
          } else {
            await transaction.fund.create({ data });
            summary.created += 1;
          }
        } catch (error) {
          summary.rejected += 1;
          summary.errors.push({ row: start + offset + 2, message: error instanceof Error ? error.message : 'Invalid CSV row.' });
        }
      }
    });
  }
  return summary;
}
