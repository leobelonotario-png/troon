import type { FundType } from '../../shared/domain/fund.types';
import { useApprovedFundsModel } from './approved-funds.model';
import { ApprovedFundsView } from './approved-funds.view';
export function ApprovedFunds({ type }: { type: FundType }) {
  return <ApprovedFundsView {...useApprovedFundsModel(type)} />;
}
