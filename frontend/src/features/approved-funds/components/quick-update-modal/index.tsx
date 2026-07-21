import { useQuickUpdateModalModel } from './quick-update-modal.model';
import { QuickUpdateModalView } from './quick-update-modal.view';
import type { QuickUpdateModalProps } from './quick-update-modal.types';
export function QuickUpdateModal(props: QuickUpdateModalProps) {
  return <QuickUpdateModalView {...useQuickUpdateModalModel(props)} />;
}
