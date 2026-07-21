import type { Fund, FundDraft } from '../domain/fund.types';
import type { Index } from '../domain/index.types';
import { fundsFixture } from '../fixtures/funds.fixture';
import { indicesFixture } from '../fixtures/indices.fixture';
import type { FundsRepository, IndicesRepository } from './repositories.types';
const palette = ['#5B9BD5', '#9E7BC9', '#E8965A', '#4FADAD', '#D97BA1', '#8FAF5C'];
export class InMemoryFundsRepository implements FundsRepository {
  private funds = [...fundsFixture];
  list = () => [...this.funds];
  save = (draft: FundDraft) => {
    const id = draft.id ?? `fund-${Date.now()}`;
    const prior = this.funds.find((fund) => fund.id === id);
    const fund: Fund = {
      ...draft,
      id,
      color: prior?.color ?? palette[this.funds.length % palette.length],
      updatedAt: prior?.updatedAt ?? null,
    };
    this.funds = prior
      ? this.funds.map((item) => (item.id === id ? fund : item))
      : [...this.funds, fund];
    return fund;
  };
  remove = (id: string) => {
    this.funds = this.funds.filter((fund) => fund.id !== id);
  };
  updateMetrics = (updates: Array<Pick<Fund, 'id' | 'ret' | 'vol' | 'updatedAt'>>) => {
    const byId = new Map(updates.map((item) => [item.id, item]));
    this.funds = this.funds.map((fund) => ({ ...fund, ...byId.get(fund.id) }));
  };
}
export class InMemoryIndicesRepository implements IndicesRepository {
  list = (): Index[] => [...indicesFixture];
}
export const fundsRepository = new InMemoryFundsRepository();
export const indicesRepository = new InMemoryIndicesRepository();
