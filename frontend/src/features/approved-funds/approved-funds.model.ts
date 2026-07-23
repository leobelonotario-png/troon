import { useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
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
  const [isFormOpen, setFormOpen] = useState(false);
  const pageFilters =
    type === 'liquido'
      ? liquidView === 'offshore'
        ? { type, shore: 'Offshore' as const }
        : liquidView === 'prev'
          ? { type, recommended: true }
          : { type, shore: 'Onshore' as const, recommended: false }
      : { type };
  const visibleClasses = activeClassId
    ? taxonomy[type].filter((taxonomyClass) => taxonomyClass.id === activeClassId)
    : taxonomy[type];
  const subclassQueries = useQueries({
    queries: visibleClasses.flatMap((taxonomyClass) =>
      taxonomyClass.subtypes.map((subtype) => ({
        queryKey: ['funds', 'approved', type, liquidView, taxonomyClass.id, subtype.id],
        queryFn: () =>
          listApprovedFunds({
            ...pageFilters,
            assetClass: taxonomyClass.id,
            subtype: subtype.id,
            pagination: false,
          }),
      })),
    ),
  });
  const liquidViewCountsQuery = useQuery({
    queryKey: ['funds', 'approved', 'liquid-view-counts'],
    queryFn: getLiquidViewCounts,
    enabled: type === 'liquido',
  });
  const funds = useMemo(
    () =>
      subclassQueries.reduce<Fund[]>((results, query) => {
        for (const fund of query.data?.funds ?? []) {
          const haystack = `${fund.name} ${fund.gestora} ${fund.cnpj}`.toLowerCase();
          if (
            (!filters.q || haystack.includes(filters.q.toLowerCase())) &&
            (!filters.sub || fund.sub === filters.sub) &&
            (!filters.liq || fund.liq === filters.liq) &&
            (!filters.trib || fund.trib === filters.trib)
          )
            results.push(fund);
        }
        return results;
      }, []),
    [filters, subclassQueries],
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
    onFiltersChange: setFilters,
    onLiquidViewChange: setLiquidView,
    onClassChange: (classId) => {
      setActiveClassId(classId);
      setFilters((current) => ({ ...current, sub: '' }));
    },
    onAdd: () => {
      setEditingFund(null);
      setFormOpen(true);
    },
    onEdit: (fund) => {
      setEditingFund(fund);
      setFormOpen(true);
    },
    onCloseForm: () => setFormOpen(false),
    onSaved: () => setFormOpen(false),
  };
}
