---
name: refatorar-calculadora-embalagem
overview: Transformar o fluxo por steps da calculadora de embalagem em uma única página linear com seções em collapse, sem botões de avanço, mantendo validações e UX atualizadas.
todos:
  - id: remove-steps-state
    content: Remover constantes de steps, estado step/goToStep e condicional step === ... em index.tsx
    status: pending
  - id: remove-continue-buttons
    content: Remover handlers handleTela1Continue/handleTela2Continue/handleTela5Continue e botões "Continuar" associados
    status: pending
  - id: collapse-linear-sections
    content: Transformar cada tela em bloco MotionBox sempre renderizado e controlar visibilidade interna apenas via Collapse baseado em dados do form
    status: pending
  - id: extract-decision-helpers
    content: Extrair funções helper puras para decidir quando mostrar conteúdo (dimensões válidas, perguntar conteúdo unitizado, perguntar peso distribuído, fluxo técnico completo)
    status: pending
  - id: wire-contact-and-result
    content: Ajustar gating para dados de contato e resultado para funcionar sem steps, baseado apenas no estado do form e em elegibleTemplates
    status: pending
  - id: cleanup-and-test
    content: Remover imports/variáveis não usados e testar todos os fluxos de uso (box/crate/pallet/any, tipos de produto, exportação SIM/NÃO)
    status: pending
isProject: false
---

### Objetivo

Transformar `src/pages/calculadora-de-embalagem/index.tsx` em um fluxo contínuo (single-page), removendo o controle por `step` e os botões "Continuar", usando apenas o estado do formulário para abrir/fechar seções via `Collapse`, sem alterar a largura do container nem quebrar as regras de negócio já existentes.

### Arquivo principal a alterar

- `[src/pages/calculadora-de-embalagem/index.tsx](src/pages/calculadora-de-embalagem/index.tsx)`

### Passos do refactor

- **1. Limpar a mecânica de steps**
  - Remover constantes `STEP_TELA1 ... STEP_RESULT`.
  - Remover estado `step` e `setStep` e a função `goToStep`.
  - Substituir todos os blocos condicionais `step === STEP_TELA* && (<MotionBox ...>)` por `<MotionBox ...>` simples, mantendo a ordem lógica atual das telas (O que calcular → Tipo de produto → Exportação → Peso → Medidas → Conteúdo → Peso distribuído → Recomendações → Dados de contato → Resultado).
- **2. Remover os botões "Continuar" e handlers de navegação**
  - Remover `handleTela1Continue`, `handleTela2Continue`, `handleTela5Continue` (ou adaptar partes úteis de validação para funções reutilizáveis como helpers, se fizer sentido).
  - Apagar os botões "Continuar" associados nessas seções.
  - Garantir que o único submit real do formulário permaneça em "Solicitar cálculo" (botão final), chamando `handleTela6Submit`.
- **3. Reorganizar seções como blocos lineares com `Collapse`**
  - Manter cada grupo de perguntas em um `MotionBox` na sequência atual, mas visibilidade interna controlada via `Collapse in={...}`:
    - **Bloco 1: Escolha da embalagem / tipo de produto / exportação / peso**
      - Já existe `tela1SubStep`; considerar simplificar ou manter apenas enquanto for útil para gating interno.
      - Usar `Collapse`/opacidade apenas para orientar a ordem (por ex.: tipo de produto só aparece depois de escolher embalagem; exportação só após produto; peso só após exportação), mas sem steps globais.
    - **Bloco 2: Medidas (unit, length, width, height)**
      - Mostrar o `SimpleGrid` de medidas quando houver `weight` válido (por exemplo `Collapse in={Boolean(form.weight)}`).
    - **Bloco 3: Conteúdo unitizado ou fracionado**
      - Abrir apenas quando:
        - `prodType` foi escolhido **e** ele está em `ASK_CONTENT_PROD_TYPES`.
      - Caso `prodType` esteja em `FRACTIONED_PROD_TYPES`, pular esta pergunta e marcar `isUnitizedContent=false` automaticamente (como já é feito hoje na lógica).
    - **Bloco 4: Peso distribuído / concentrado (palete)**
      - Usar lógica já existente (`advanceFromTela4Check`) para decidir se o bloco deve aparecer, mas convertendo isso em uma função pura que determina se as condições de tamanho/peso exigem a pergunta; então usar `Collapse in={shouldAskDistributedWeight}`.
    - **Bloco 5: Recomendações**
      - Mostrar quando `isDistributedWeight === false` (ou outra condição de negócio equivalente à tela atual).
    - **Bloco 6: Dados de contato (CNPJ, Nome, Email, Telefone)**
      - Mostrar quando todas as perguntas técnicas anteriores estiverem respondidas (checar campos-chave: `packType`, `prodType`/`isPallet`, `isExport`, `weight`, medidas obrigatórias, `isUnitizedContent` se aplicável, `isDistributedWeight` / recomendações).
    - **Bloco 7: Resultado**
      - Exibir após `handleTela6Submit` popular `elegibleTemplates` (pode continuar como está, só deixando o `MotionBox` sempre na árvore; usar uma condição simples do tipo `!!elegibleTemplates.length` para mostrar o conteúdo do resultado).
- **4. Extrair e reutilizar lógica de decisão**
  - Transformar decisões hoje embutidas nos handlers em helpers puros, por exemplo em `index.tsx` mesmo:
    - `hasValidDimensions(form)` → true quando length/width (e height, se não for pallet) forem > 0.
    - `shouldAskUnitizedContent(form)` → usa `prodType` e arrays `FRACTIONED_PROD_TYPES`/`ASK_CONTENT_PROD_TYPES`.
    - `shouldAskDistributedWeight(form)` → encapsula a lógica de `advanceFromTela4Check` usando `WEIGHT_THRESHOLD_KG`, `LENGTH_THRESHOLD_M`, `WIDTH_THRESHOLD_M`.
    - `isTechnicalFlowComplete(form)` → agrupa os critérios para liberar o bloco de dados de contato.
  - Isso evita duplicação e deixa os `Collapse in={...}` mais legíveis.
- **5. Ajustar UX sem steps**
  - Garantir que, conforme o usuário preenche:
    - As seções anteriores **permaneçam abertas** (sem sumir), apenas colapsando/expandindo internamente se você ainda quiser animação.
    - Não haja mudança brusca de largura/altura do container pai (já mitigado com `SimpleGrid`, `minH` fixas e não removendo blocos grandes da árvore).
  - Revisar textos de ajuda para garantir que não mencionem mais "próxima tela" ou "avançar".
- **6. Manter validações e envio**
  - Reaproveitar as validações atuais de `handleTela6Submit` (CNPJ, e-mail etc.) sem alteração.
  - Garantir que nada mais faça `preventDefault` em forms intermediários (já que não haverá mais `onSubmit`/"Continuar"), para evitar comportamento inesperado.
- **7. Verificação final e limpeza**
  - Conferir se não restaram imports não usados (por exemplo coisas ligadas a steps antigos, handlers removidos).
  - Testar manualmente os fluxos principais:
    - Caixa / Engradado / Palete / Any
    - Produtos de cada grupo (`UNITIZED_PROD_TYPES`, `FRACTIONED_PROD_TYPES`, `ASK_CONTENT_PROD_TYPES`).
    - Exportação SIM/NÃO.
    - Casos em que o peso/medidas exigem ou não a pergunta de peso distribuído.
  - Ajustar detalhes visuais de espaçamento entre seções, mantendo tudo centralizado como já está.

