import type { FundType, Taxonomy } from '../../shared/domain/fund.types';
import { useApprovedFundsModel } from './approved-funds.model';
import { ApprovedFundsView } from './approved-funds.view';
export function ApprovedFunds({ type, taxonomy }: { type: FundType; taxonomy: Taxonomy }) {
  return <ApprovedFundsView {...useApprovedFundsModel(type, taxonomy)} />;
}
