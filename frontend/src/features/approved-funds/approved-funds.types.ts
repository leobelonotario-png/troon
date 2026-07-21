import type { Fund, FundType, Taxonomy } from '../../shared/domain/fund.types';
export interface FundFilters {
  q: string;
  classe: string;
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
  liquidView: 'onshore' | 'offshore' | 'prev';
  isFormOpen: boolean;
  editingFund: Fund | null;
  onFiltersChange(filters: FundFilters): void;
  onLiquidViewChange(view: 'onshore' | 'offshore' | 'prev'): void;
  onAdd(): void;
  onEdit(fund: Fund): void;
  onCloseForm(): void;
  onSaved(): void;
}
