# Sistema de Níveis de Maturidade Espiritual & Conquistas Ocultas (Badges)

Implementação dos Níveis de Maturidade Espiritual guiados pela pontuação do WorshipScore com privilégios visuais dinâmicos (selos dourados, auras radiantes e molduras de avatar) e um novo sistema de Conquistas Ocultas com silhuetas misteriosas e dicas sutis no Altar das Medalhas.

## Decisões Confirmadas & Respostas do Usuário

> [!IMPORTANT]
> Decisões tomadas na Fase 1 de alinhamento com base na preferência do usuário:

- **Exibição dos Níveis de Maturidade e Privilégios Visuais**: Confirmado o uso de **selos dourados com auras radiantes no perfil e molduras de avatar ornamentadas** (evoluindo de Bronze do Santuário até a Coroa de Ouro Eterna com partículas).
- **Aparência das Conquistas Ocultas no Modal**: Confirmada a exibição de **silhuetas misteriosas com dicas sutis e proféticas sobre o desafio bíblico**, revelando o selo completo e a bênção somente quando o marco for alcançado.

---

## 1. Visão Geral & Conceito Central

- **O que faz**:
  1. **Níveis de Maturidade Espiritual**: Vincula o progresso contínuo de adoração, escuta na Rádio 24h, meditações e decretos ao `WorshipScore`. Conforme o crente atinge faixas de pontuação bíblicas (Vigia, Cantor, Levita, Salmista, Coluna, Adorador Eterno), desbloqueia títulos honoríficos, molduras celestiais de avatar e auras com partículas visuais em toda a aplicação.
  2. **Conquistas Ocultas do Reino (Secret Badges)**: Acrescenta uma seção dedicada no `MedalsModal` que lista marcos secretos do discipulado (ex: 100 horas de escuta na Rádio, 10 decretos proclamados em um único dia, vigília na madrugada, intercessão contínua). As medalhas ainda não conquistadas aparecem como silhuetas místicas sombreadas com enigmas bíblicos que inspiram o jogador a buscar mais intimidade com o Senhor.
- **Público-Alvo**: Jogadores e discípulos que buscam motivação e gamificação edificante para sua rotina de comunhão diária e adoração contínua (Colossenses 3:17).
- **Valor Principal**: Estimula o aprofundamento espiritual com marcos gratificantes e identidade visual reverente, sem apelar para clichês de jogos seculares.

---

## 2. Experiência do Usuário & Design Visual

### Fluxos Principais
1. **Inspeção de Maturidade e Molduras**:
   - No cabeçalho (`TopBar`) e barra devocional (`FruitOfSpiritBar`), o avatar do jogador exibe a moldura celestial correspondente ao seu nível atual (ex: moldura com brilho dourado e aura para Adorador Eterno).
   - Ao passar o cursor ou clicar, um card devocional apresenta o título atual, pontos acumulados, versículo-âncora e o próximo patamar de maturidade com barra progressiva.
2. **Descoberta das Conquistas Ocultas no Modal de Medalhas**:
   - Ao abrir o `MedalsModal`, o usuário encontra um seletor no topo entre **Medalhas Ministeriais** (as 8 medalhas já existentes) e **Conquistas Ocultas do Reino** (novas 8 insígnias secretas).
   - As conquistas bloqueadas exibem um contorno estilizado em silhueta escura com brilho sutil e uma dica sagrada (ex: *"Dica: À meia-noite, Paulo e Silas oravam e cantavam hinos a Deus..."*).
   - Ao cumprir um marco secreto, a insígnia é revelada com uma animação celestial, sino harmônico e botão de reivindicação de Frutos do Espírito e Pontos de Graça.

