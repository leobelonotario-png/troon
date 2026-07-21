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
  <section className="selection-group">
    <h4>{title}</h4>
    {entities.length ? (
      entities.map((entity) => (
        <label key={entity.id} className="selection-item">
          <input
            type="checkbox"
            checked={selected.includes(entity.id)}
            onChange={(event) => onToggle(entity.id, event.target.checked)}
          />
          <i className="entity-dot" style={{ backgroundColor: entity.color }} />{' '}
          <span>{entity.name}</span>
          {'sub' in entity && <small>{entity.sub}</small>}
        </label>
      ))
    ) : (
      <p className="empty-state">Nenhuma opção disponível.</p>
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
    <section className="fund-comparator" aria-labelledby="comparator-title">
      <header className="feature-heading">
        <h2 id="comparator-title">Comparador de Fundos</h2>
      </header>
      <div className="comparator-grid">
        <aside>
          <section className="surface">
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
          <section className="surface">
            <h3>Quem entra na comparação</h3>
            <div className="filter-grid">
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
            <div className="selection-actions">
              <button
                className="button button-secondary button-small"
                onClick={() => props.onToggleFiltered(true)}
              >
                Selecionar filtrados
              </button>
              <button
                className="button button-secondary button-small"
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
            <div className="selection-group">
              <div className="group-title">
                <h4>Fundos da indústria</h4>
                <button
                  className="button button-secondary button-small"
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
          <section className="surface">
            <h3>Correlações — ref. × cada um</h3>
            {props.reference ? (
              props.selectedEntities.length ? (
                <div className="correlation-inputs">
                  {props.selectedEntities.map((entity) => (
                    <label key={entity.id}>
                      <span>
                        <i className="entity-dot" style={{ backgroundColor: entity.color }} />
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
                <p className="empty-state">Nenhum participante selecionado.</p>
              )
            ) : (
              <p className="empty-state">Selecione um fundo de referência.</p>
            )}
          </section>
        </aside>
        <main className="charts">
          <section className="surface">
            <h3>
              Risco × Retorno (%){' '}
              {props.comparison.periodo && <small>{props.comparison.periodo}</small>}
            </h3>
            <RiskReturnChart reference={props.reference} participants={props.selectedEntities} />
            <p className="chart-description">
              O gráfico exibe volatilidade anualizada no eixo horizontal e retorno anualizado no
              vertical.
            </p>
          </section>
          <section className="surface">
            <h3>Correlação — média para janelas de 3M</h3>
            <CorrelationChart
              reference={props.reference}
              participants={props.selectedEntities}
              correlations={props.correlations}
            />
            <p className="chart-description">
              As barras representam correlações informadas, de −1 (inversa) a 1 (direta).
            </p>
          </section>
        </main>
      </div>
    </section>
  );
}
