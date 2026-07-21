import type { Fund } from '../../shared/domain/fund.types';
import type { Index } from '../../shared/domain/index.types';

export interface ComparisonUniverseProps {
  indices: Index[];
  industryFunds: Fund[];
  onSaveIndex: (index: Index) => void;
  onRemoveIndex: (id: string) => void;
  onEditIndustryFund: (fund: Fund) => void;
  onAddIndustryFund: () => void;
}

export interface IndexFormValues {
  name: string;
  ret: string;
  vol: string;
  dashed: boolean;
}

export interface ComparisonUniverseViewProps extends ComparisonUniverseProps {
  editingIndex: Index | null;
  form: IndexFormValues;
  formError: string | null;
  isModalOpen: boolean;
  onOpenNewIndex: () => void;
  onOpenEditIndex: (index: Index) => void;
  onCloseModal: () => void;
  onFormChange: (patch: Partial<IndexFormValues>) => void;
  onSubmitIndex: () => void;
  onToggleDashed: (index: Index) => void;
}
