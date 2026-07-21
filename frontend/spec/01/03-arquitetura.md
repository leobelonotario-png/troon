# Arquitetura proposta

## Organização de diretórios

```text
frontend/src/
  app/
    app.types.ts
    app.model.ts
    app.view.ts
    index.ts
  features/
    dashboard/
      dashboard.types.ts
      dashboard.model.ts
      dashboard.view.ts
      index.ts
      components/
        app-header/
        app-navigation/
        fund-card/
        fund-class-section/
        fund-form-modal/
        quick-update-modal/
    approved-funds/
      approved-funds.types.ts
      approved-funds.model.ts
      approved-funds.view.ts
      index.ts
    comparison-universe/
      comparison-universe.types.ts
      comparison-universe.model.ts
      comparison-universe.view.ts
      index.ts
      components/
        index-form-modal/
        industry-funds-table/
        benchmarks-table/
    fund-comparator/
      fund-comparator.types.ts
      fund-comparator.model.ts
      fund-comparator.view.ts
      index.ts
      components/
        comparator-filters/
        participant-selection/
        correlation-inputs/
        risk-return-chart/
        correlation-chart/
  shared/
    components/
    ui/                    # componentes gerados/adaptados do shadcn/ui
    domain/
    repositories/
    fixtures/
    styles/
```

Componentes pequenos, puramente visuais e sem estado de domínio podem ter arquivo único. Qualquer página ou componente médio/grande usa a estrutura de quatro arquivos.

## Responsabilidades MVVM

| Camada       | Responsabilidade                                                                                    | Não pode conter                                                            |
| ------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `*.types.ts` | Props, estados de view, tipos de formulário e contratos de domínio exportados                       | Implementação, constantes de UI não tipadas e JSX.                         |
| `*.model.ts` | Hook `useXModel`, transformação de dados, estado, validação, handlers e composição com repositórios | JSX e CSS.                                                                 |
| `*.view.ts`  | JSX, semântica, layout e chamada de callbacks recebidos por props                                   | Hooks de domínio, fetch, acesso a fixture/repositório e lógica de negócio. |
| `index.ts`   | Criar model props e renderizar a view                                                               | Regra de negócio ou markup adicional significativo.                        |

## Fronteira com backend futuro

As features dependem de interfaces de repositório (`FundsRepository`, `IndicesRepository`, `ComparisonRepository`), nunca de `fetch` diretamente. Nesta fase, implementações `InMemory...Repository` fornecem fixtures e mantêm mutações somente em memória. A troca pela API será feita no composition root.

## Convenções adicionais

- Tailwind CSS é obrigatório para estilos de componentes e layouts. Usar tokens semânticos no tema (`background`, `foreground`, `primary`, `border`, etc.) e variáveis CSS apenas como fonte desses tokens.
- shadcn/ui é obrigatório para primitivas visuais reutilizáveis. Os componentes devem ser instalados dentro de `shared/ui` (ou no diretório configurado pelo CLI), preservando a possibilidade de edição local.
- Não duplicar primitivas já disponíveis no shadcn/ui. Criar componentes próprios somente para composição de domínio (por exemplo, `FundCard`, tabelas de fundos e gráficos) ou quando a primitiva não atender ao requisito.
- Views podem compor componentes shadcn/ui e classes Tailwind, mas continuam sem acessar repositórios, fixtures ou regras de domínio.
- Tipos de domínio e enums ficam em `shared/domain`; props específicas permanecem junto ao componente.
- Formatação de porcentagem, datas, CNPJ e parse de números ficam em utilitários testáveis, fora das views.
- Tokens de cor, espaço, tipografia e breakpoints ficam no tema Tailwind e em `shared/styles` somente quando globais, para preservar a identidade visual de modo consistente.
- SVG/gráficos recebem séries normalizadas pelas models; as views apenas desenham os dados.
