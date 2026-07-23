import type { Fund, FundType, Taxonomy, TaxonomyOption } from '../../shared/domain/fund.types';
import type { Comparison, Index } from '../../shared/domain/index.types';

export type ComparisonEntity = (Fund & { kind: 'fund' | 'industry' }) | (Index & { kind: 'index' });
export interface ComparatorFilters {
  type: FundType | '';
  classe: string;
  sub: string;
}
export interface FundComparatorProps {
  funds: Fund[];
  indices: Index[];
  taxonomy: Taxonomy;
  comparison: Comparison;
  correlations: Record<string, number>;
  onChangeComparison: (comparison: Comparison) => void;
  onChangeCorrelations: (correlations: Record<string, number>) => void;
}
export interface FundComparatorViewProps extends FundComparatorProps {
  referenceOptions: Fund[];
  filteredFunds: Fund[];
  selectedEntities: ComparisonEntity[];
  reference: ComparisonEntity | null;
  filters: ComparatorFilters;
  classes: TaxonomyOption[];
  subclasses: TaxonomyOption[];
  onFiltersChange: (patch: Partial<ComparatorFilters>) => void;
  onReferenceChange: (id: string) => void;
  onFieldChange: (field: 'titulo' | 'fonte' | 'periodo', value: string) => void;
  onToggleParticipant: (id: string, checked: boolean) => void;
  onToggleFiltered: (checked: boolean) => void;
  onToggleIndustry: (checked: boolean) => void;
  onCorrelationChange: (id: string, value: string) => void;
}
