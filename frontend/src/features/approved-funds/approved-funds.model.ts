import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listFunds } from '../../shared/repositories/api.repositories';
import type { Fund, FundType } from '../../shared/domain/fund.types';
import type { ApprovedFundsViewProps, FundFilters } from './approved-funds.types';
const labels: Record<FundType, string> = {
  liquido: 'Fundos Líquidos',
  iliquido: 'Fundos Ilíquidos',
  listado: 'Fundos Listados',
};
const blank: FundFilters = { q: '', classe: '', sub: '', liq: '', trib: '' };
export function useApprovedFundsModel(type: FundType): ApprovedFundsViewProps {
  const [filters, setFilters] = useState(blank);
  const [liquidView, setLiquidView] = useState<'onshore' | 'offshore' | 'prev'>('onshore');
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const fundsQuery = useQuery({ queryKey: ['funds'], queryFn: listFunds });
  const funds = useMemo(
    () =>
      (fundsQuery.data ?? []).filter((fund) => {
        if (fund.origin !== 'aprovado' || fund.type !== type) return false;
        if (
          type === 'liquido' &&
          (liquidView === 'offshore'
            ? fund.shore !== 'Offshore'
            : liquidView === 'prev'
              ? !fund.prev
              : fund.shore === 'Offshore' || fund.prev)
        )
          return false;
        const haystack = `${fund.name} ${fund.gestora} ${fund.cnpj}`.toLowerCase();
        return (
          (!filters.q || haystack.includes(filters.q.toLowerCase())) &&
          (!filters.classe || fund.classe === filters.classe) &&
          (!filters.sub || fund.sub === filters.sub) &&
          (!filters.liq || fund.liq === filters.liq) &&
          (!filters.trib || fund.trib === filters.trib)
        );
      }),
    [type, filters, liquidView, fundsQuery.data],
  );
  return {
    type,
    title: labels[type],
    funds,
    filters,
    liquidView,
    isFormOpen,
    editingFund,
    onFiltersChange: setFilters,
    onLiquidViewChange: setLiquidView,
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
