import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Comparison } from '../shared/domain/index.types';
import {
  getComparison,
  getTaxonomy,
  listApprovedFunds,
  listIndices,
  removeIndex,
  saveComparison,
  saveFund,
  saveIndex,
} from '../shared/repositories/api.repositories';
import type { AppTab, AppViewProps } from './app.types';
export function useAppModel(): AppViewProps {
  const [activeTab, setActiveTab] = useState<AppTab>('liquido');
  const [isQuickUpdateOpen, setQuickUpdateOpen] = useState(false);
  const queryClient = useQueryClient();
  const needsAllFunds = activeTab === 'universo' || activeTab === 'comparador';
  const fundsQuery = useQuery({
    queryKey: ['funds', 'approved', 'all'],
    queryFn: () => listApprovedFunds(),
    enabled: needsAllFunds,
  });
  const indicesQuery = useQuery({ queryKey: ['indices'], queryFn: listIndices });
  const taxonomyQuery = useQuery({ queryKey: ['taxonomy'], queryFn: getTaxonomy });
  const comparisonQuery = useQuery({ queryKey: ['comparison'], queryFn: getComparison });
  const [comparison, setComparison] = useState<Comparison>({
    refId: null,
    selected: [],
    titulo: 'Comparativo de fundos',
    fonte: 'Troon Capital',
    periodo: '',
  });
  const [correlations, setCorrelations] = useState<Record<string, number>>({});
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['funds'] });
  const fundMutation = useMutation({ mutationFn: saveFund, onSuccess: invalidate });
  const indexMutation = useMutation({
    mutationFn: saveIndex,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['indices'] }),
  });
  const deleteIndexMutation = useMutation({
    mutationFn: removeIndex,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['indices'] }),
  });
  const comparisonMutation = useMutation({
    mutationFn: ({
      next,
      nextCorrelations,
    }: {
      next: Comparison;
      nextCorrelations: Record<string, number>;
    }) => saveComparison(next, nextCorrelations),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comparison'] }),
  });
  const remoteComparison = comparisonQuery.data?.comparison;
  const currentComparison = remoteComparison ?? comparison;
  const currentCorrelations = comparisonQuery.data?.correlations ?? correlations;
  return {
    activeTab,
    isQuickUpdateOpen,
    funds: fundsQuery.data?.funds ?? [],
    indices: indicesQuery.data ?? [],
    taxonomy: taxonomyQuery.data ?? { liquido: [], iliquido: [], listado: [] },
    comparison: currentComparison,
    correlations: currentCorrelations,
    onTabChange: setActiveTab,
    onQuickUpdateOpen: () => setQuickUpdateOpen(true),
    onQuickUpdateClose: () => setQuickUpdateOpen(false),
    onFundsChange: (funds) => {
      const industry = funds.find((fund) => fund.origin === 'industria');
      if (industry) fundMutation.mutate(industry);
    },
    onIndicesChange: (indices) => {
      const index = indices.at(-1);
      if (index) indexMutation.mutate(index);
    },
    onSaveIndex: (index) => indexMutation.mutate(index),
    onRemoveIndex: (id) => deleteIndexMutation.mutate(id),
    onAddIndustry: () => {
      const name = window.prompt('Nome do fundo da indústria');
      if (!name?.trim()) return;
      fundMutation.mutate({
        origin: 'industria',
        name: name.trim(),
        cnpj: '',
        shore: 'Onshore',
        type: 'liquido',
        status: 'Aberto',
        classe: '',
        sub: '',
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
        validated: false,
        obs: '',
      });
    },
    onEditIndustry: (fund) => {
      const name = window.prompt('Nome do fundo da indústria', fund.name);
      if (name?.trim()) fundMutation.mutate({ ...fund, name: name.trim() });
    },
    onComparisonChange: (next) => {
      setComparison(next);
      queryClient.setQueryData(['comparison'], {
        comparison: next,
        correlations: currentCorrelations,
      });
      comparisonMutation.mutate({ next, nextCorrelations: currentCorrelations });
    },
    onCorrelationsChange: (next) => {
      setCorrelations(next);
      queryClient.setQueryData(['comparison'], {
        comparison: currentComparison,
        correlations: next,
      });
      comparisonMutation.mutate({ next: currentComparison, nextCorrelations: next });
    },
  };
}
