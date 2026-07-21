# Tickets de implementação

## Ordem de execução

Os tickets abaixo formam o plano completo. `FE-01` a `FE-03` são fundação e devem preceder as features. Os demais podem avançar conforme as dependências indicadas.

### FE-01 — Preparar a base React/TypeScript do frontend

**Dependências:** nenhuma.

**Escopo:** substituir o boilerplate Vite pela base React, instalar e configurar Tailwind CSS e shadcn/ui, configurar tema/tokens Troon, aliases/convenções de importação e scripts de validação. Não criar integrações de backend.

**Aceite:** app sobe e compila; TypeScript estrito passa; Tailwind processa classes; shadcn/ui está configurado e ao menos uma primitiva pode ser adicionada pelo CLI; não restam elementos do starter na interface.

### FE-02 — Definir domínio, fixtures e repositórios em memória

**Dependências:** FE-01.

**Escopo:** criar tipos de `Fund`, `Index`, `Comparison` e taxonomia; transcrever fixtures representativas da referência; definir interfaces de repositório e adaptadores em memória.

**Aceite:** nenhuma view importa dados diretamente; repositórios podem ser substituídos por API sem alterar contratos de feature.

### FE-03 — Criar design tokens e componentes compartilhados

**Dependências:** FE-01.

**Escopo:** extrair paleta, tipografia, dimensões e breakpoints da referência para o tema Tailwind; instalar/adaptar primitivas shadcn/ui para botão, campo, select, toggle, modal, tabela e estados vazios acessíveis. Criar somente composições de domínio fora do shadcn/ui.

**Aceite:** componentes shadcn/ui adaptados reproduzem os estados padrão, secundário, perigo, hover, foco e desabilitado sem CSS inline estrutural nem duplicação de primitivas.

### FE-04 — Implementar shell do dashboard e navegação por abas

**Dependências:** FE-01, FE-03.

**Escopo:** implementar cabeçalho, logo como asset local, rodapé, navegação horizontal rolável e área de conteúdo; conectar as cinco abas a estado tipado.

**Aceite:** a aba ativa é clara e navegável por teclado; layout mantém usabilidade nos breakpoints definidos; segue a estrutura MVVM.

### FE-05 — Implementar páginas de fundos aprovados

**Dependências:** FE-02, FE-03, FE-04.

**Escopo:** construir a feature reutilizável para líquidos, ilíquidos e listados, com cabeçalho, filtros, seções de classe/subclasse, cards, ranking, notas, tags e estados vazios.

**Aceite:** os três tipos de fundo usam a mesma feature parametrizada; dados, filtros e callbacks são providos pela model; visual acompanha a referência.

### FE-06 — Implementar modal de cadastro/edição de fundo

**Dependências:** FE-02, FE-03, FE-05.

**Escopo:** criar formulário completo de fundo, seleção dependente de classe/subclasse, validação local, inclusão, edição e exclusão em memória.

**Aceite:** todos os campos presentes na referência são exibidos; erros são acessíveis; a view não contém validações ou mutações de domínio.

### FE-07 — Implementar modal de atualização rápida

**Dependências:** FE-02, FE-03, FE-05.

**Escopo:** criar grade agrupada de retorno/volatilidade, data de referência, validação de números e interpretação local de texto separado por tabulação/ponto e vírgula.

**Aceite:** alterações só afetam o repositório em memória e atualizam a UI; linhas não reconhecidas retornam feedback compreensível; não há upload nem persistência real.

### FE-08 — Implementar Universo de Comparação

**Dependências:** FE-02, FE-03, FE-04.

**Escopo:** criar tabelas de índices/benchmarks e fundos da indústria, ações de edição e estado de linha tracejada; incluir o modal de índice.

**Aceite:** tabela é responsiva e acessível; índices e fundos da indústria vêm dos repositórios; mudanças são refletidas no comparador em memória.

### FE-09 — Implementar seleção e filtros do Comparador

**Dependências:** FE-02, FE-03, FE-04, FE-08.

**Escopo:** selecionar fundo de referência, título, fonte, período, filtros por aba/classe/subclasse, seleção individual/em lote e entradas de correlação.

**Aceite:** referência não pode ser participante; filtros atualizam opções dependentes; correlação é limitada ao intervalo de -1 a 1; todos os estados sem dados são tratados.

### FE-10 — Implementar gráficos do Comparador

**Dependências:** FE-03, FE-09.

**Escopo:** construir risco × retorno com eixos, pontos, legenda e linhas tracejadas, e gráfico de correlação de 3M; aplicar dados normalizados recebidos pelas models.

**Aceite:** gráficos reagem a filtros, referência e participantes; têm alternativa textual/semântica mínima; não acessam repositórios diretamente.

### FE-11 — Refinamento responsivo, acessibilidade e fidelidade visual

**Dependências:** FE-04 a FE-10.

**Escopo:** comparar todas as telas com a referência, ajustar espaçamentos/estados, tratar tabelas largas, revisar contraste, foco, navegação por teclado e comportamento de modal.

**Aceite:** desktop e mobile mantêm hierarquia e ações utilizáveis; nenhum controle depende exclusivamente de cor ou de hover.

### FE-12 — Garantir qualidade e documentar handoff para API

**Dependências:** FE-01 a FE-11.

**Escopo:** adicionar testes para models/utilitários críticos, validar build/typecheck, documentar os contratos de repositório, mocks e pontos de troca para backend.

**Aceite:** build e testes passam; documentação permite conectar backend sem reescrever views; não há chamadas de rede na entrega.

## Decisões a confirmar antes da execução

1. A aprovação para adicionar React ao frontend atual.
2. Se backup JSON e download PNG devem ficar apenas omitidos/desabilitados nesta primeira UI ou simulados no navegador.
3. O logo oficial a utilizar, caso o PNG embutido na referência não seja o asset definitivo.
