import { parse } from 'csv-parse/sync';
import type { PrismaClient } from '@prisma/client';

type CsvRecord = Record<string, string>;

export interface MetricUpdate {
  id: string;
  ret: number;
  vol: number;
}

export interface CsvValidationResult {
  processed: number;
  updates: MetricUpdate[];
}

function value(row: CsvRecord, names: string[]) {
  for (const name of names) {
    const result = row[name]?.trim();
    if (result) return result;
  }
  return null;
}

function parseMetric(value: string | null, label: string, row: number) {
  if (!value) throw new Error(`Linha ${row}: ${label} é obrigatório.`);
  const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) throw new Error(`Linha ${row}: ${label} deve ser numérico.`);
  return parsed;
}

function parseRows(content: Buffer) {
  const rows = parse(content, {
    bom: true,
    columns: true,
    delimiter: ';',
    skip_empty_lines: true,
    trim: true,
  }) as CsvRecord[];

  if (!rows.length) throw new Error('O CSV não contém linhas de dados.');
  const headers = Object.keys(rows[0] ?? {});
  const hasIdentifier = headers.some((header) => ['CNPJ ou Nome', 'CNPJ', 'Nome'].includes(header));
  const hasReturn = headers.some((header) => ['Retorno', 'Retorno (% a.a.)'].includes(header));
  const hasVolatility = headers.some((header) => ['Vol', 'Volatilidade', 'Vol (% a.a.)'].includes(header));
  if (!hasIdentifier || !hasReturn || !hasVolatility) {
    throw new Error('O CSV deve ter as colunas "CNPJ ou Nome" (ou CNPJ/Nome), "Retorno" e "Vol".');
  }
  return rows;
}

export async function validateMetricsCsv(prisma: PrismaClient, content: Buffer): Promise<CsvValidationResult> {
  const rows = parseRows(content);
  const funds = await prisma.fund.findMany({
    where: { validated: true },
    select: { id: true, name: true, fundRegistrationNumber: true },
  });
  const updates: MetricUpdate[] = [];
  const ids = new Set<string>();

  for (const [index, row] of rows.entries()) {
    const line = index + 2;
    const identifier = value(row, ['CNPJ ou Nome', 'CNPJ', 'Nome']);
    if (!identifier) throw new Error(`Linha ${line}: CNPJ ou Nome é obrigatório.`);
    const fund = funds.find(
      (item) =>
        item.fundRegistrationNumber === identifier || item.name.localeCompare(identifier, 'pt-BR', { sensitivity: 'accent' }) === 0,
    );
    if (!fund) throw new Error(`Linha ${line}: fundo "${identifier}" não foi encontrado entre os fundos aprovados.`);
    if (ids.has(fund.id)) throw new Error(`Linha ${line}: o fundo "${identifier}" foi informado mais de uma vez.`);
    ids.add(fund.id);
    updates.push({
      id: fund.id,
      ret: parseMetric(value(row, ['Retorno', 'Retorno (% a.a.)']), 'Retorno', line),
      vol: parseMetric(value(row, ['Vol', 'Volatilidade', 'Vol (% a.a.)']), 'Vol', line),
    });
  }
  return { processed: rows.length, updates };
}

export async function importMetricsCsv(prisma: PrismaClient, content: Buffer) {
  const result = await validateMetricsCsv(prisma, content);
  await prisma.$transaction(
    result.updates.map((update) =>
      prisma.fund.update({
        where: { id: update.id },
        data: {
          annualizedReturnSinceInception: update.ret,
          annualizedVolatilitySinceInception: update.vol,
        },
      }),
    ),
  );
  return { updated: result.updates.length };
}
