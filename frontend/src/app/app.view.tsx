import { ApprovedFunds } from '../features/approved-funds';
import { QuickUpdateModal } from '../features/approved-funds/components/quick-update-modal';
import { ComparisonUniverse } from '../features/comparison-universe';
import { FundComparator } from '../features/fund-comparator';
import { Button, Tabs, TabsList, TabsTrigger } from '../shared/components/ui';
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
      <header className="flex items-center justify-between gap-4 px-[max(1.5rem,calc((100vw-80rem)/2))] py-4.5 text-black border-b-primary border-b-[3px]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo Troon Capital" className="h-12 w-fit" />
          <div>
            <h1 className="m-0 text-lg">Troon Capital</h1>
            <p className="m-0 mt-0.5 text-[13px] opacity-75">Dashboard Fundos Aprovados</p>
          </div>
        </div>
        <Button variant="secondary" onClick={props.onQuickUpdateOpen}>
          Atualização rápida
        </Button>
      </header>
      <Tabs
        value={props.activeTab}
        onValueChange={(value) => props.onTabChange(value as AppTab)}
        className="flex gap-1 overflow-x-auto border-b border-border bg-card px-[max(1.5rem,calc((100vw-80rem)/2))]"
        aria-label="Navegação principal"
      >
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-none">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="border-b-[3px] px-[1.125rem] py-4 data-[state=active]:font-bold"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
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
