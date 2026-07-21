import { useState } from 'react';
import type { Fund } from '../shared/domain/fund.types';
import type { Comparison } from '../shared/domain/index.types';
import { taxonomy } from '../shared/fixtures/funds.fixture';
import { fundsRepository, indicesRepository } from '../shared/repositories/in-memory.repositories';
import type { AppTab, AppViewProps } from './app.types';
export function useAppModel(): AppViewProps {
  const [activeTab, setActiveTab] = useState<AppTab>('liquido');
  const [isQuickUpdateOpen, setQuickUpdateOpen] = useState(false);
  const [funds, setFunds] = useState<Fund[]>(() => fundsRepository.list());
  const [indices, setIndices] = useState(() => indicesRepository.list());
  const [comparison, setComparison] = useState<Comparison>({
    refId: null,
    selected: [],
    titulo: 'Comparativo de fundos',
    fonte: 'Troon Capital',
    periodo: '',
  });
  const [correlations, setCorrelations] = useState<Record<string, number>>({});
  return {
    activeTab,
    isQuickUpdateOpen,
    funds,
    indices,
    taxonomy,
    comparison,
    correlations,
    onTabChange: setActiveTab,
    onQuickUpdateOpen: () => setQuickUpdateOpen(true),
    onQuickUpdateClose: () => setQuickUpdateOpen(false),
    onFundsChange: setFunds,
    onIndicesChange: setIndices,
    onComparisonChange: setComparison,
    onCorrelationsChange: setCorrelations,
  };
}
