import { Button, Field, Input, Modal, Select } from '../../../../shared/components/ui';
import type { FundDraft } from '../../../../shared/domain/fund.types';
import type { FundFormViewProps } from './fund-form-modal.types';

const numberKeys = new Set<keyof FundDraft>(['notaQuant', 'notaFinal', 'ret', 'vol']);
export function FundFormModalView(props: FundFormViewProps) {
  const value = (key: keyof FundDraft): string | number => {
    const item = props.draft[key];
    return typeof item === 'string' || typeof item === 'number' ? item : '';
  };
  const change = (key: keyof FundDraft, raw: string | boolean) =>
    props.onChange(
      key,
      numberKeys.has(key) && typeof raw === 'string'
        ? raw === ''
          ? null
          : Number(raw.replace(',', '.'))
        : raw,
    );
  if (props.isSelectingFund) {
    const search = props.search;
    return (
      <Modal title="Adicionar fundo" onClose={props.onClose}>
        <p className="mb-4 text-sm text-muted-foreground">
          Busque pelo nome ou CNPJ do fundo para iniciar o cadastro.
        </p>
        <div className="flex gap-2">
          <Input
            aria-label="Nome ou CNPJ do fundo"
            placeholder="Nome ou CNPJ"
            value={search.query}
            onChange={(event) => search.onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') search.onSearch();
            }}
          />
          <Button onClick={search.onSearch} disabled={!search.query.trim() || search.isLoading}>
            {search.isLoading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        {search.error && <p className="mt-3 text-sm text-destructive">{search.error}</p>}
        {search.results.length > 0 && (
          <div className="mt-4 space-y-2" role="radiogroup" aria-label="Fundos encontrados">
            {search.results.map((fund) => (
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${search.selectedId === fund.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                key={fund.id}
              >
                <input
                  type="radio"
                  name="fund"
                  checked={search.selectedId === fund.id}
                  onChange={() => search.onSelect(fund.id)}
                />
                <span>
                  <b className="block text-sm">{fund.name}</b>
                  <span className="text-xs text-muted-foreground">
                    {fund.cnpj || 'CNPJ não informado'}
                    {fund.gestora ? ` · ${fund.gestora}` : ''}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
        {!search.isLoading && !search.error && search.results.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            {search.hasRun
              ? 'Nenhum ativo pendente foi encontrado para esta busca.'
              : 'Faça uma busca para ver os ativos disponíveis.'}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={props.onClose}>
            Cancelar
          </Button>
          <Button onClick={search.onConfirm} disabled={!search.selectedId}>
            Selecionar
          </Button>
        </div>
      </Modal>
    );
  }
  return (
    <Modal
      title={props.isEditing ? 'Editar fundo' : 'Completar cadastro do fundo'}
      onClose={props.onClose}
    >
      {!props.isEditing && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md bg-secondary p-3 text-sm">
          <span>Revise os dados encontrados e preencha as informações restantes.</span>
          <Button variant="secondary" onClick={props.onBackToSearch}>
            Trocar fundo
          </Button>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome do fundo *" error={props.errors.name}>
          <Input value={value('name')} onChange={(e) => change('name', e.target.value)} />
        </Field>
        <Field label="CNPJ">
          <Input value={value('cnpj')} onChange={(e) => change('cnpj', e.target.value)} />
        </Field>
        <Field label="Onshore / Offshore">
          <Select value={value('shore')} onChange={(e) => change('shore', e.target.value)}>
            <option>Onshore</option>
            <option>Offshore</option>
          </Select>
        </Field>
        <Field label="Aba *">
          <Select value={value('type')} onChange={(e) => change('type', e.target.value)}>
            <option value="liquido">Fundos Líquidos</option>
            <option value="iliquido">Fundos Ilíquidos</option>
            <option value="listado">Fundos Listados</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={value('status')} onChange={(e) => change('status', e.target.value)}>
            <option>Aberto</option>
            <option>Fechado</option>
          </Select>
        </Field>
        <Field label="Classe / Setor / Tipo *" error={props.errors.classe}>
          <Select value={value('classe')} onChange={(e) => change('classe', e.target.value)}>
            {props.taxonomy[props.draft.type].map((item) => (
              <option key={item.c}>{item.c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Subclasse / Subsetor *" error={props.errors.sub}>
          <Select value={value('sub')} onChange={(e) => change('sub', e.target.value)}>
            {props.subclasses.map((sub) => (
              <option key={sub}>{sub}</option>
            ))}
          </Select>
        </Field>
        <Field label="Benchmark">
          <Input value={value('bench')} onChange={(e) => change('bench', e.target.value)} />
        </Field>
        <Field label="Liquidez">
          <Input value={value('liq')} onChange={(e) => change('liq', e.target.value)} />
        </Field>
        <Field label="Regras de tributação">
          <Input value={value('trib')} onChange={(e) => change('trib', e.target.value)} />
        </Field>
        <Field label="Gestora">
          <Input value={value('gestora')} onChange={(e) => change('gestora', e.target.value)} />
        </Field>
        <Field label="Data de aprovação">
          <Input
            type="date"
            value={value('data')}
            onChange={(e) => change('data', e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={props.draft.prev}
            onChange={(e) => change('prev', e.target.checked)}
          />{' '}
          Fundo Prev
        </label>
        <Field label="★ Nota Quant">
          <Input
            inputMode="decimal"
            value={value('notaQuant')}
            onChange={(e) => change('notaQuant', e.target.value)}
          />
        </Field>
        <Field label="★ Nota Final">
          <Input
            inputMode="decimal"
            value={value('notaFinal')}
            onChange={(e) => change('notaFinal', e.target.value)}
          />
        </Field>
        <Field label="Retorno desde o início (% a.a.) *" error={props.errors.ret}>
          <Input
            inputMode="decimal"
            value={value('ret')}
            onChange={(e) => change('ret', e.target.value)}
          />
        </Field>
        <Field label="Vol desde o início (% a.a.) *" error={props.errors.vol}>
          <Input
            inputMode="decimal"
            value={value('vol')}
            onChange={(e) => change('vol', e.target.value)}
          />
        </Field>
        <Field label="Observações">
          <textarea value={value('obs')} onChange={(e) => change('obs', e.target.value)} />
        </Field>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        {props.isEditing && (
          <Button variant="danger" onClick={props.onDelete}>
            Excluir fundo
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={props.onClose}>
            Cancelar
          </Button>
          <Button onClick={props.onSave}>Salvar</Button>
        </div>
      </div>
    </Modal>
  );
}
