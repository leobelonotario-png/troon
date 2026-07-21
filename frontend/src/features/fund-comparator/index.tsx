import { useFundComparatorModel } from './fund-comparator.model';
import type { FundComparatorProps } from './fund-comparator.types';
import { FundComparatorView } from './fund-comparator.view';
export function FundComparator(props: FundComparatorProps) {
  return <FundComparatorView {...useFundComparatorModel(props)} />;
}
