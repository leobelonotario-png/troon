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
    <section aria-labelledby="universe-title">
      <header className="mb-5">
        <h2 id="universe-title">Universo de Comparação</h2>
      </header>
      <section className="mb-5 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3>Índices / Benchmarks</h3>
          <button className="rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" onClick={props.onOpenNewIndex}>
            Adicionar índice
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm [&_td]:border-b [&_td]:border-border [&_td]:p-2 [&_th]:border-b [&_th]:border-border [&_th]:p-2 [&_th]:text-left">
            <thead>
              <tr>
                <th>Índice</th>
                <th className="text-right">Retorno a.a.</th>
                <th className="text-right">Vol. a.a.</th>
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
                    <i className="mr-2 inline-block size-2.5 rounded-full" style={{ backgroundColor: index.color }} />{' '}
                    <strong>{index.name}</strong>
                  </td>
                  <td className="text-right">{pct(index.ret)}</td>
                  <td className="text-right">{pct(index.vol)}</td>
                  <td>{date(index.updatedAt)}</td>
                  <td>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={index.dashed}
                        onChange={() => props.onToggleDashed(index)}
                        aria-label={`Exibir ${index.name} como linha tracejada`}
                      />
                    </label>
                  </td>
                  <td className="flex gap-2">
                    <button
                      className="rounded border border-border bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                      onClick={() => props.onOpenEditIndex(index)}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive"
                      onClick={() => props.onRemoveIndex(index.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {props.indices.length === 0 && <p className="mt-3 rounded border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Nenhum índice cadastrado.</p>}
        </div>
      </section>
      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3>Fundos da Indústria</h3>
          <button className="rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" onClick={props.onAddIndustryFund}>
            Adicionar fundo da indústria
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm [&_td]:border-b [&_td]:border-border [&_td]:p-2 [&_th]:border-b [&_th]:border-border [&_th]:p-2 [&_th]:text-left">
            <thead>
              <tr>
                <th>Fundo</th>
                <th>CNPJ</th>
                <th>Classe › Subclasse</th>
                <th className="text-right">Retorno a.a.</th>
                <th className="text-right">Vol. a.a.</th>
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
                    <i className="mr-2 inline-block size-2.5 rounded-full bg-muted-foreground" /> <strong>{fund.name}</strong>
                  </td>
                  <td>{fund.cnpj || '—'}</td>
                  <td>{fund.classe ? `${fund.classe} › ${fund.sub}` : '—'}</td>
                  <td className="text-right">{pct(fund.ret)}</td>
                  <td className="text-right">{pct(fund.vol)}</td>
                  <td>{date(fund.updatedAt)}</td>
                  <td>
                    <button
                      className="rounded border border-border bg-secondary px-2 py-1 text-xs text-secondary-foreground"
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
            <p className="mt-3 rounded border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Nenhum fundo da indústria cadastrado.</p>
          )}
        </div>
      </section>
      {props.isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/70 p-4" role="presentation" onMouseDown={props.onCloseModal}>
          <form
            className="w-full max-w-md rounded-lg bg-card p-5 shadow-xl"
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
            <div className="grid gap-3 sm:grid-cols-2">
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={props.form.dashed}
                onChange={(event) => props.onFormChange({ dashed: event.target.checked })}
              />{' '}
              Exibir como linha tracejada
            </label>
            {props.formError && (
              <p className="text-sm text-destructive" role="alert">
                {props.formError}
              </p>
            )}
            <footer>
              <button
                type="button"
                className="rounded border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                onClick={props.onCloseModal}
              >
                Cancelar
              </button>
              <button className="rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" type="submit">
                Salvar índice
              </button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}
