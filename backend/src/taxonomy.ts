import { AssetClass, FundType, Subtype } from '@prisma/client';

type TaxonomyEntry = {
  assetClass: AssetClass;
  subtypes: readonly Subtype[];
};

type TaxonomyOption<T extends string> = { id: T; label: string };
export type TaxonomyResponse = Record<
  FundType,
  Array<TaxonomyOption<AssetClass> & { subtypes: Array<TaxonomyOption<Subtype>> }>
>;

const assetClassLabels: Record<AssetClass, string> = {
  FLOATING_RATE: 'Pós-fixado',
  SHORT_DURATION: 'Curta duração',
  LONG_DURATION: 'Longa duração',
  HEDGE_FUNDS: 'Multimercados',
  EQUITIES: 'Ações',
  ALTERNATIVES: 'Alternativos',
  FII_BRICK_AND_MORTAR: 'FIIs — Tijolo',
  FII_PAPER: 'FIIs — Papel',
  FII_HYBRID: 'FIIs — Híbridos',
  FII_FOFS: 'FIIs — FOFs',
  ETF: 'ETFs',
};

const subtypeLabels: Record<Subtype, string> = {
  OVERNIGHT: 'Overnight',
  HIGH_GRADE: 'High Grade',
  HIGH_YIELD: 'High Yield',
  SD_SOVEREIGN: 'Soberano de curta duração',
  LD_SOVEREIGN: 'Soberano de longa duração',
  MACRO: 'Macro',
  MULTI_STRATEGY: 'Multiestratégia',
  LONG_AND_SHORT: 'Long and Short',
  LARGE_CAP_VALUE: 'Large Cap Value',
  MID_CAP_VALUE: 'Mid Cap Value',
  SMALL_CAP_VALUE: 'Small Cap Value',
  LARGE_CAP_BLEND: 'Large Cap Blend',
  MID_CAP_BLEND: 'Mid Cap Blend',
  SMALL_CAP_BLEND: 'Small Cap Blend',
  LARGE_CAP_GROWTH: 'Large Cap Growth',
  MID_CAP_GROWTH: 'Mid Cap Growth',
  SMALL_CAP_GROWTH: 'Small Cap Growth',
  LONG_BIASED: 'Long Biased',
  SECONDARIES: 'Secundários',
  STRUCTURED_CREDIT: 'Crédito estruturado',
  SPECIAL_SITUATION: 'Situações especiais',
  PRIVATE_EQUITY: 'Private Equity',
  GROWTH_CAPITAL: 'Capital de crescimento',
  VENTURE_CAPITAL: 'Venture Capital',
  PUBLIC_INFRASTRUCTURE: 'Infraestrutura pública',
  PUBLIC_REAL_ESTATE: 'Imóveis públicos',
  PRIVATE_REAL_ESTATE: 'Imóveis privados',
  GOLD: 'Ouro',
  CURRENCY: 'Moedas',
  CRYPTOCURRENCY: 'Criptomoedas',
  COMMODITIES: 'Commodities',
  LOGISTICS: 'Logística',
  CORPORATE_OFFICES: 'Lajes corporativas',
  SHOPPING: 'Shopping',
  URBAN_INCOME: 'Renda urbana',
  INDUSTRIAL: 'Industrial',
  HOSPITALITY: 'Hotelaria',
  RESIDENTIAL: 'Residencial',
  AGRICULTURE: 'Agronegócio',
  DEVELOPMENT: 'Desenvolvimento',
  OTHER: 'Outros',
  HYBRID: 'Híbridos',
  FOF: 'FOFs',
  EQUITIES: 'Ações',
  FIXED_INCOME_SECURITIES: 'Renda fixa e títulos',
  FACTORS: 'Fatores',
  SECTORAL: 'Setoriais',
  THEMATIC: 'Temáticos',
  ASSETS: 'Ativos',
  DIGITAL_ASSETS: 'Ativos digitais',
};

export const taxonomy: Record<FundType, readonly TaxonomyEntry[]> = {
  LIQUID: [
    { assetClass: 'FLOATING_RATE', subtypes: ['OVERNIGHT', 'HIGH_GRADE', 'HIGH_YIELD'] },
    { assetClass: 'SHORT_DURATION', subtypes: ['SD_SOVEREIGN', 'HIGH_GRADE', 'HIGH_YIELD'] },
    { assetClass: 'LONG_DURATION', subtypes: ['LD_SOVEREIGN', 'HIGH_GRADE', 'HIGH_YIELD'] },
    { assetClass: 'HEDGE_FUNDS', subtypes: ['MACRO', 'MULTI_STRATEGY', 'LONG_AND_SHORT'] },
    {
      assetClass: 'EQUITIES',
      subtypes: [
        'LARGE_CAP_VALUE',
        'MID_CAP_VALUE',
        'SMALL_CAP_VALUE',
        'LARGE_CAP_BLEND',
        'MID_CAP_BLEND',
        'SMALL_CAP_BLEND',
        'LARGE_CAP_GROWTH',
        'MID_CAP_GROWTH',
        'SMALL_CAP_GROWTH',
        'LONG_BIASED',
      ],
    },
  ],
  ILLIQUID: [
    {
      assetClass: 'ALTERNATIVES',
      subtypes: [
        'SECONDARIES',
        'STRUCTURED_CREDIT',
        'SPECIAL_SITUATION',
        'PRIVATE_EQUITY',
        'GROWTH_CAPITAL',
        'VENTURE_CAPITAL',
        'PUBLIC_INFRASTRUCTURE',
        'PUBLIC_REAL_ESTATE',
        'PRIVATE_REAL_ESTATE',
        'GOLD',
        'CURRENCY',
        'CRYPTOCURRENCY',
        'COMMODITIES',
      ],
    },
  ],
  LISTED: [
    {
      assetClass: 'FII_BRICK_AND_MORTAR',
      subtypes: [
        'LOGISTICS',
        'CORPORATE_OFFICES',
        'SHOPPING',
        'URBAN_INCOME',
        'INDUSTRIAL',
        'HOSPITALITY',
        'RESIDENTIAL',
        'AGRICULTURE',
        'DEVELOPMENT',
        'OTHER',
      ],
    },
    { assetClass: 'FII_PAPER', subtypes: ['HIGH_GRADE', 'HIGH_YIELD'] },
    { assetClass: 'FII_HYBRID', subtypes: ['HYBRID'] },
    { assetClass: 'FII_FOFS', subtypes: ['FOF'] },
    {
      assetClass: 'ETF',
      subtypes: [
        'EQUITIES',
        'FIXED_INCOME_SECURITIES',
        'COMMODITIES',
        'FACTORS',
        'SECTORAL',
        'THEMATIC',
        'ASSETS',
        'DIGITAL_ASSETS',
      ],
    },
  ],
};

export function getTaxonomyResponse(): TaxonomyResponse {
  return Object.fromEntries(
    Object.entries(taxonomy).map(([fundType, entries]) => [
      fundType,
      entries.map(({ assetClass, subtypes }) => ({
        id: assetClass,
        label: assetClassLabels[assetClass],
        subtypes: subtypes.map((subtype) => ({ id: subtype, label: subtypeLabels[subtype] })),
      })),
    ]),
  ) as TaxonomyResponse;
}

export function hasValidTaxonomyCombination(
  fundType: FundType,
  assetClass: AssetClass,
  subtype: Subtype,
): boolean {
  return taxonomy[fundType].some(
    (entry) => entry.assetClass === assetClass && entry.subtypes.includes(subtype),
  );
}
