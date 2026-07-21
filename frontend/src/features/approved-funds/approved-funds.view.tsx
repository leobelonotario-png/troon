import type { Fund } from '../../shared/domain/fund.types';
import { Button, EmptyState, Input, Select } from '../../shared/components/ui';
import { taxonomy } from '../../shared/fixtures/funds.fixture';
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
      className="fund-card"
      style={{ borderLeftColor: fund.color }}
      onClick={() => onEdit(fund)}
    >
      <b className="rank">{rank ? `${rank}º` : '–'}</b>
      <span>
        <span className="fund-name">
          {fund.name}
          <small className="score">
            Q {fund.notaQuant?.toFixed(1) ?? '–'} · F {fund.notaFinal?.toFixed(1) ?? '–'}
          </small>
        </span>
        <span className="fund-meta">
          Ret {fund.ret?.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) ?? '–'}% · Vol{' '}
          {fund.vol?.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) ?? '–'}%{' '}
          {fund.shore === 'Offshore' && <em className="tag">Offshore</em>}
          {fund.status === 'Fechado' && <em className="tag closed">Fechado</em>}
        </span>
      </span>
    </button>
  );
}
export function ApprovedFundsView(props: ApprovedFundsViewProps) {
  const classes = taxonomy[props.type];
  const update = (key: keyof FundFilters, value: string) =>
    props.onFiltersChange({
      ...props.filters,
      [key]: value,
      ...(key === 'classe' ? { sub: '' } : {}),
    });
  const grouped = classes
    .map(({ c, s }) => ({
      c,
      groups: s
        .map((sub) => ({
          sub,
          funds: props.funds.filter((fund) => fund.classe === c && fund.sub === sub),
        }))
        .filter((group) => group.funds.length),
    }))
    .filter((group) => group.groups.length);
  return (
    <>
      <section>
        <div className="page-head">
          <div>
            <h1>{props.title}</h1>
            <p>Monitoramento de fundos aprovados e suas métricas.</p>
          </div>
          <Button onClick={props.onAdd}>+ Adicionar fundo</Button>
        </div>
        {props.type === 'liquido' && (
          <div className="segmented" aria-label="Visão de fundos líquidos">
            {(['onshore', 'offshore', 'prev'] as const).map((view) => (
              <button
                className={props.liquidView === view ? 'active' : ''}
                onClick={() => props.onLiquidViewChange(view)}
                key={view}
              >
                {view === 'prev' ? 'Prev' : view[0].toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        )}
        <div className="filters">
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
            <section className="class-section" key={group.c}>
              <h2>{group.c}</h2>
              {group.groups.map(({ sub, funds }) => {
                const ranked = [...funds]
                  .filter((fund) => fund.notaQuant !== null)
                  .sort((a, b) => (b.notaQuant ?? 0) - (a.notaQuant ?? 0));
                return (
                  <div className="subsection" key={sub}>
                    <h3>{sub}</h3>
                    <div className="fund-list">
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
