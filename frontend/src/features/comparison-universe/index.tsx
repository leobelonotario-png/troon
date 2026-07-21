import { useComparisonUniverseModel } from './comparison-universe.model';
import type { ComparisonUniverseProps } from './comparison-universe.types';
import { ComparisonUniverseView } from './comparison-universe.view';
export function ComparisonUniverse(props: ComparisonUniverseProps) {
  return <ComparisonUniverseView {...useComparisonUniverseModel(props)} />;
}
