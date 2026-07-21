import type { Index } from '../domain/index.types';
export const indicesFixture: Index[] = [
  {
    id: 'idx-cdi',
    name: 'CDI',
    ret: 10.8,
    vol: 0,
    updatedAt: '2026-07-01',
    color: '#111111',
    dashed: true,
  },
  {
    id: 'idx-ibov',
    name: 'IBOVESPA',
    ret: 13.4,
    vol: 18.4,
    updatedAt: '2026-07-01',
    color: '#5B9BD5',
    dashed: false,
  },
];
