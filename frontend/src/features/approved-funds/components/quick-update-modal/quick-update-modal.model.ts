import { useState } from 'react';
import { fundsRepository } from '../../../../shared/repositories/in-memory.repositories';
import type {
  QuickRow,
  QuickUpdateModalProps,
  QuickUpdateViewProps,
} from './quick-update-modal.types';
const parse = (value: string) => {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};
export function useQuickUpdateModalModel({ onClose }: QuickUpdateModalProps): QuickUpdateViewProps {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<QuickRow[]>(() =>
    fundsRepository
      .list()
      .filter((fund) => fund.origin === 'aprovado')
      .map((fund) => ({
        id: fund.id,
        name: fund.name,
        cnpj: fund.cnpj,
        ret: fund.ret?.toString() ?? '',
        vol: fund.vol?.toString() ?? '',
      })),
  );
  const [paste, setPaste] = useState('');
  const [feedback, setFeedback] = useState('');
  const onApplyPaste = () => {
    const sources = fundsRepository.list();
    let matched = 0;
    const unknown: string[] = [];
    const byId = new Map(rows.map((row) => [row.id, row]));
    paste
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => {
        const [key, ret, vol] = line.split(/[\t;]/).map((cell) => cell.trim());
        const fund = sources.find(
          (item) =>
            item.name.toLowerCase() === key.toLowerCase() || (item.cnpj && item.cnpj === key),
        );
        if (!fund) {
          unknown.push(key);
          return;
        }
        matched++;
        const row = byId.get(fund.id);
        if (row) {
          row.ret = ret ?? row.ret;
          row.vol = vol ?? row.vol;
        }
      });
    setRows([...byId.values()]);
    setFeedback(
      `${matched} linha(s) preenchida(s)${unknown.length ? `. Não reconhecidas: ${unknown.join(', ')}` : '.'}`,
    );
  };
  const onSave = () => {
    const invalid = rows.some((row) => parse(row.ret) === null || parse(row.vol) === null);
    if (invalid) {
      setFeedback('Preencha retorno e volatilidade com números válidos.');
      return;
    }
    fundsRepository.updateMetrics(
      rows.map((row) => ({
        id: row.id,
        ret: parse(row.ret),
        vol: parse(row.vol),
        updatedAt: date,
      })),
    );
    onClose();
  };
  return {
    date,
    rows,
    paste,
    feedback,
    onDateChange: setDate,
    onRowChange: (id, key, value) =>
      setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row))),
    onPasteChange: setPaste,
    onApplyPaste,
    onSave,
    onClose,
  };
}
