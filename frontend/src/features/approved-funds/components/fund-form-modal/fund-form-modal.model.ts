import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTaxonomy,
  removeFund,
  saveFund,
  searchFunds,
} from '../../../../shared/repositories/api.repositories';
import type { Fund, FundDraft, FundType, Taxonomy } from '../../../../shared/domain/fund.types';
import type { FundFormModalProps, FundFormViewProps } from './fund-form-modal.types';

const emptyTaxonomy: Taxonomy = { liquido: [], iliquido: [], listado: [] };
const newDraft = (
  type: FundType,
  initialClassification: { classe: string; sub: string } | null,
): FundDraft => ({
  origin: 'aprovado',
  name: '',
  cnpj: '',
  shore: 'Onshore',
  type,
  status: 'Aberto',
  classe: initialClassification?.classe ?? '',
  sub: initialClassification?.sub ?? '',
  bench: '',
  liq: '',
  trib: '',
  gestora: '',
  data: '',
  prev: false,
  notaQuant: null,
  notaFinal: null,
  ret: null,
  vol: null,
  obs: '',
  validated: false,
});

export function useFundFormModalModel({
  fund,
  initialType,
  initialClassification,
  onClose,
  onSaved,
}: FundFormModalProps): FundFormViewProps {
  const taxonomyQuery = useQuery({ queryKey: ['taxonomy'], queryFn: getTaxonomy });
  const taxonomy = taxonomyQuery.data ?? emptyTaxonomy;
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: saveFund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      onSaved();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: removeFund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      onSaved();
    },
  });
  const [draft, setDraft] = useState<FundDraft>(
    fund ?? newDraft(initialType, initialClassification),
  );
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Fund[]>([]);
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FundDraft, string>>>({});
  const onSearch = async () => {
    if (!search.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setSearchError(null);
    try {
      const results = await searchFunds(search.trim());
      setSearchResults(results);
      setSelectedFundId(results.length === 1 ? results[0].id : null);
    } catch (error) {
      setSearchResults([]);
      setSelectedFundId(null);
      setSearchError(error instanceof Error ? error.message : 'Não foi possível buscar os fundos.');
    } finally {
      setIsSearching(false);
    }
  };
  const subclasses = useMemo(
    () => taxonomy[draft.type].find((item) => item.id === draft.classe)?.subtypes ?? [],
    [taxonomy, draft.type, draft.classe],
  );
  const onChange = (key: keyof FundDraft, value: string | boolean | number | null) =>
    setDraft((current) => {
      const next = { ...current, [key]: value } as FundDraft;
      if (key === 'type') {
        next.classe = '';
        next.sub = '';
      }
      if (key === 'classe') next.sub = '';
      return next;
    });
  const onSave = () => {
    const nextErrors: Partial<Record<keyof FundDraft, string>> = {};
    if (!draft.name.trim()) nextErrors.name = 'Informe o nome do fundo.';
    if (!draft.classe) nextErrors.classe = 'Selecione a classe.';
    if (!draft.sub) nextErrors.sub = 'Selecione a subclasse.';
    if (draft.ret === null || Number.isNaN(draft.ret)) nextErrors.ret = 'Informe o retorno.';
    if (draft.vol === null || Number.isNaN(draft.vol)) nextErrors.vol = 'Informe a volatilidade.';
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) saveMutation.mutate({ ...draft, validated: true });
  };
  const selectSearchResult = (id: string) => setSelectedFundId(id);
  const confirmSelection = () => {
    const selected = searchResults.find((result) => result.id === selectedFundId);
    if (!selected) return;
    const { color: _color, updatedAt: _updatedAt, ...selectedDraft } = selected;
    setDraft({ ...selectedDraft, ...initialClassification, validated: false });
  };
  return {
    draft,
    errors,
    isEditing: Boolean(fund),
    isSelectingFund: !fund && !draft.id,
    subclasses,
    taxonomy,
    search: {
      query: search,
      results: searchResults,
      selectedId: selectedFundId,
      hasRun: hasSearched,
      isLoading: isSearching,
      error: searchError,
      onQueryChange: setSearch,
      onSearch,
      onSelect: selectSearchResult,
      onConfirm: confirmSelection,
    },
    onBackToSearch: () => {
      setDraft(newDraft(initialType, initialClassification));
      setSelectedFundId(null);
    },
    onChange,
    onSave,
    onDelete: () => {
      if (fund) deleteMutation.mutate(fund.id);
    },
    onClose,
  };
}
