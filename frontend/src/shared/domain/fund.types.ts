export type FundType = 'liquido' | 'iliquido' | 'listado';
export type FundOrigin = 'aprovado' | 'industria';
export type FundStatus = 'Aberto' | 'Fechado';
export interface Fund {
  id: string;
  origin: FundOrigin;
  name: string;
  cnpj: string;
  shore: 'Onshore' | 'Offshore';
  type: FundType;
  status: FundStatus;
  classe: string;
  sub: string;
  bench: string;
  liq: string;
  trib: string;
  gestora: string;
  data: string;
  prev: boolean;
  notaQuant: number | null;
  notaFinal: number | null;
  ret: number | null;
  vol: number | null;
  updatedAt: string | null;
  obs: string;
  color: string;
}
export interface FundDraft extends Omit<Fund, 'id' | 'color' | 'updatedAt'> {
  id?: string;
}
export interface TaxonomyClass {
  c: string;
  s: string[];
}
export type Taxonomy = Record<FundType, TaxonomyClass[]>;
