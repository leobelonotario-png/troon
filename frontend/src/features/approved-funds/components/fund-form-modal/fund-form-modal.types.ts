import type {
  Fund,
  FundDraft,
  FundType,
  Taxonomy,
  TaxonomyOption,
} from '../../../../shared/domain/fund.types';
export interface FundFormModalProps {
  fund: Fund | null;
  initialType: FundType;
  onClose(): void;
  onSaved(): void;
}
export interface FundSearchViewProps {
  query: string;
  results: Fund[];
  selectedId: string | null;
  hasRun: boolean;
  isLoading: boolean;
  error: string | null;
  onQueryChange(value: string): void;
  onSearch(): void;
  onSelect(id: string): void;
  onConfirm(): void;
}
export interface FundFormViewProps {
  draft: FundDraft;
  errors: Partial<Record<keyof FundDraft, string>>;
  isEditing: boolean;
  isSelectingFund: boolean;
  subclasses: TaxonomyOption[];
  taxonomy: Taxonomy;
  search: FundSearchViewProps;
  onBackToSearch(): void;
  onChange(key: keyof FundDraft, value: string | boolean | number | null): void;
  onSave(): void;
  onDelete(): void;
  onClose(): void;
}
