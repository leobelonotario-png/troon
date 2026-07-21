import { useFundFormModalModel } from './fund-form-modal.model';
import { FundFormModalView } from './fund-form-modal.view';
import type { FundFormModalProps } from './fund-form-modal.types';
export function FundFormModal(props: FundFormModalProps) {
  return <FundFormModalView {...useFundFormModalModel(props)} />;
}
