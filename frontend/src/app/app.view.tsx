import { ApprovedFunds } from '../features/approved-funds';
import { QuickUpdateModal } from '../features/approved-funds/components/quick-update-modal';
import { ComparisonUniverse } from '../features/comparison-universe';
import { FundComparator } from '../features/fund-comparator';
import { Button } from '../shared/components/ui';
import type { AppTab, AppViewProps } from './app.types';
const tabs: Array<{ id: AppTab; label: string }> = [
  { id: 'liquido', label: 'Fundos Líquidos' },
  { id: 'iliquido', label: 'Fundos Ilíquidos' },
  { id: 'listado', label: 'Fundos Listados' },
  { id: 'universo', label: 'Universo de Comparação' },
  { id: 'comparador', label: 'Comparador' },
];
export function AppView(props: AppViewProps) {
  const validatedFunds = props.funds.filter((fund) => fund.validated);
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 bg-primary px-[max(1.5rem,calc((100vw-80rem)/2))] py-[1.125rem] text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full border-2 border-[#8bcaa8] text-2xl font-extrabold tracking-tight">
            T
          </div>
          <div>
            <h1 className="m-0 text-lg">Troon Capital</h1>
            <p className="m-0 mt-0.5 text-[13px] opacity-75">Dashboard Fundos Aprovados</p>
          </div>
        </div>
        <Button variant="secondary" onClick={props.onQuickUpdateOpen}>
          Atualização rápida
        </Button>
      </header>
      <nav
        className="flex gap-1 overflow-x-auto border-b border-border bg-card px-[max(1.5rem,calc((100vw-80rem)/2))]"
        aria-label="Navegação principal"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`whitespace-nowrap border-0 border-b-[3px] bg-transparent px-[1.125rem] py-4 ${props.activeTab === tab.id ? 'border-primary font-bold text-primary' : 'border-transparent text-muted-foreground'}`}
            onClick={() => props.onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-7 pb-[3.25rem]">
        {props.activeTab === 'liquido' ||
        props.activeTab === 'iliquido' ||
        props.activeTab === 'listado' ? (
          <ApprovedFunds type={props.activeTab} taxonomy={props.taxonomy} />
        ) : props.activeTab === 'universo' ? (
          <ComparisonUniverse
            indices={props.indices}
            industryFunds={validatedFunds.filter((fund) => fund.origin === 'industria')}
            onSaveIndex={props.onSaveIndex}
            onRemoveIndex={props.onRemoveIndex}
            onAddIndustryFund={props.onAddIndustry}
            onEditIndustryFund={props.onEditIndustry}
          />
        ) : (
          <FundComparator
            funds={validatedFunds}
            indices={props.indices}
            taxonomy={props.taxonomy}
            comparison={props.comparison}
            correlations={props.correlations}
            onChangeComparison={props.onComparisonChange}
            onChangeCorrelations={props.onCorrelationsChange}
          />
        )}
      </main>
      <footer className="p-5 text-center text-xs text-muted-foreground">
        Troon Capital · dados de demonstração, sem persistência.
      </footer>
      {props.isQuickUpdateOpen && <QuickUpdateModal onClose={props.onQuickUpdateClose} />}
    </div>
  );
}
