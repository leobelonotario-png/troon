import { useState } from 'react';
import type { Index } from '../../shared/domain/index.types';
import type {
  ComparisonUniverseProps,
  ComparisonUniverseViewProps,
  IndexFormValues,
} from './comparison-universe.types';

const emptyForm: IndexFormValues = { name: '', ret: '', vol: '', dashed: false };
const asForm = (index: Index): IndexFormValues => ({
  name: index.name,
  ret: String(index.ret ?? ''),
  vol: String(index.vol ?? ''),
  dashed: index.dashed,
});

export function useComparisonUniverseModel(
  props: ComparisonUniverseProps,
): ComparisonUniverseViewProps {
  const [editingIndex, setEditingIndex] = useState<Index | null>(null);
  const [form, setForm] = useState<IndexFormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const close = () => {
    setModalOpen(false);
    setFormError(null);
  };
  const openNew = () => {
    setEditingIndex(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };
  const openEdit = (index: Index) => {
    setEditingIndex(index);
    setForm(asForm(index));
    setFormError(null);
    setModalOpen(true);
  };
  const submit = () => {
    const ret = Number(form.ret.replace(',', '.'));
    const vol = Number(form.vol.replace(',', '.'));
    if (!form.name.trim() || !Number.isFinite(ret) || !Number.isFinite(vol)) {
      setFormError('Informe nome, retorno e volatilidade com valores numéricos.');
      return;
    }
    props.onSaveIndex({
      id: editingIndex?.id ?? `idx-${crypto.randomUUID()}`,
      name: form.name.trim(),
      ret,
      vol,
      dashed: form.dashed,
      color: editingIndex?.color ?? '#5B9BD5',
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    close();
  };
  return {
    ...props,
    editingIndex,
    form,
    formError,
    isModalOpen,
    onOpenNewIndex: openNew,
    onOpenEditIndex: openEdit,
    onCloseModal: close,
    onFormChange: (patch) => setForm((current) => ({ ...current, ...patch })),
    onSubmitIndex: submit,
    onToggleDashed: (index) => props.onSaveIndex({ ...index, dashed: !index.dashed }),
  };
}
