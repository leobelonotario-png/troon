import { Button, Field, Input, Modal } from '../../../../shared/components/ui';
import type { QuickUpdateViewProps } from './quick-update-modal.types';
export function QuickUpdateModalView(props: QuickUpdateViewProps) {
  return (
    <Modal title="⟳ Atualização rápida — Retorno e Vol" onClose={props.onClose}>
      <Field label="Data de referência">
        <Input
          type="date"
          value={props.date}
          onChange={(event) => props.onDateChange(event.target.value)}
        />
      </Field>
      <Field label="Colar do Excel: CNPJ ou Nome | Retorno | Vol">
        <textarea
          className="min-h-28 w-full rounded-md border border-input bg-card p-2 text-sm"
          value={props.paste}
          onChange={(event) => props.onPasteChange(event.target.value)}
        />
        <Button variant="secondary" onClick={props.onApplyPaste}>
          Preencher grade
        </Button>
        {props.feedback && <small role="status">{props.feedback}</small>}
      </Field>
      <table className="w-full border-collapse text-sm [&_td]:border-b [&_td]:border-border [&_td]:p-2 [&_th]:border-b [&_th]:border-border [&_th]:p-2 [&_th]:text-left">
        <thead>
          <tr>
            <th>Fundo</th>
            <th>Retorno (% a.a.)</th>
            <th>Vol (% a.a.)</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>
                <Input
                  inputMode="decimal"
                  value={row.ret}
                  onChange={(event) => props.onRowChange(row.id, 'ret', event.target.value)}
                />
              </td>
              <td>
                <Input
                  inputMode="decimal"
                  value={row.vol}
                  onChange={(event) => props.onRowChange(row.id, 'vol', event.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-5 flex justify-end">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={props.onClose}>
            Cancelar
          </Button>
          <Button onClick={props.onSave}>Salvar atualizações</Button>
        </div>
      </div>
    </Modal>
  );
}
