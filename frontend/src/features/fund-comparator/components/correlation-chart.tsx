import type { ComparisonEntity } from '../fund-comparator.types';
import { pairKey } from '../fund-comparator.model';
interface Props {
  reference: ComparisonEntity | null;
  participants: ComparisonEntity[];
  correlations: Record<string, number>;
}
export function CorrelationChart({ reference, participants, correlations }: Props) {
  if (!reference)
    return (
      <p className="empty-state">
        Selecione um fundo de referência para visualizar as correlações.
      </p>
    );
  const rows = participants
    .map((entity) => ({ entity, value: correlations[pairKey(reference.id, entity.id)] }))
    .filter(
      (row): row is { entity: ComparisonEntity; value: number } => typeof row.value === 'number',
    );
  if (!rows.length)
    return <p className="empty-state">Informe as correlações para visualizar o gráfico.</p>;
  return (
    <div
      className="correlation-chart"
      role="img"
      aria-label={`Correlação de ${reference.name} com os participantes`}
    >
      <div className="correlation-axis">
        <span>−1</span>
        <span>0</span>
        <span>1</span>
      </div>
      {rows.map(({ entity, value }) => (
        <div className="correlation-row" key={entity.id}>
          <span>{entity.name}</span>
          <div className="correlation-track">
            <i className="zero-line" />
            <i
              className="correlation-bar"
              style={{
                left: `${value < 0 ? (value + 1) * 50 : 50}%`,
                width: `${Math.abs(value) * 50}%`,
                backgroundColor: entity.color,
              }}
            />
          </div>
          <strong>{value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</strong>
        </div>
      ))}
    </div>
  );
}
