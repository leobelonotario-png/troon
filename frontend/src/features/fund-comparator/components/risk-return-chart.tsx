import type { ComparisonEntity } from '../fund-comparator.types';

interface Props {
  reference: ComparisonEntity | null;
  participants: ComparisonEntity[];
}
const hasMetrics = (
  entity: ComparisonEntity,
): entity is ComparisonEntity & { ret: number; vol: number } =>
  entity.ret !== null && entity.vol !== null;
export function RiskReturnChart({ reference, participants }: Props) {
  const entities = [reference, ...participants]
    .filter((entity): entity is ComparisonEntity => Boolean(entity))
    .filter(hasMetrics);
  if (!entities.length)
    return (
      <p className="rounded-lg border border-dashed border-border p-7 text-center text-sm text-muted-foreground">
        Selecione uma referência ou participante com retorno e volatilidade preenchidos.
      </p>
    );
  const width = 680;
  const height = 370;
  const left = 58;
  const bottom = 42;
  const top = 18;
  const right = 36;
  const maxX = Math.max(...entities.map((entity) => entity.vol), 1) * 1.15;
  const returns = entities.map((entity) => entity.ret);
  const minY = Math.min(...returns) - 2;
  const maxY = Math.max(...returns) + 2;
  const x = (value: number) => left + (value / maxX) * (width - left - right);
  const y = (value: number) =>
    top + ((maxY - value) / (maxY - minY || 1)) * (height - top - bottom);
  const dashed = participants.filter(
    (entity) => entity.kind === 'index' && entity.dashed && hasMetrics(entity),
  );
  return (
    <svg
      className="h-auto w-full rounded border border-border bg-card"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Gráfico de risco versus retorno"
    >
      <title>Risco versus retorno</title>
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
        <g key={tick}>
          <line
            x1={left}
            x2={width - right}
            y1={top + tick * (height - top - bottom)}
            y2={top + tick * (height - top - bottom)}
            stroke="#e8efeb"
          />
          <text x={left - 7} y={top + tick * (height - top - bottom) + 4} textAnchor="end">
            {(maxY - (maxY - minY) * tick).toFixed(0)}%
          </text>
        </g>
      ))}
      {dashed.map((entity) => (
        <g key={entity.id}>
          <line
            x1={left}
            x2={width - right}
            y1={y(entity.ret as number)}
            y2={y(entity.ret as number)}
            stroke="#1c2421"
            strokeDasharray="7 5"
          />
          <text x={width - right + 3} y={y(entity.ret as number) + 4}>
            {entity.name}
          </text>
        </g>
      ))}
      <line
        x1={left}
        x2={width - right}
        y1={height - bottom}
        y2={height - bottom}
        stroke="#82908a"
      />
      <line x1={left} x2={left} y1={top} y2={height - bottom} stroke="#82908a" />
      {entities.map((entity) =>
        entity.id === reference?.id ? (
          <g key={entity.id}>
            <path
              d={`M ${x(entity.vol)} ${y(entity.ret) - 8} L ${x(entity.vol) + 8} ${y(entity.ret) + 7} L ${x(entity.vol) - 8} ${y(entity.ret) + 7} Z`}
              fill={entity.color}
              stroke="#0b4a33"
            />
            <text x={x(entity.vol)} y={y(entity.ret) - 13} textAnchor="middle">
              {entity.name}
            </text>
          </g>
        ) : (
          <g key={entity.id}>
            <circle
              cx={x(entity.vol)}
              cy={y(entity.ret)}
              r="5.5"
              fill={entity.color}
              stroke="#fff"
            />
            <title>{`${entity.name}: retorno ${entity.ret}%, volatilidade ${entity.vol}%`}</title>
          </g>
        ),
      )}
      <text x={(left + width - right) / 2} y={height - 8} textAnchor="middle">
        Volatilidade anualizada
      </text>
      <text x="14" y={height / 2} transform={`rotate(-90 14 ${height / 2})`} textAnchor="middle">
        Retorno
      </text>
    </svg>
  );
}
