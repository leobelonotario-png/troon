import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLiquidViewCounts, listApprovedFunds } from '../../shared/repositories/api.repositories';
import type { LiquidView } from '../../shared/repositories/api.repositories';
import type { Fund, FundType, Taxonomy } from '../../shared/domain/fund.types';
import type { ApprovedFundsViewProps, FundFilters } from './approved-funds.types';
const labels: Record<FundType, string> = {
  liquido: 'Fundos Líquidos',
  iliquido: 'Fundos Ilíquidos',
  listado: 'Fundos Listados',
};
const blank: FundFilters = { q: '', sub: '', liq: '', trib: '' };
export function useApprovedFundsModel(type: FundType, taxonomy: Taxonomy): ApprovedFundsViewProps {
  const [filters, setFilters] = useState(blank);
  const [liquidView, setLiquidView] = useState<LiquidView>('onshore');
  const [activeClassId, setActiveClassId] = useState('');
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [initialClassification, setInitialClassification] = useState<{
    classe: string;
    sub: string;
  } | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const approvedFundsQuery = useQuery({
    queryKey: ['funds', 'approved'],
    queryFn: listApprovedFunds,
  });
  const liquidViewCountsQuery = useQuery({
    queryKey: ['funds', 'approved', 'liquid-view-counts'],
    queryFn: getLiquidViewCounts,
    enabled: type === 'liquido',
  });
  const funds = useMemo(
    () =>
      (approvedFundsQuery.data?.funds ?? []).filter((fund) => {
        const haystack = `${fund.name} ${fund.gestora} ${fund.cnpj}`.toLowerCase();
        const matchesLiquidView =
          type !== 'liquido' ||
          (liquidView === 'offshore' && fund.shore === 'Offshore') ||
          (liquidView === 'prev' && fund.prev) ||
          (liquidView === 'onshore' && fund.shore === 'Onshore' && !fund.prev);
        return (
          fund.type === type &&
          matchesLiquidView &&
          (!filters.q || haystack.includes(filters.q.toLowerCase())) &&
          (!filters.sub || fund.sub === filters.sub) &&
          (!filters.liq || fund.liq === filters.liq) &&
          (!filters.trib || fund.trib === filters.trib)
        );
      }),
    [approvedFundsQuery.data, filters, liquidView, type],
  );
  return {
    type,
    title: labels[type],
    funds,
    taxonomy,
    filters,
    liquidView,
    liquidViewCounts: liquidViewCountsQuery.data,
    activeClassId,
    isFormOpen,
    editingFund,
    initialClassification,
    onFiltersChange: setFilters,
    onLiquidViewChange: setLiquidView,
    onClassChange: (classId) => {
      setActiveClassId(classId);
      setFilters((current) => ({ ...current, sub: '' }));
    },
    onAdd: () => {
      setEditingFund(null);
      setInitialClassification(null);
      setFormOpen(true);
    },
    onAddToSubclass: (classe, sub) => {
      setEditingFund(null);
      setInitialClassification({ classe, sub });
      setFormOpen(true);
    },
    onEdit: (fund) => {
      setEditingFund(fund);
      setInitialClassification(null);
      setFormOpen(true);
    },
    onCloseForm: () => setFormOpen(false),
    onSaved: () => setFormOpen(false),
  };
}
