# No Eixo

App pessoal para ficar **no eixo**: treino na Smart Fit (Treino A e B com foto de cada exercício), plano de alimentação com marmitas, rotina por dia e horário, controle de álcool, hábitos, medidas do corpo e revisão da semana.

- Funciona **offline**, sem login e sem nuvem: tudo fica salvo no próprio iPhone.
- Instalável como app (PWA): ícone na tela de início, abre em tela cheia.
- Todo o conteúdo (pratos, treinos, rotina, plano de 12 semanas) já vem pronto no primeiro dia, e tudo é editável depois.

> Plano geral de alimentação saudável, não substitui um nutricionista.
> Se você bebia todos os dias e em grande quantidade, faça a redução com acompanhamento médico.

---

## 1. Como rodar no computador

Precisa do [Node.js](https://nodejs.org) versão 18 ou mais nova.

```bash
npm install        # instala as dependências (só na primeira vez)
npm run dev        # abre em http://localhost:5173
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` | Gera a versão de produção na pasta `dist/` |
| `npm run preview` | Abre a versão de produção em http://localhost:4173 (com modo offline) |
| `npm test` | Roda os testes da lógica (pontuação, sequências, álcool, treino, plano alimentar, lista de compras, estoque, .ics…) |
| `npm run lint` | Verifica o código |

---

## 2. Como publicar de graça na Vercel (passo a passo)

A Vercel hospeda o app de graça e te dá um endereço (ex.: `no-eixo.vercel.app`) para abrir no iPhone.

1. **Código no GitHub.** O código já está no repositório `saxofonevm/claude`.
   Se o app estiver num branch separado (ex.: `claude/no-eixo-app-v2-…`), junte-o ao `main` pelo GitHub (Pull request → *Merge*) **ou** escolha esse branch no passo 6.
2. Acesse **https://vercel.com/signup**.
3. Clique em **Continue with GitHub** e autorize com a sua conta do GitHub. Pronto: conta criada (plano *Hobby*, gratuito).
4. No painel da Vercel, clique em **Add New… → Project**.
5. Na lista *Import Git Repository*, encontre o repositório **claude** e clique em **Import**.
   Se ele não aparecer, clique em *Adjust GitHub App Permissions* e libere o acesso a esse repositório.
6. A Vercel detecta tudo sozinha (*Framework Preset: Vite*, *Build Command: `npm run build`*, *Output Directory: `dist`*). Não precisa mudar nada.
   Se o app ainda não estiver no `main`, depois do primeiro deploy vá em **Settings → Git → Production Branch** e coloque o nome do branch.
7. Clique em **Deploy** e espere 1 ou 2 minutos.
8. Aparece a tela de parabéns com o endereço do app. Copie esse link e abra no Safari do iPhone.

Toda vez que o código mudar no GitHub, a Vercel publica a nova versão sozinha. O app no iPhone se atualiza na próxima vez que você abrir (seus dados continuam lá).

O arquivo `vercel.json` já cuida das rotas internas do app (para não dar erro 404 ao recarregar uma tela).

---

## 3. Como instalar no iPhone

1. Abra o endereço do app no **Safari** (precisa ser o Safari).
2. Toque no botão **Compartilhar** (o quadrado com a seta para cima).
3. Role e toque em **Adicionar à Tela de Início**.
4. Confirme o nome **No Eixo** e toque em **Adicionar**.
5. Abra pelo ícone na tela de início: o app abre em tela cheia e funciona sem internet.

**Lembretes no Calendário do iPhone** (notificações de app web não são confiáveis no iOS):
abra **Mais → Configurações → Lembretes → Baixar lembretes (.ics)**, abra o arquivo e toque em **Adicionar todos**.
São eventos semanais: véspera do treino 21h30, treino 5h00, mercado quinta 8h, marmitas quinta 9h e domingo 10h, plano do show sexta e sábado 17h e revisão domingo 19h. Se mudar a rotina, gere o arquivo de novo (apague antes o calendário antigo para não duplicar).

**Backup:** os dados ficam só no aparelho. De vez em quando, em **Configurações → Backup**, toque em **Exportar tudo (JSON com fotos)** e salve no iCloud Drive. Para restaurar, use **Importar backup**.

---

## 4. Como editar treinos, pratos e rotina

Pelo próprio app:

- **Pratos:** Comida → Catálogo → abra o prato → ✏️ (edite nome, proteína, ingredientes e preparo; crie pratos novos com **+**).
- **Rotina:** Rotina → Editar rotina (horários, tarefas e quais viram lembrete).
- **Dias de treino, show e trabalho, metas e regras do álcool:** Mais → Configurações.
- **Fotos:** em cada exercício, **Tirar foto do aparelho** (a foto da sua Smart Fit vira a principal); em cada prato, **Fotografar meu prato**.

Pelo código, todo o conteúdo pré-carregado fica em arquivos simples dentro de `src/data/`:

| Arquivo | Conteúdo |
|---|---|
| `src/data/treinos.ts` | Treino A e B (exercícios, séries, repetições, descanso, cardio) e os princípios do treino |
| `src/data/exercicios.ts` | Ficha de cada exercício: execução, erros comuns, ajuste do aparelho, substitutos, imagens |
| `src/data/pratos.ts` | Pratos de café, almoço, lanche e jantar (ingredientes com quantidades para a lista de compras) |
| `src/data/receitas.ts` | Bases em lote (frango desfiado, carne moída, feijão, arroz, legumes, ovos) com timers |
| `src/data/rotina.ts` | Rotina padrão por tipo de dia |
| `src/data/plano12.ts` | Fases do plano de 12 semanas (séries e meta de proteína por fase) |
| `src/data/alimentos.ts` | Banco de alimentos (proteína por porção, base TACO) |
| `src/data/habitos.ts`, `semana0.ts`, `padroes.ts` | Hábitos iniciais, checklist da Semana 0 e perfil/configurações padrão |

O conteúdo é copiado para o banco do aparelho na **primeira** vez que o app abre, para nunca sobrescrever o que você editou. Para aplicar no celular uma mudança feita nesses arquivos, use **Configurações → Conteúdo → Restaurar pratos/exercícios originais** (suas fotos são mantidas) ou **Rotina → Editar rotina → Restaurar rotina padrão**.

---

## 5. Como o app funciona por dentro

- **React 18 + Vite + TypeScript (strict)**, **Tailwind CSS** com componentes no estilo shadcn/ui, ícones **Lucide**.
- **Dexie.js (IndexedDB)**: banco local, com migrações versionadas (`src/db/db.ts`). Fotos salvas como Blob comprimido (máx. 1280 px).
- **vite-plugin-pwa**: service worker com cache de todo o app e das imagens dos exercícios (funciona offline).
- **Recharts** (gráficos), **date-fns** (pt-BR), **Zustand** (estado), **React Router**, **Vitest** (testes).
- Datas em ISO, sempre no fuso **America/Sao_Paulo**.

```
src/
  app/            rotas, layout, navegação inferior, cronômetro de descanso
  components/     componentes de interface (cards, anéis, contadores, folhas, mídia)
  data/           conteúdo pré-carregado (editável)
  db/             tipos, banco Dexie e carga inicial
  domain/         regras de negócio puras + testes (*.test.ts)
  features/       hoje, treino, alimentacao, marmitas, rotina, alcool, habitos, corpo, semana, config
  hooks/ lib/ store/
public/exercicios/  fotos dos exercícios (offline)
```

**Pontuação do Eixo (0–100):** Treino 25 (dia de descanso planejado conta como cumprido) · Alimentação 25 (proporcional à meta de proteína da fase) · Álcool 30 (precisa registrar o dia) · Rotina/Hábitos 20. Dia **no eixo** = 70 pontos ou mais.

---

## 6. Créditos das imagens

- **Fotos dos exercícios:** [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), de yuhonas e colaboradores, liberado em **domínio público** ([Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md)). As imagens usadas foram baixadas para `public/exercicios/` e redimensionadas.
- **Ilustrações dos pratos e dos grupos musculares:** desenhos próprios do app (SVG).
- **Ícones:** [Lucide](https://lucide.dev) (licença ISC).

---

## 7. Melhorias futuras

- Sincronização opcional na nuvem (para usar em mais de um aparelho e ter backup automático).
- Integração com o app **Saúde** da Apple (peso, treinos, água) — exige um app nativo ou atalho do iOS.
- Notificações push quando o suporte do iOS a PWAs ficar confiável.
- Leitura de código de barras e banco de alimentos maior (TACO completa).
- Cronômetro da prancha com contagem regressiva por série.
- Gráfico de volume semanal por grupo muscular e sugestão automática de deload.
- Compartilhar a revisão da semana com um treinador/nutricionista.
