import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { importFundsCsv, listFunds, updateFundMetrics } from '../../../../shared/repositories/api.repositories';
import type { QuickRow, QuickUpdateModalProps, QuickUpdateViewProps } from './quick-update-modal.types';

const parse = (value: string) => { const parsed = Number(value.trim().replace(',', '.')); return Number.isFinite(parsed) ? parsed : null; };
export function useQuickUpdateModalModel({ onClose }: QuickUpdateModalProps): QuickUpdateViewProps {
  const queryClient = useQueryClient();
  const fundsQuery = useQuery({ queryKey: ['funds'], queryFn: listFunds });
  const updateMutation = useMutation({ mutationFn: updateFundMetrics, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['funds'] }); onClose(); } });
  const importMutation = useMutation({ mutationFn: importFundsCsv, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['funds'] }); setFeedback('CSV importado com sucesso.'); } });
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<QuickRow[]>([]);
  const [paste, setPaste] = useState('');
  const [feedback, setFeedback] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  useEffect(() => {
    if (!rows.length && fundsQuery.data) {
      setRows(fundsQuery.data.reduce<QuickRow[]>((result, fund) => {
        if (fund.validated && fund.origin === 'aprovado') result.push({ id: fund.id, name: fund.name, cnpj: fund.cnpj, ret: fund.ret?.toString() ?? '', vol: fund.vol?.toString() ?? '' });
        return result;
      }, []));
    }
  }, [fundsQuery.data, rows.length]);
  const onApplyPaste = () => {
    const sources = (fundsQuery.data ?? []).filter((fund) => fund.validated && fund.origin === 'aprovado'); let matched = 0; const unknown: string[] = []; const byId = new Map(rows.map(row => [row.id, row]));
    paste.split(/\r?\n/).filter(Boolean).forEach(line => { const [key, ret, vol] = line.split(/[\t;]/).map(cell => cell.trim()); const fund = sources.find(item => item.name.toLowerCase() === key.toLowerCase() || (item.cnpj && item.cnpj === key)); if (!fund) { unknown.push(key); return; } matched++; const row = byId.get(fund.id); if (row) { row.ret = ret ?? row.ret; row.vol = vol ?? row.vol; } });
    setRows([...byId.values()]); setFeedback(`${matched} linha(s) preenchida(s)${unknown.length ? `. Não reconhecidas: ${unknown.join(', ')}` : '.'}`);
  };
  const onSave = () => {
    if (rows.some(row => parse(row.ret) === null || parse(row.vol) === null)) { setFeedback('Preencha retorno e volatilidade com números válidos.'); return; }
    updateMutation.mutate(rows.map(row => ({ id: row.id, ret: parse(row.ret), vol: parse(row.vol), updatedAt: date })));
  };
  return { date, rows, paste, feedback, csvFileName: csvFile?.name ?? '', isCsvSubmitting: importMutation.isPending, onDateChange: setDate, onRowChange: (id, key, value) => setRows(current => current.map(row => row.id === id ? { ...row, [key]: value } : row)), onPasteChange: setPaste, onApplyPaste, onCsvChange: setCsvFile, onImportCsv: () => { if (csvFile) importMutation.mutate(csvFile); else setFeedback('Selecione um arquivo CSV.'); }, onSave, onClose };
}
