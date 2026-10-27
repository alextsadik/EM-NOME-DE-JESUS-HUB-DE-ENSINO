# Adição da Seção "Guia de Autoridade" na Batalha da Fé

Implementação de uma seção interativa dedicada ao fortalecimento bíblico do crente ao exercer as Vozes de Comando contra principados e potestades, com passagens canônicas de autoridade delegada por Cristo, suporte vocal e ativação de proclamações.

---

### Decisões Confirmadas com o Usuário

> [!IMPORTANT]
> **Respostas Confirmadas do Usuário:**
> 1. **Organização Visual:** Cartões interativos organizados por **armas espirituais e esferas de autoridade** (Armadura de Deus, Chaves do Reino, O Sangue do Cordeiro, Soberania do Nome de Jesus e Resistência Espiritual).
> 2. **Recursos Interativos:**
>    - **Botão "Ouvir Escritura":** Leitura em voz alta via Web Speech API em português com entonação reverente.
>    - **Botão "Proclamar com Fé":** Proclamação imediata da autoridade que reproduz o acorde celestial, atualiza a fidelidade no gráfico do ministério e registra a ação espiritual.

---

## 1. Visão Geral e Conceito Bíblico

### Por Que um Guia de Autoridade?
A autoridade espiritual cristã não repousa em entusiasmo carnal ou fórmulas vazias, mas na **Palavra Eterna de Deus**:
- *"Eis que vos dei autoridade para pisar serpentes e escorpiões e sobre todo o poder do inimigo, e nada vos causará dano algum"* (Lucas 10:19).
- *"As armas da nossa milícia não são carnais, mas sim poderosas em Deus para destruição de fortalezas"* (2 Coríntios 10:4).
- O Guia de Autoridade instrui o jogador sobre a base jurídica e espiritual de cada comando emitido contra principados e potestades.

---

## 2. Estrutura do Conteúdo e Passagens Selecionadas

```
┌────────────────────────────────────────────────────────────────────────┐
│ FILTRO DE ESFERAS: Todas | Armadura de Deus | Chaves do Reino | Sangue │
├────────────────────────────────────────────────────────────────────────┤
│ CARTÃO DE AUTORIDADE:                                                  │
│ - Título da Arma: "As Chaves do Reino dos Céus e o Poder de Ligar"     │
│ - Referência: Mateus 16:19 & Mateus 18:18                             │
│ - Texto Sagrado: "Tudo o que ligardes na terra terá sido ligado..."    │
│ - Instrução de Combate: Como usar para amarrar o valente e soltar vidas│
│                                                                        │
│ [Ouvir Versículo] [Copiar Texto] [Proclamar Autoridade Imediata]       │
└────────────────────────────────────────────────────────────────────────┘
```

### Esferas de Autoridade Contempladas:
1. **Esfera da Autoridade Delegada:** Lucas 10:19 & Mateus 28:18-19 (Pisar serpentes e escorpiões).
2. **Esfera das Chaves do Reino:** Mateus 16:19 & Mateus 18:18 (Ligar e desligar nos céus e na terra).
3. **Esfera da Vitória Consumada na Cruz:** Colossenses 2:15 & Apocalipse 12:11 (Despojo dos principados e vitória pelo Sangue).
4. **Esfera da Armadura Completa de Deus:** Efésios 6:10-18 (Capacete, escudo da fé, espada do Espírito).
5. **Esfera da Submissão e Resistência:** Tiago 4:7 & 1 Pedro 5:8-9 (Sujeitar-se a Deus e o diabo fugirá).
6. **Esfera da Guarda Angelical:** Salmos 91:11-13 (Ordem aos anjos para guardar em todos os caminhos).

---

## 3. Arquitetura Técnica e Arquivos

1. **`src/types/game.ts`**:
   - Definição da interface `AuthorityScriptureGuide`:
     ```typescript
     export interface AuthorityScriptureGuide {
       id: string;
       title: string;
       sphere: 'armadura' | 'chaves_reino' | 'sangue_cruz' | 'autoridade_delegada' | 'guarda_angelical';
       scriptureRef: string;
       text: string;
       combatInstruction: string;
       proclamationDeclaration: string;
     }
     ```
2. **`src/data/biblicalContent.ts`**:
   - Adição do array `AUTHORITY_SCRIPTURES` com 6 passagens fundamentais completas e instruções pastorais.
3. **`src/components/SpiritualBattleView.tsx`**:
   - Inserção da seção **"Guia de Autoridade das Escrituras"** com filtros de esferas, cartões estilizados em ardósia nobre e ouro, controles de áudio e atalho para proclamar.
4. **Validação:**
   - Execução de `lint_applet` e `compile_applet`.

---

## 4. Próximos Passos
Após sua aprovação, implementaremos a seção interativa **"Guia de Autoridade"** no módulo de Batalha da Fé.
