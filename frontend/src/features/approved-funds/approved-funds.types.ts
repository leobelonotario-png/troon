import type { Fund, FundType, Taxonomy } from '../../shared/domain/fund.types';
import type { LiquidView, LiquidViewCounts } from '../../shared/repositories/api.repositories';
export interface FundFilters {
  q: string;
  sub: string;
  liq: string;
  trib: string;
}
export interface ApprovedFundsViewProps {
  type: FundType;
  title: string;
  funds: Fund[];
  taxonomy: Taxonomy;
  filters: FundFilters;
  liquidView: LiquidView;
  liquidViewCounts?: LiquidViewCounts;
  activeClassId: string;
  isFormOpen: boolean;
  editingFund: Fund | null;
  initialClassification: { classe: string; sub: string } | null;
  onFiltersChange(filters: FundFilters): void;
  onLiquidViewChange(view: LiquidView): void;
  onClassChange(classId: string): void;
  onAdd(): void;
  onAddToSubclass(classId: string, subclassId: string): void;
  onEdit(fund: Fund): void;
  onCloseForm(): void;
  onSaved(): void;
}
