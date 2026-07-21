import { useMemo, useState } from 'react';
import { taxonomy } from '../../../../shared/fixtures/funds.fixture';
import { fundsRepository } from '../../../../shared/repositories/in-memory.repositories';
import type { FundDraft, FundType } from '../../../../shared/domain/fund.types';
import type { FundFormModalProps, FundFormViewProps } from './fund-form-modal.types';
const newDraft = (type: FundType): FundDraft => ({
  origin: 'aprovado',
  name: '',
  cnpj: '',
  shore: 'Onshore',
  type,
  status: 'Aberto',
  classe: taxonomy[type][0].c,
  sub: taxonomy[type][0].s[0],
  bench: '',
  liq: '',
  trib: '',
  gestora: '',
  data: '',
  prev: false,
  notaQuant: null,
  notaFinal: null,
  ret: null,
  vol: null,
  obs: '',
});
export function useFundFormModalModel({
  fund,
  initialType,
  onClose,
  onSaved,
}: FundFormModalProps): FundFormViewProps {
  const [draft, setDraft] = useState<FundDraft>(fund ?? newDraft(initialType));
  const [errors, setErrors] = useState<Partial<Record<keyof FundDraft, string>>>({});
  const subclasses = useMemo(
    () => taxonomy[draft.type].find((item) => item.c === draft.classe)?.s ?? [],
    [draft.type, draft.classe],
  );
  const onChange = (key: keyof FundDraft, value: string | boolean | number | null) =>
    setDraft((current) => {
      const next = { ...current, [key]: value } as FundDraft;
      if (key === 'type') {
        const type = value as FundType;
        next.classe = taxonomy[type][0].c;
        next.sub = taxonomy[type][0].s[0];
      }
      if (key === 'classe')
        next.sub = taxonomy[next.type].find((item) => item.c === value)?.s[0] ?? '';
      return next;
    });
  const onSave = () => {
    const nextErrors: Partial<Record<keyof FundDraft, string>> = {};
    if (!draft.name.trim()) nextErrors.name = 'Informe o nome do fundo.';
    if (!draft.classe) nextErrors.classe = 'Selecione a classe.';
    if (!draft.sub) nextErrors.sub = 'Selecione a subclasse.';
    if (draft.ret === null || Number.isNaN(draft.ret)) nextErrors.ret = 'Informe o retorno.';
    if (draft.vol === null || Number.isNaN(draft.vol)) nextErrors.vol = 'Informe a volatilidade.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    fundsRepository.save(draft);
    onSaved();
  };
  return {
    draft,
    errors,
    isEditing: Boolean(fund),
    subclasses,
    onChange,
    onSave,
    onDelete: () => {
      if (fund) {
        fundsRepository.remove(fund.id);
        onSaved();
      }
    },
    onClose,
  };
}
