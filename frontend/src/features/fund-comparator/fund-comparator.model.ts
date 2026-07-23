import { useMemo, useState } from 'react';
import type { FundType } from '../../shared/domain/fund.types';
import type {
  ComparisonEntity,
  ComparatorFilters,
  FundComparatorProps,
  FundComparatorViewProps,
} from './fund-comparator.types';

export const pairKey = (one: string, other: string) => [one, other].sort().join('|');
export function useFundComparatorModel(props: FundComparatorProps): FundComparatorViewProps {
  const [filters, setFilters] = useState<ComparatorFilters>({ type: '', classe: '', sub: '' });
  const validatedFunds = useMemo(() => props.funds.filter((fund) => fund.validated), [props.funds]);
  const entities = useMemo<ComparisonEntity[]>(
    () => [
      ...validatedFunds.map((fund) => ({
        ...fund,
        kind: fund.origin === 'industria' ? ('industry' as const) : ('fund' as const),
      })),
      ...props.indices.map((index) => ({ ...index, kind: 'index' as const })),
    ],
    [validatedFunds, props.indices],
  );
  const reference = entities.find((entity) => entity.id === props.comparison.refId) ?? null;
  const referenceOptions = validatedFunds.filter((fund) => fund.origin === 'aprovado');
  const classes = filters.type ? props.taxonomy[filters.type] : [];
  const subclasses =
    filters.type && filters.classe
      ? (props.taxonomy[filters.type].find((item) => item.id === filters.classe)?.subtypes ?? [])
      : [];
  const filteredFunds = validatedFunds.filter(
    (fund) =>
      fund.origin === 'aprovado' &&
      fund.id !== reference?.id &&
      (!filters.type || fund.type === filters.type) &&
      (!filters.classe || fund.classe === filters.classe) &&
      (!filters.sub || fund.sub === filters.sub),
  );
  const selectedEntities = props.comparison.selected.reduce<ComparisonEntity[]>((selected, id) => {
    if (id === reference?.id) return selected;
    const entity = entities.find((candidate) => candidate.id === id);
    if (entity) selected.push(entity);
    return selected;
  }, []);
  const changeComparison = (patch: Partial<FundComparatorProps['comparison']>) =>
    props.onChangeComparison({ ...props.comparison, ...patch });
  const toggle = (id: string, checked: boolean) =>
    changeComparison({
      selected: checked
        ? [...new Set([...props.comparison.selected, id])].filter((item) => item !== reference?.id)
        : props.comparison.selected.filter((item) => item !== id),
    });
  return {
    ...props,
    funds: validatedFunds,
    referenceOptions,
    reference,
    filteredFunds,
    selectedEntities,
    filters,
    classes,
    subclasses,
    onFiltersChange: (patch) =>
      setFilters((current) => {
        const next = { ...current, ...patch };
        if ('type' in patch) return { type: patch.type as FundType | '', classe: '', sub: '' };
        if ('classe' in patch) return { ...next, sub: '' };
        return next;
      }),
    onReferenceChange: (id) =>
      changeComparison({
        refId: id || null,
        selected: props.comparison.selected.filter((item) => item !== id),
      }),
    onFieldChange: (field, value) => changeComparison({ [field]: value }),
    onToggleParticipant: toggle,
    onToggleFiltered: (checked) => {
      const ids = new Set(filteredFunds.map((fund) => fund.id));
      changeComparison({
        selected: checked
          ? [...new Set([...props.comparison.selected, ...ids])].filter(
              (id) => id !== reference?.id,
            )
          : props.comparison.selected.filter((id) => !ids.has(id)),
      });
    },
    onToggleIndustry: (checked) => {
      const ids = new Set<string>();
      for (const fund of validatedFunds) {
        if (fund.origin === 'industria') ids.add(fund.id);
      }
      changeComparison({
        selected: checked
          ? [...new Set([...props.comparison.selected, ...ids])].filter(
              (id) => id !== reference?.id,
            )
          : props.comparison.selected.filter((id) => !ids.has(id)),
      });
    },
    onCorrelationChange: (id, value) => {
      const numeric = Number(value.replace(',', '.'));
      const key = pairKey(reference?.id ?? '', id);
      const next = { ...props.correlations };
      if (!value.trim() || !Number.isFinite(numeric)) delete next[key];
      else next[key] = Math.max(-1, Math.min(1, numeric));
      props.onChangeCorrelations(next);
    },
  };
}
