import type { ChangeEvent } from 'react';
import type { ComparisonEntity, FundComparatorViewProps } from './fund-comparator.types';
import { pairKey } from './fund-comparator.model';
import { RiskReturnChart } from './components/risk-return-chart';
import { CorrelationChart } from './components/correlation-chart';

const Group = ({
  title,
  entities,
  selected,
  onToggle,
}: {
  title: string;
  entities: ComparisonEntity[];
  selected: string[];
  onToggle: (id: string, checked: boolean) => void;
}) => (
  <section className="mt-4 border-t border-border pt-4">
    <h4>{title}</h4>
    {entities.length ? (
      entities.map((entity) => (
        <label key={entity.id} className="flex items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(entity.id)}
            onChange={(event) => onToggle(entity.id, event.target.checked)}
          />
          <i className="size-2.5 rounded-full" style={{ backgroundColor: entity.color }} />{' '}
          <span>{entity.name}</span>
          {'sub' in entity && <small>{entity.sub}</small>}
        </label>
      ))
    ) : (
      <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Nenhuma opção disponível.</p>
    )}
  </section>
);
export function FundComparatorView(props: FundComparatorViewProps) {
  const onFilter = (key: 'type' | 'classe' | 'sub') => (event: ChangeEvent<HTMLSelectElement>) =>
    props.onFiltersChange({ [key]: event.target.value });
  const industry = props.funds
    .filter((fund) => fund.origin === 'industria')
    .map((fund) => ({ ...fund, kind: 'industry' as const }));
  const indices = props.indices.map((index) => ({ ...index, kind: 'index' as const }));
  const selected = props.comparison.selected;
  const selectedIndustry =
    industry.length > 0 && industry.every((item) => selected.includes(item.id));
  return (
    <section aria-labelledby="comparator-title">
      <header className="mb-5">
        <h2 id="comparator-title">Comparador de Fundos</h2>
      </header>
      <div className="grid gap-5 xl:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.5fr)]">
        <aside>
          <section className="mb-4 rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3>Fundo de referência</h3>
            <label>
              Fundo
              <select
                value={props.comparison.refId ?? ''}
                onChange={(event) => props.onReferenceChange(event.target.value)}
              >
                <option value="">— selecione —</option>
                {props.referenceOptions.map((fund) => (
                  <option value={fund.id} key={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Título do comparativo
              <input
                value={props.comparison.titulo}
                onChange={(event) => props.onFieldChange('titulo', event.target.value)}
              />
            </label>
            <label>
              Fonte
              <input
                value={props.comparison.fonte}
                onChange={(event) => props.onFieldChange('fonte', event.target.value)}
              />
            </label>
            <label>
              Período
              <input
                value={props.comparison.periodo}
                onChange={(event) => props.onFieldChange('periodo', event.target.value)}
              />
            </label>
          </section>
          <section className="mb-4 rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3>Quem entra na comparação</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <label>
                Aba
                <select value={props.filters.type} onChange={onFilter('type')}>
                  <option value="">Todas as abas</option>
                  <option value="liquido">Fundos líquidos</option>
                  <option value="iliquido">Fundos ilíquidos</option>
                  <option value="listado">Fundos listados</option>
                </select>
              </label>
              <label>
                Classe
                <select
                  value={props.filters.classe}
                  onChange={onFilter('classe')}
                  disabled={!props.filters.type}
                >
                  <option value="">Todas as classes</option>
                  {props.classes.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Subclasse
                <select
                  value={props.filters.sub}
                  onChange={onFilter('sub')}
                  disabled={!props.filters.classe}
                >
                  <option value="">Todas as subclasses</option>
                  {props.subclasses.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="rounded border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                onClick={() => props.onToggleFiltered(true)}
              >
                Selecionar filtrados
              </button>
              <button
                className="rounded border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                onClick={() => props.onToggleFiltered(false)}
              >
                Limpar filtrados
              </button>
            </div>
            <Group
              title="Fundos aprovados"
              entities={props.filteredFunds.map((fund) => ({ ...fund, kind: 'fund' as const }))}
              selected={selected}
              onToggle={props.onToggleParticipant}
            />
            <Group
              title="Índices"
              entities={indices}
              selected={selected}
              onToggle={props.onToggleParticipant}
            />
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center justify-between gap-2">
                <h4>Fundos da indústria</h4>
                <button
                  className="rounded border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                  onClick={() => props.onToggleIndustry(!selectedIndustry)}
                >
                  {selectedIndustry ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              <Group
                title=""
                entities={industry}
                selected={selected}
                onToggle={props.onToggleParticipant}
              />
            </div>
          </section>
          <section className="mb-4 rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3>Correlações — ref. × cada um</h3>
            {props.reference ? (
              props.selectedEntities.length ? (
                <div className="grid gap-2">
                  {props.selectedEntities.map((entity) => (
                    <label key={entity.id}>
                      <span>
                        <i className="mr-1 inline-block size-2.5 rounded-full" style={{ backgroundColor: entity.color }} />
                        {entity.name}
                      </span>
                      <input
                        aria-label={`Correlação entre ${props.reference?.name} e ${entity.name}`}
                        inputMode="decimal"
                        value={props.correlations[pairKey(props.reference!.id, entity.id)] ?? ''}
                        onChange={(event) =>
                          props.onCorrelationChange(entity.id, event.target.value)
                        }
                        placeholder="-1 a 1"
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Nenhum participante selecionado.</p>
              )
            ) : (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Selecione um fundo de referência.</p>
            )}
          </section>
        </aside>
        <main className="grid gap-4">
          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3>
              Risco × Retorno (%){' '}
              {props.comparison.periodo && <small>{props.comparison.periodo}</small>}
            </h3>
            <RiskReturnChart reference={props.reference} participants={props.selectedEntities} />
            <p className="mt-3 text-sm text-muted-foreground">
              O gráfico exibe volatilidade anualizada no eixo horizontal e retorno anualizado no
              vertical.
            </p>
          </section>
          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3>Correlação — média para janelas de 3M</h3>
            <CorrelationChart
              reference={props.reference}
              participants={props.selectedEntities}
              correlations={props.correlations}
            />
            <p className="mt-3 text-sm text-muted-foreground">
              As barras representam correlações informadas, de −1 (inversa) a 1 (direta).
            </p>
          </section>
        </main>
      </div>
    </section>
  );
}
