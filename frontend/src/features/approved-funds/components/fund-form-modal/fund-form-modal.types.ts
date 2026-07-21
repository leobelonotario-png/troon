import type { Fund, FundDraft, FundType } from '../../../../shared/domain/fund.types';
export interface FundFormModalProps {
  fund: Fund | null;
  initialType: FundType;
  onClose(): void;
  onSaved(): void;
}
export interface FundFormViewProps {
  draft: FundDraft;
  errors: Partial<Record<keyof FundDraft, string>>;
  isEditing: boolean;
  subclasses: string[];
  onChange(key: keyof FundDraft, value: string | boolean | number | null): void;
  onSave(): void;
  onDelete(): void;
  onClose(): void;
}
