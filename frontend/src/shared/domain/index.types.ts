export interface Index {
  id: string;
  name: string;
  ret: number | null;
  vol: number | null;
  updatedAt: string | null;
  color: string;
  dashed: boolean;
}
export interface Comparison {
  refId: string | null;
  selected: string[];
  periodo: string;
  titulo: string;
  fonte: string;
}
