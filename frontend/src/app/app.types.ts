import type { Fund, FundType, Taxonomy } from '../shared/domain/fund.types';
import type { Comparison, Index } from '../shared/domain/index.types';
export type AppTab = FundType | 'universo' | 'comparador';
export interface AppViewProps {
  activeTab: AppTab;
  isQuickUpdateOpen: boolean;
  funds: Fund[];
  indices: Index[];
  taxonomy: Taxonomy;
  comparison: Comparison;
  correlations: Record<string, number>;
  onTabChange(tab: AppTab): void;
  onQuickUpdateOpen(): void;
  onQuickUpdateClose(): void;
  onFundsChange(funds: Fund[]): void;
  onIndicesChange(indices: Index[]): void;
  onSaveIndex(index: Index): void;
  onRemoveIndex(id: string): void;
  onAddIndustry(): void;
  onEditIndustry(fund: Fund): void;
  onComparisonChange(comparison: Comparison): void;
  onCorrelationsChange(correlations: Record<string, number>): void;
}
