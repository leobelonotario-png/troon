export interface QuickUpdateModalProps {
  onClose(): void;
}
export interface QuickRow {
  id: string;
  name: string;
  cnpj: string;
  ret: string;
  vol: string;
}
export interface QuickUpdateViewProps {
  date: string;
  rows: QuickRow[];
  paste: string;
  feedback: string;
  onDateChange(date: string): void;
  onRowChange(id: string, key: 'ret' | 'vol', value: string): void;
  onPasteChange(value: string): void;
  onApplyPaste(): void;
  onSave(): void;
  onClose(): void;
}
