import type { Comparison, Index } from '../domain/index.types';
import type { Fund, FundDraft, FundType, Taxonomy } from '../domain/fund.types';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const colors = ['#5B9BD5', '#9E7BC9', '#E8965A', '#4FADAD', '#D97BA1', '#8FAF5C'];
type ApiFund = Record<string, unknown> & { id: string; name: string };
type ApiIndex = {
  id: string;
  name: string;
  ret: number | null;
  vol: number | null;
  updatedAt: string;
  color: string | null;
  dashed: boolean;
};
type ApiComparison = {
  refId: string | null;
  selected: string[];
  title: string;
  source: string;
  period: string;
  correlations: Record<string, number>;
};
export type LiquidView = 'onshore' | 'offshore' | 'prev';
export type LiquidViewCounts = Record<LiquidView, number>;
type ApiFundList = {
  items: ApiFund[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Não foi possível concluir a solicitação.');
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}

const typeFromApi: Record<string, FundType> = {
  LIQUID: 'liquido',
  ILLIQUID: 'iliquido',
  LISTED: 'listado',
};
const typeToApi: Record<FundType, string> = {
  liquido: 'LIQUID',
  iliquido: 'ILLIQUID',
  listado: 'LISTED',
};
const statusFromApi: Record<string, Fund['status']> = { OPEN: 'Aberto', CLOSED: 'Fechado' };

export function toFund(value: ApiFund, position = 0): Fund {
  const string = (key: string) => (typeof value[key] === 'string' ? value[key] : '');
  const number = (key: string) => (typeof value[key] === 'number' ? value[key] : null);
  return {
    id: value.id,
    origin: value.origin === 'INDUSTRY' ? 'industria' : 'aprovado',
    name: value.name,
    cnpj: string('fundRegistrationNumber'),
    shore: value.domicile === 'OFFSHORE' ? 'Offshore' : 'Onshore',
    type: typeFromApi[string('fundType')] ?? 'liquido',
    status: statusFromApi[string('status')] ?? 'Aberto',
    classe: string('assetClass'),
    sub: string('subtype'),
    bench: string('benchmark'),
    liq: string('liquidity'),
    trib: string('taxation'),
    gestora: string('managerName'),
    data: string('data'),
    prev: value.recommended === true,
    notaQuant: number('quantitativeRating'),
    notaFinal: number('finalRating'),
    ret: number('annualizedReturnSinceInception'),
    vol: number('annualizedVolatilitySinceInception'),
    updatedAt: typeof value.sharePriceDate === 'string' ? value.sharePriceDate.slice(0, 10) : null,
    validated: value.validated === true,
    obs: string('notes'),
    color: string('color') || colors[position % colors.length],
  };
}

function toApiFund(draft: FundDraft) {
  return {
    name: draft.name,
    origin: draft.origin === 'industria' ? 'INDUSTRY' : 'APPROVED',
    fundRegistrationNumber: draft.cnpj || null,
    domicile: draft.shore === 'Offshore' ? 'OFFSHORE' : 'ONSHORE',
    fundType: draft.classe && draft.sub ? typeToApi[draft.type] : null,
    status: draft.status === 'Fechado' ? 'CLOSED' : 'OPEN',
    assetClass: draft.classe || null,
    subtype: draft.sub || null,
    benchmark: draft.bench || null,
    liquidity: draft.liq || null,
    taxation: draft.trib || null,
    managerName: draft.gestora || null,
    data: draft.data || null,
    recommended: draft.prev,
    quantitativeRating: draft.notaQuant,
    finalRating: draft.notaFinal,
    annualizedReturnSinceInception: draft.ret,
    annualizedVolatilitySinceInception: draft.vol,
    validated: draft.validated,
    notes: draft.obs || null,
  };
}

export async function listFunds(): Promise<Fund[]> {
  const data = await request<{ items: ApiFund[] }>('/admin/funds?pageSize=100');
  return data.items.map(toFund);
}
export async function listApprovedFunds(
  filters: {
    type?: FundType;
    shore?: Fund['shore'];
    recommended?: boolean;
    assetClass?: string;
    subtype?: string;
    pagination?: false;
  } = {},
): Promise<{ funds: Fund[] }> {
  const params = new URLSearchParams(
    filters.pagination === false ? { pagination: 'false' } : { pageSize: '100' },
  );
  if (filters.type) params.set('fundType', typeToApi[filters.type]);
  if (filters.shore) params.set('domicile', filters.shore === 'Offshore' ? 'OFFSHORE' : 'ONSHORE');
  if (filters.recommended !== undefined) params.set('recommended', String(filters.recommended));
  if (filters.assetClass) params.set('assetClass', filters.assetClass);
  if (filters.subtype) params.set('subtype', filters.subtype);
  const data = await request<ApiFundList>(`/funds?${params}`);
  return { funds: data.items.map(toFund) };
}
export const getLiquidViewCounts = () => request<LiquidViewCounts>('/funds/liquid-view-counts');
export async function searchFunds(query: string): Promise<Fund[]> {
  const params = new URLSearchParams({ search: query, pageSize: '20' });
  const data = await request<{ items: ApiFund[] }>(`/admin/funds?${params}`);
  return data.items.reduce<Fund[]>((results, item, position) => {
    const fund = toFund(item, position);
    if (!fund.validated) results.push(fund);
    return results;
  }, []);
}
export async function saveFund(draft: FundDraft): Promise<Fund> {
  const result = await request<ApiFund>(draft.id ? `/admin/funds/${draft.id}` : '/admin/funds', {
    method: draft.id ? 'PATCH' : 'POST',
    body: JSON.stringify(toApiFund(draft)),
  });
  return toFund(result);
}
export const removeFund = (id: string) => request<void>(`/admin/funds/${id}`, { method: 'DELETE' });
export const updateFundMetrics = (updates: Array<Pick<Fund, 'id' | 'ret' | 'vol' | 'updatedAt'>>) =>
  request<void>('/admin/funds/metrics', { method: 'POST', body: JSON.stringify({ updates }) });
export const importFundsCsv = (file: File) => {
  const data = new FormData();
  data.append('file', file);
  return fetch(`${apiUrl}/funds/import`, { method: 'POST', body: data }).then(async (response) => {
    if (!response.ok)
      throw new Error(
        ((await response.json().catch(() => null)) as { error?: string } | null)?.error ??
          'Não foi possível importar o CSV.',
      );
  });
};

export async function getTaxonomy(): Promise<Taxonomy> {
  const data =
    await request<
      Record<
        string,
        Array<{ id: string; label: string; subtypes: Taxonomy['liquido'][number]['subtypes'] }>
      >
    >('/fund-taxonomy');
  return {
    liquido: data.LIQUID ?? [],
    iliquido: data.ILLIQUID ?? [],
    listado: data.LISTED ?? [],
  };
}
function toIndex(value: ApiIndex): Index {
  return { ...value, updatedAt: value.updatedAt.slice(0, 10), color: value.color ?? '#5B9BD5' };
}
export const listIndices = async () => (await request<ApiIndex[]>('/indices')).map(toIndex);
export const saveIndex = async (index: Index) =>
  toIndex(
    await request<ApiIndex>(index.id.startsWith('idx-') ? '/indices' : `/indices/${index.id}`, {
      method: index.id.startsWith('idx-') ? 'POST' : 'PATCH',
      body: JSON.stringify({
        name: index.name,
        ret: index.ret,
        vol: index.vol,
        color: index.color,
        dashed: index.dashed,
      }),
    }),
  );
export const removeIndex = (id: string) => request<void>(`/indices/${id}`, { method: 'DELETE' });
export const getComparison = async (): Promise<{
  comparison: Comparison;
  correlations: Record<string, number>;
}> => {
  const value = await request<ApiComparison>('/comparison');
  return {
    comparison: {
      refId: value.refId,
      selected: value.selected,
      titulo: value.title,
      fonte: value.source,
      periodo: value.period,
    },
    correlations: value.correlations,
  };
};
export const saveComparison = (comparison: Comparison, correlations: Record<string, number>) =>
  request<ApiComparison>('/comparison', {
    method: 'PUT',
    body: JSON.stringify({
      refId: comparison.refId,
      selected: comparison.selected,
      title: comparison.titulo,
      source: comparison.fonte,
      period: comparison.periodo,
      correlations,
    }),
  });