### Identidade Visual & Tema
- **Cores & Tokens**: Paleta bíblica com 60% ardósia profunda (`#020617` / `#0f172a`), 30% superfícies estruturais em vidro fumê e bordas finas âmbar/douradas (`border-amber-500/20`), 10% acentos dourados e auras radiantes (`#f59e0b`, `#fbbf24`, `#fef08a`).
- **Tipografia**: Cinzel para títulos nobres e nomes de patamar de maturidade; Plus Jakarta Sans para leitura de instruções e textos reflexivos; numerais tabulares para contagem de horas e pontuação.
- **Molduras de Avatar**:
  - *Nível 1 (Vigia)*: Aro simples de prata celulóide com ponto de luz suave.
  - *Nível 2 (Cantor)*: Moldura de bronze esculpido com notas de adoração.
  - *Nível 3 (Levita)*: Aro de ouro polido com trombeta levítica.
  - *Nível 4 (Salmista)*: Moldura ametista com filigranas de harpa e pergaminho.
  - *Nível 5 (Coluna)*: Moldura de safira com pilares esculpidos de Jerusalém.
  - *Nível 6 (Adorador Eterno)*: Coroa de ouro puro com aura pulsante dourada e halo de luz divina.

---

## 3. Decisões de Produto & Arquitetura de Dados

- **Cálculo Unificado de WorshipScore**: Utiliza a função existente `calculateWorshipScore(stats)`, somando minutos de rádio, desafios de salmos completados e minutos de meditação, garantindo que o progresso prévio do jogador seja 100% reconhecido.
- **Rastreamento de Metas Temporais Diárias**:
  - Para a conquista *"10 decretos em um único dia"*, o sistema verifica `stats.todaySpiritualStats.decrees` ou calcula os decretos proclamados na data atual (`todayDateStr`), desbloqueando automaticamente a conquista secreta.
  - Para a conquista *"100 horas de adoração"*, verifica se `radioListeningMinutes >= 6000` (ou oferece marcos progressivos com feedback claro).
  - Para *"Vigília da Madrugada"*, detecta se a atividade ocorreu entre 00:00 e 06:00.
- **Persistência**: Armazenamento integrado em `PlayerStats` sob `unlockedHiddenBadges?: string[]` e `claimedHiddenBadges?: string[]` salvo automaticamente no `localStorage` via chave existente.

---

## 4. Arquitetura Técnica & Diagrama de Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App State (PlayerStats)                         │
│   worshipScore · radioListeningMinutes · dailyProgress · unlockedBadges│
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │   TopBar & FruitBar    │       │      MedalsModal       │
       │   Avatar com Moldura   │       │   Aba Conquistas       │
       │   Selo & Aura Dourada  │       │   Ocultas & Dicas      │
       └────────────┬───────────┘       └────────────┬───────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │ SpiritualMaturityBadge │       │    HiddenBadgesGrid    │
       │  Tooltip com Detalhes  │       │  Silhuetas Misteriosas │
       │  do Nível e Vantagens  │       │  e Revelação de Graça  │
       └────────────────────────┘       └────────────────────────┘
```

### Mapeamento dos Novos Tipos e Estruturas
1. **`SpiritualMaturityTier`**:
   - `id`: `vigia` | `cantor` | `levita` | `salmista` | `coluna` | `adorador_eterno`
   - `title`: Título nobiliárquico bíblico
   - `minScore`: Pontuação mínima de WorshipScore
   - `avatarFrameClass`: Classes de borda e efeito de aura no avatar
   - `auraColor`: Cor do brilho radiante
   - `perkDescription`: Privilégio espiritual visual e bênção diária
2. **`HiddenBadge`**:
   - `id`: Identificador único
   - `title`: Nome da Conquista
   - `secretHint`: Dica sutil e bíblica antes do desbloqueio
   - `scriptureRef`: Passagem bíblica revelada
   - `description`: Explicação do feito espiritual
   - `icon`: Ícone temático
   - `condition`: Função de verificação contra `PlayerStats`
   - `reward`: Bônus de fruto e pontos de graça

---

## Verificação e Próximos Passos
- Após aprovação, executar a criação dos dados em `src/data/spiritualMaturity.ts` e `src/data/hiddenBadges.ts`.
- Atualizar `types/game.ts` e a interface `MedalsModal.tsx` com a nova aba e silhuetas estilizadas.
- Enriquecer o avatar no `TopBar.tsx`, `RankDeAdoradores.tsx` e `FruitOfSpiritBar.tsx` com as molduras e auras douradas.
- Compilar o projeto com `compile_applet` e validar com `lint_applet`.
