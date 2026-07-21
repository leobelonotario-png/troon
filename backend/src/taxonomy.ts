import { AssetClass, FundType, Subtype } from '@prisma/client';

type TaxonomyEntry = {
  assetClass: AssetClass;
  subtypes: readonly Subtype[];
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
        'LARGE_CAP_VALUE', 'MID_CAP_VALUE', 'SMALL_CAP_VALUE', 'LARGE_CAP_BLEND', 'MID_CAP_BLEND',
        'SMALL_CAP_BLEND', 'LARGE_CAP_GROWTH', 'MID_CAP_GROWTH', 'SMALL_CAP_GROWTH', 'LONG_BIASED',
      ],
    },
  ],
  ILLIQUID: [
    {
      assetClass: 'ALTERNATIVES',
      subtypes: [
        'SECONDARIES', 'STRUCTURED_CREDIT', 'SPECIAL_SITUATION', 'PRIVATE_EQUITY', 'GROWTH_CAPITAL',
        'VENTURE_CAPITAL', 'PUBLIC_INFRASTRUCTURE', 'PUBLIC_REAL_ESTATE', 'PRIVATE_REAL_ESTATE', 'GOLD',
        'CURRENCY', 'CRYPTOCURRENCY', 'COMMODITIES',
      ],
    },
  ],
  LISTED: [
    {
      assetClass: 'FII_BRICK_AND_MORTAR',
      subtypes: ['LOGISTICS', 'CORPORATE_OFFICES', 'SHOPPING', 'URBAN_INCOME', 'INDUSTRIAL', 'HOSPITALITY', 'RESIDENTIAL', 'AGRICULTURE', 'DEVELOPMENT', 'OTHER'],
    },
    { assetClass: 'FII_PAPER', subtypes: ['HIGH_GRADE', 'HIGH_YIELD'] },
    { assetClass: 'FII_HYBRID', subtypes: ['HYBRID'] },
    { assetClass: 'FII_FOFS', subtypes: ['FOF'] },
    { assetClass: 'ETF', subtypes: ['EQUITIES', 'FIXED_INCOME_SECURITIES', 'COMMODITIES', 'FACTORS', 'SECTORAL', 'THEMATIC', 'ASSETS', 'DIGITAL_ASSETS'] },
  ],
};

export function hasValidTaxonomyCombination(
  fundType: FundType,
  assetClass: AssetClass,
  subtype: Subtype,
): boolean {
  return taxonomy[fundType].some(
    (entry) => entry.assetClass === assetClass && entry.subtypes.includes(subtype),
  );
}
