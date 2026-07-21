import type { FormEvent } from 'react';
import type { ComparisonUniverseViewProps } from './comparison-universe.types';

const pct = (value: number | null) =>
  value === null ? '—' : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
const date = (value: string | null) =>
  value ? new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`)) : '—';

export function ComparisonUniverseView(props: ComparisonUniverseViewProps) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    props.onSubmitIndex();
  };
  return (
    <section className="comparison-universe" aria-labelledby="universe-title">
      <header className="feature-heading">
        <h2 id="universe-title">Universo de Comparação</h2>
      </header>
      <section className="surface">
        <div className="surface-heading">
          <h3>Índices / Benchmarks</h3>
          <button className="button" onClick={props.onOpenNewIndex}>
            Adicionar índice
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Índice</th>
                <th className="numeric">Retorno a.a.</th>
                <th className="numeric">Vol. a.a.</th>
                <th>Última atualização</th>
                <th>Tracejado</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {props.indices.map((index) => (
                <tr key={index.id}>
                  <td>
                    <i className="entity-dot" style={{ backgroundColor: index.color }} />{' '}
                    <strong>{index.name}</strong>
                  </td>
                  <td className="numeric">{pct(index.ret)}</td>
                  <td className="numeric">{pct(index.vol)}</td>
                  <td>{date(index.updatedAt)}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={index.dashed}
                        onChange={() => props.onToggleDashed(index)}
                        aria-label={`Exibir ${index.name} como linha tracejada`}
                      />
                      <span />
                    </label>
                  </td>
                  <td className="row-actions">
                    <button
                      className="button button-secondary button-small"
                      onClick={() => props.onOpenEditIndex(index)}
                    >
                      Editar
                    </button>
                    <button
                      className="button button-danger button-small"
                      onClick={() => props.onRemoveIndex(index.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {props.indices.length === 0 && <p className="empty-state">Nenhum índice cadastrado.</p>}
        </div>
      </section>
      <section className="surface">
        <div className="surface-heading">
          <h3>Fundos da Indústria</h3>
          <button className="button" onClick={props.onAddIndustryFund}>
            Adicionar fundo da indústria
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Fundo</th>
                <th>CNPJ</th>
                <th>Classe › Subclasse</th>
                <th className="numeric">Retorno a.a.</th>
                <th className="numeric">Vol. a.a.</th>
                <th>Última atualização</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {props.industryFunds.map((fund) => (
                <tr key={fund.id}>
                  <td>
                    <i className="entity-dot entity-dot-muted" /> <strong>{fund.name}</strong>
                  </td>
                  <td>{fund.cnpj || '—'}</td>
                  <td>{fund.classe ? `${fund.classe} › ${fund.sub}` : '—'}</td>
                  <td className="numeric">{pct(fund.ret)}</td>
                  <td className="numeric">{pct(fund.vol)}</td>
                  <td>{date(fund.updatedAt)}</td>
                  <td className="row-actions">
                    <button
                      className="button button-secondary button-small"
                      onClick={() => props.onEditIndustryFund(fund)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {props.industryFunds.length === 0 && (
            <p className="empty-state">Nenhum fundo da indústria cadastrado.</p>
          )}
        </div>
      </section>
      {props.isModalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={props.onCloseModal}>
          <form
            className="modal"
            aria-labelledby="index-modal-title"
            onSubmit={submit}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <h3 id="index-modal-title">
                {props.editingIndex ? 'Editar índice' : 'Adicionar índice'}
              </h3>
            </header>
            <label>
              Nome
              <input
                autoFocus
                value={props.form.name}
                onChange={(event) => props.onFormChange({ name: event.target.value })}
              />
            </label>
            <div className="form-grid">
              <label>
                Retorno a.a. (%)
                <input
                  inputMode="decimal"
                  value={props.form.ret}
                  onChange={(event) => props.onFormChange({ ret: event.target.value })}
                />
              </label>
              <label>
                Vol. a.a. (%)
                <input
                  inputMode="decimal"
                  value={props.form.vol}
                  onChange={(event) => props.onFormChange({ vol: event.target.value })}
                />
              </label>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={props.form.dashed}
                onChange={(event) => props.onFormChange({ dashed: event.target.checked })}
              />{' '}
              Exibir como linha tracejada
            </label>
            {props.formError && (
              <p className="form-error" role="alert">
                {props.formError}
              </p>
            )}
            <footer>
              <button
                type="button"
                className="button button-secondary"
                onClick={props.onCloseModal}
              >
                Cancelar
              </button>
              <button className="button" type="submit">
                Salvar índice
              </button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}
