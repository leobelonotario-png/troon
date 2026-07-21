import type { Fund, FundDraft } from '../domain/fund.types';
import type { Index } from '../domain/index.types';
export interface FundsRepository {
  list(): Fund[];
  save(draft: FundDraft): Fund;
  remove(id: string): void;
  updateMetrics(updates: Array<Pick<Fund, 'id' | 'ret' | 'vol' | 'updatedAt'>>): void;
}
export interface IndicesRepository {
  list(): Index[];
}
