import type { Fund } from '../../shared/domain/fund.types';
import { Button, EmptyState, Input, Select } from '../../shared/components/ui';
import { FundFormModal } from './components/fund-form-modal';
import type { ApprovedFundsViewProps, FundFilters } from './approved-funds.types';
function FundCard({
  fund,
  rank,
  onEdit,
}: {
  fund: Fund;
  rank: number | null;
  onEdit(fund: Fund): void;
}) {
  return (
    <button
      type="button"
      className="flex gap-2.5 rounded-md border border-border border-l-[5px] bg-card p-2.5 text-left shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeftColor: fund.color }}
      onClick={() => onEdit(fund)}
    >
      <b className="text-lg leading-none text-primary">{rank ? `${rank}º` : '–'}</b>
      <span>
        <span className="flex justify-between gap-2 text-sm font-bold">
          {fund.name}
          <small className="font-normal text-muted-foreground">
            Q {fund.notaQuant?.toFixed(1) ?? '–'} · F {fund.notaFinal?.toFixed(1) ?? '–'}
          </small>
        </span>
        <span className="mt-1.5 block text-xs text-muted-foreground">
          Ret {fund.ret?.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) ?? '–'}% · Vol{' '}
          {fund.vol?.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) ?? '–'}%{' '}
          {fund.shore === 'Offshore' && <em className="ml-1 rounded bg-secondary px-1.5 py-0.5 not-italic text-secondary-foreground">Offshore</em>}
          {fund.status === 'Fechado' && <em className="ml-1 rounded bg-destructive/15 px-1.5 py-0.5 not-italic text-destructive">Fechado</em>}
        </span>
      </span>
    </button>
  );
}
export function ApprovedFundsView(props: ApprovedFundsViewProps) {
  const classes = props.taxonomy[props.type];
  const update = (key: keyof FundFilters, value: string) =>
    props.onFiltersChange({
      ...props.filters,
      [key]: value,
      ...(key === 'classe' ? { sub: '' } : {}),
    });
  const grouped = classes.reduce<Array<{ c: string; groups: Array<{ sub: string; funds: Fund[] }> }>>(
    (result, { c, s }) => {
      const groups = s.reduce<Array<{ sub: string; funds: Fund[] }>>((subclasses, sub) => {
        const funds = props.funds.filter((fund) => fund.classe === c && fund.sub === sub);
        if (funds.length) subclasses.push({ sub, funds });
        return subclasses;
      }, []);
      if (groups.length) result.push({ c, groups });
      return result;
    },
    [],
  );
  return (
    <>
      <section>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1>{props.title}</h1>
            <p>Monitoramento de fundos aprovados e suas métricas.</p>
          </div>
          <Button onClick={props.onAdd}>+ Adicionar fundo</Button>
        </div>
        {props.type === 'liquido' && (
          <div className="mb-4 inline-flex rounded-md border border-border bg-card p-1" aria-label="Visão de fundos líquidos">
            {(['onshore', 'offshore', 'prev'] as const).map((view) => (
              <button
                type="button"
                className={`rounded px-3 py-1.5 text-sm ${props.liquidView === view ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                onClick={() => props.onLiquidViewChange(view)}
                key={view}
              >
                {view === 'prev' ? 'Prev' : view[0].toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        )}
        <div className="mb-6 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          <Input
            aria-label="Buscar fundo"
            placeholder="Buscar por nome, CNPJ ou gestora"
            value={props.filters.q}
            onChange={(event) => update('q', event.target.value)}
          />
          <Select
            aria-label="Classe"
            value={props.filters.classe}
            onChange={(event) => update('classe', event.target.value)}
          >
            <option value="">Todas as classes</option>
            {classes.map((item) => (
              <option key={item.c}>{item.c}</option>
            ))}
          </Select>
          <Select
            aria-label="Subclasse"
            value={props.filters.sub}
            onChange={(event) => update('sub', event.target.value)}
          >
            <option value="">Todas as subclasses</option>
            {classes
              .find((item) => item.c === props.filters.classe)
              ?.s.map((sub) => (
                <option key={sub}>{sub}</option>
              ))}
          </Select>
          <Input
            aria-label="Liquidez"
            placeholder="Liquidez"
            value={props.filters.liq}
            onChange={(event) => update('liq', event.target.value)}
          />
          <Input
            aria-label="Tributação"
            placeholder="Tributação"
            value={props.filters.trib}
            onChange={(event) => update('trib', event.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => props.onFiltersChange({ q: '', classe: '', sub: '', liq: '', trib: '' })}
          >
            Limpar
          </Button>
        </div>
        {grouped.length ? (
          grouped.map((group) => (
            <section className="mb-8" key={group.c}>
              <h2>{group.c}</h2>
              {group.groups.map(({ sub, funds }) => {
                const ranked = [...funds]
                  .filter((fund) => fund.notaQuant !== null)
                  .sort((a, b) => (b.notaQuant ?? 0) - (a.notaQuant ?? 0));
                return (
                  <div className="mb-5" key={sub}>
                    <h3>{sub}</h3>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                      {funds.map((fund) => (
                        <FundCard
                          key={fund.id}
                          fund={fund}
                          rank={
                            ranked.findIndex((rankedFund) => rankedFund.id === fund.id) + 1 || null
                          }
                          onEdit={props.onEdit}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          ))
        ) : (
          <EmptyState>Nenhum fundo encontrado para os filtros selecionados.</EmptyState>
        )}
      </section>
      {props.isFormOpen && (
        <FundFormModal
          fund={props.editingFund}
          initialType={props.type}
          onClose={props.onCloseForm}
          onSaved={props.onSaved}
        />
      )}
    </>
  );
}
