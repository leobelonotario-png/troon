# Handoff para API — Dashboard de Fundos

As views não fazem chamadas de rede. A camada de composição deve injetar implementações dos contratos em `src/shared/repositories/repositories.types.ts`.

## Contratos atuais

- `FundsRepository.list`, `save`, `remove` e `updateMetrics` manipulam `Fund` e `FundDraft`.
- `IndicesRepository.list` fornece `Index`.
- O comparador recebe `Comparison` e `Record<string, number>` de correlações como estado da aplicação. A chave de uma correlação é a composição ordenada dos IDs: `idA|idB`.

## Substituição pela API

1. Criar adaptadores HTTP que implementem os contratos de repositório, incluindo as mutações de índices quando o endpoint estiver disponível.
2. No composition root, substituir `InMemoryFundsRepository` e `InMemoryIndicesRepository`; nenhuma view deve ser alterada.
3. Converter o payload da API para os tipos de domínio, mantendo `ret` e `vol` como percentuais numéricos (por exemplo, `12.4`, não `0.124`).
4. Persistir o estado de comparação (`refId`, `selected`, título, fonte, período e correlações) no endpoint dedicado ou no armazenamento definido pelo produto.

## Regras que o backend deve preservar

- Um participante não pode ser igual ao fundo de referência.
- Correlação deve estar no intervalo fechado `[-1, 1]`.
- Fundos com `origin: "industria"` compõem o universo da indústria; os com `origin: "aprovado"` podem ser escolhidos como referência.
- `updatedAt` é ISO `YYYY-MM-DD` e os valores ausentes de retorno/volatilidade são `null`.

Não há chamadas de rede na entrega atual; fixtures são apenas dados de demonstração.
