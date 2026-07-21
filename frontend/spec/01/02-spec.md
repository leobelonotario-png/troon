# Especificação funcional e visual — Dashboard de Fundos Aprovados

## Resultado esperado

Uma SPA responsiva que reproduza a UI do HTML de referência, com marca Troon, navegação por abas, cartões, tabelas, modais e visualizações do comparador. A primeira entrega usa dados locais de demonstração, sem depender de backend.

## Contexto técnico identificado

- O `frontend` atual é um boilerplate Vite + TypeScript, sem framework de UI.
- A referência é uma única página HTML com CSS e JavaScript imperativo.
- A implementação deverá introduzir React, Tailwind CSS e a infraestrutura estritamente necessária para renderizar componentes e rotas/abas tipadas.
- Componentes visuais de uso geral devem usar **shadcn/ui** como base (por exemplo: `Button`, `Input`, `Select`, `Dialog`, `Table`, `Tabs`, `Checkbox` e `Switch`) e receber customização por classes Tailwind para alcançar a identidade Troon. Componentes de domínio e gráficos continuam próprios.
- A decisão final de biblioteca de gráfico deve priorizar fidelidade visual, acessibilidade e baixo acoplamento; SVG próprio é aceitável.

## Áreas da interface

| Área                   | Conteúdo visível                                                                                                                        | Interações previstas para o frontend                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Cabeçalho              | Logo, título do dashboard e ações globais                                                                                               | Abrir atualização rápida; ações de backup ficam desabilitadas ou claramente marcadas como indisponíveis até o backend.   |
| Navegação              | Fundos Líquidos, Ilíquidos, Listados, Universo de Comparação e Comparador                                                               | Alternar a área ativa, com estado visual da aba.                                                                         |
| Fundos aprovados       | Seções por classe e subclasse; cartões de fundo, ranking, notas, metadados e status                                                     | Filtrar/buscar conforme a referência, abrir detalhe/edição e iniciar inclusão em modal local.                            |
| Universo de comparação | Tabela de índices/benchmarks e tabela de fundos da indústria                                                                            | Exibir dados locais; abrir modais de inclusão/edição; alternar linha tracejada dos índices.                              |
| Atualização rápida     | Modal com grade de retorno e volatilidade e área de colagem                                                                             | Validar e simular alterações apenas no estado local.                                                                     |
| Comparador             | Fundo de referência, filtros, seleção de participantes, correlações, gráfico risco × retorno, gráfico de correlação e metadados da peça | Atualizar os gráficos a partir do estado local. Download PNG fica fora do escopo desta entrega, salvo decisão posterior. |

## Dados e comportamentos de tela

### Entidades previstas

- `Fund`: identificador, origem (aprovado/indústria), nome, CNPJ, onshore/offshore, tipo de aba, status, classe, subclasse, benchmark, liquidez, tributação, gestora, data de aprovação, flag previdenciária, notas, retorno, volatilidade, data de atualização, observações e cor.
- `Index`: identificador, nome, retorno, volatilidade, data de atualização, cor e flag de linha tracejada.
- `Comparison`: fundo de referência, participantes, filtros, período, título, fonte e correlações por par.
- `Taxonomy`: classes e subclasses permitidas para cada tipo de fundo.

As fixtures devem derivar dos dados exibidos no HTML de referência, mas ficar isoladas da camada de apresentação. Contratos de leitura/escrita serão definidos desde já para permitir a substituição por API sem mudar as views.

### Estados obrigatórios

- carregando (representado localmente onde fizer sentido);
- vazio para listas e tabelas;
- erro de validação de formulário;
- sem referência selecionada no comparador;
- sem participantes selecionados;
- responsividade para desktop, tablet e celular;
- foco visível, navegação por teclado e modais com semântica adequada.

## Fora do escopo

- API, banco de dados, login/permissões e persistência real;
- importação/exportação de backup JSON;
- download de PNG e geração de arquivo;
- sincronização entre usuários;
- regras financeiras além das validações exibidas pela referência.

## Critérios globais de aceite

1. A página reproduz a hierarquia, paleta verde, espaçamentos, bordas, tipografia, cartões, tabelas e estados ativos do HTML de referência.
2. Não há JavaScript imperativo manipulando `innerHTML`, atributos `onclick` ou acesso direto ao DOM para controlar dados da tela.
3. Views não possuem regra de negócio nem estado próprio de domínio; recebem somente props tipadas.
4. Todo componente médio/grande atende à convenção `types` + `model` + `view` + `index` solicitada.
5. Dados simulados e adaptadores para futura API ficam fora das views.
6. Componentes base de interface usam shadcn/ui; Tailwind CSS é o mecanismo padrão de estilização. CSS global fica restrito a reset, fontes, tokens e regras que não possam ser expressas de modo adequado por utilitários.
7. O build e a checagem de tipos passam ao fim da implementação.
