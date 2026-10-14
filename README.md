# 🎷 Sax Estudo

App para os alunos de saxofone acompanharem a prática e seguirem as lições.
Funciona no navegador do celular, pode ser instalado na tela inicial e
funciona offline. Os dados de cada aluno ficam salvos no próprio aparelho.

## O que o aluno pode fazer

- **Início**: cronômetro de prática, minutos na semana, dias seguidos e meta semanal
- **Diário**: registrar cada sessão (data, minutos, o que praticou, como foi, anotações), editar e apagar
- **Lições**: lições por nível (Iniciante, Intermediário, Avançado) com objetivos,
  exercícios e materiais; o aluno marca como concluída
- **Ajustes**: nome, meta semanal e backup (exportar/importar) para trocar de celular

## Como editar as lições (professor)

Todo o conteúdo fica no arquivo **`licoes.js`**. Para adicionar uma lição, copie
um bloco `{ ... }` existente, cole no final da lista e altere os textos.
As instruções estão no topo do próprio arquivo.

Para adicionar vídeos ou partituras, preencha `materiais`:

```js
materiais: [
  { tipo: "video", titulo: "Demonstração da escala", url: "https://www.youtube.com/watch?v=..." },
  { tipo: "partitura", titulo: "Exercício em PDF", url: "materiais/escala-do.pdf" }
]
```

Arquivos (PDF, MP3, imagens) podem ser colocados na pasta `materiais/`.

> Não mude o `id` de uma lição já publicada — é ele que guarda o progresso dos alunos.

Depois de alterar o conteúdo, os alunos recebem a versão nova na próxima vez
que abrirem o app (com internet).

## Como publicar (gratuito, com GitHub Pages)

1. No GitHub, abra o repositório → **Settings** → **Pages**
2. Em *Source*, escolha **Deploy from a branch**, selecione a branch e a pasta `/ (root)` e salve
3. Em alguns minutos o endereço aparece no topo da página (ex.: `https://SEU-USUARIO.github.io/claude/`)
4. Envie esse link aos alunos

### Instalar no celular

- **Android (Chrome)**: abrir o link → menu ⋮ → *Instalar app* / *Adicionar à tela inicial*
- **iPhone (Safari)**: abrir o link → botão Compartilhar → *Adicionar à Tela de Início*

## Testar no computador

```sh
python3 -m http.server 8000
```

E abra `http://localhost:8000`.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `licoes.js` | Conteúdo das lições (edite aqui) |
| `index.html` | Estrutura das telas |
| `app.js` | Funcionamento do app |
| `styles.css` | Visual (cores, tamanhos) |
| `sw.js` | Funcionamento offline |
| `manifest.webmanifest`, `icons/` | Nome e ícone ao instalar no celular |
