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
          {fund.shore === 'Offshore' && (
            <em className="ml-1 rounded bg-secondary px-1.5 py-0.5 not-italic text-secondary-foreground">
              Offshore
            </em>
          )}
          {fund.status === 'Fechado' && (
            <em className="ml-1 rounded bg-destructive/15 px-1.5 py-0.5 not-italic text-destructive">
              Fechado
            </em>
          )}
        </span>
      </span>
    </button>
  );
}
export function ApprovedFundsView(props: ApprovedFundsViewProps) {
  const classes = props.taxonomy[props.type];
  const visibleClasses = props.activeClassId
    ? classes.filter((taxonomyClass) => taxonomyClass.id === props.activeClassId)
    : classes;
  const visibleSubtypes = visibleClasses.reduce<Array<{ id: string; label: string; key: string }>>(
    (result, taxonomyClass) => {
      for (const subtype of taxonomyClass.subtypes)
        result.push({ ...subtype, key: `${taxonomyClass.id}-${subtype.id}` });
      return result;
    },
    [],
  );
  const update = (key: keyof FundFilters, value: string) =>
    props.onFiltersChange({
      ...props.filters,
      [key]: value,
    });
  const grouped = visibleClasses.reduce<
    Array<{
      id: string;
      label: string;
      groups: Array<{ id: string; label: string; funds: Fund[] }>;
    }>
  >((result, taxonomyClass) => {
    const groups = taxonomyClass.subtypes.map((subtype) => {
      const funds = props.funds.filter(
        (fund) => fund.classe === taxonomyClass.id && fund.sub === subtype.id,
      );
      return { ...subtype, funds };
    });
    result.push({ ...taxonomyClass, groups });
    return result;
  }, []);
  return (
    <>
      <section>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h1 className="mr-auto text-xl font-bold">{props.title}</h1>
          {props.type === 'liquido' && (
            <div
              className="inline-flex rounded-md border border-border bg-card p-1"
              aria-label="Visão de fundos líquidos"
            >
              {(['onshore', 'offshore', 'prev'] as const).map((view) => (
                <button
                  type="button"
                  className={`rounded px-3 py-1.5 text-sm ${props.liquidView === view ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                  onClick={() => props.onLiquidViewChange(view)}
                  key={view}
                >
                  {view === 'prev' ? 'Prev' : view[0].toUpperCase() + view.slice(1)} (
                  {props.liquidViewCounts?.[view] ?? '–'})
                </button>
              ))}
            </div>
          )}
          <Button onClick={props.onAdd}>+ Adicionar fundo</Button>
        </div>
        <div
          className="mb-4 flex gap-1 overflow-x-auto border-b border-border"
          aria-label="Classes de ativos"
        >
          <button
            type="button"
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${!props.activeClassId ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground'}`}
            onClick={() => props.onClassChange('')}
          >
            Todas as classes
          </button>
          {classes.map((taxonomyClass) => (
            <button
              type="button"
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${props.activeClassId === taxonomyClass.id ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground'}`}
              onClick={() => props.onClassChange(taxonomyClass.id)}
              key={taxonomyClass.id}
            >
              {taxonomyClass.label}
            </button>
          ))}
        </div>
        <div className="mb-6 grid gap-2 md:grid-cols-3 xl:grid-cols-5">
          <Input
            aria-label="Buscar fundo"
            placeholder="Buscar por nome, CNPJ ou gestora"
            value={props.filters.q}
            onChange={(event) => update('q', event.target.value)}
          />
          <Select
            aria-label="Subclasse"
            value={props.filters.sub}
            onChange={(event) => update('sub', event.target.value)}
          >
            <option value="">Todas as subclasses</option>
            {visibleSubtypes.map((subtype) => (
              <option key={subtype.key} value={subtype.id}>
                {subtype.label}
              </option>
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
            onClick={() => props.onFiltersChange({ q: '', sub: '', liq: '', trib: '' })}
          >
            Limpar
          </Button>
        </div>
        {grouped.length ? (
          grouped.map((group) => (
            <section className="mb-8" key={group.id}>
              <h2>
                {group.label} (
                {group.groups.reduce((total, subgroup) => total + subgroup.funds.length, 0)})
              </h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.groups.map(({ id, label, funds }) => {
                  const ranked = [...funds]
                    .filter((fund) => fund.notaQuant !== null)
                    .sort((a, b) => (b.notaQuant ?? 0) - (a.notaQuant ?? 0));
                  return (
                    <section className="rounded-md border border-border bg-card p-3" key={id}>
                      <h3 className="mb-3 border-b border-border pb-2">{label}</h3>
                      <div className="flex flex-col gap-2.5">
                        {funds.length ? (
                          funds.map((fund) => (
                            <FundCard
                              key={fund.id}
                              fund={fund}
                              rank={
                                ranked.findIndex((rankedFund) => rankedFund.id === fund.id) + 1 ||
                                null
                              }
                              onEdit={props.onEdit}
                            />
                          ))
                        ) : (
                          <p className="py-3 text-center text-sm italic text-muted-foreground">
                            Nenhum fundo nesta subclasse.
                          </p>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
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
