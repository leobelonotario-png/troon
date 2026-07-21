# Input original

## Objetivo

Replicar, no projeto `frontend`, a interface do arquivo de referência abaixo, ajustando apenas o necessário para a aplicação atual:

`C:\Users\pvelosa\Downloads\dashboard-fundos-aprovados (2).html`

Não implementar integrações de backend nesta etapa. A interface deve ser preparada para recebê-las futuramente.

## Regras arquiteturais solicitadas

- Padrão MVVM: model, view e viewmodel.
- Organização por feature, com profundidade de páginas/componentes como `feature/<page-a>/<page-b>/...`.
- Cada página ou componente médio/grande deve conter:
  - `<arquivo>.types.ts`: apenas exports de tipos;
  - `<arquivo>.model.ts`: lógica e estado do componente;
  - `<arquivo>.view.ts`: apenas apresentação; recebe dados e callbacks por props;
  - `index.ts`: composição entre `use<Arquivo>Model` e `<Arquivo>View`.

## Restrições desta especificação

- Nenhum código de produção será criado por este trabalho.
- Persistência, autenticação, upload, exportação e chamadas HTTP não serão integrados agora.
- O comportamento navegável e interativo será previsto com estado local e fixtures tipadas, substituíveis posteriormente por repositórios/API.
