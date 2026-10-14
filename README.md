# 🎷 CMA — Consciência Musical Aplicada

App de estudo de saxofone organizado em **raízes**. Cada raiz tem suas
**ramificações**, com exercícios, referências e prazos definidos pelo aluno.
Funciona no navegador do celular, pode ser instalado na tela inicial e
funciona offline. Os dados de cada aluno ficam salvos no próprio aparelho.

## As 6 raízes

1. 🎧 **Escuta**: referências de saxofonistas, estilos e setup
2. 🥁 **Figuras Rítmicas**: codificar as rítmicas dentro dos gêneros musicais
3. 🎼 **Estudos Melódicos**: músicas, escalas, intervalos e arpejos (cantarolar → fatiar → devagar → acelerar)
4. 👅 **Articulações**: conhecer e aplicar no momento certo
5. 🌊 **Dinâmicas**: transmitir a emoção da música
6. 🍒 **Ornamentos**: a cereja do bolo

## O que o aluno pode fazer

- **Início**: cronômetro de prática, metrônomo, próximos prazos (com aviso de atrasados), meta semanal e sequência de dias
- **Raízes**: progresso de cada raiz, ramificações, exercícios, referências (abrem no YouTube) e PDFs do Drive
- **Exercício**: passo a passo, prazo escolhido pelo aluno, andamento atual × alvo e metrônomo
- **Diário**: registro de cada prática ligado à raiz e ao exercício
- **Ajustes**: nome, meta semanal e backup (exportar/importar)

## Como editar o conteúdo (professor)

Todo o conteúdo fica em **`conteudo.js`**: raízes, ramificações, exercícios, cores, ícones, frases do dia e o "por que importa" de cada raiz. As instruções estão no topo do arquivo.

Os métodos em PDF ficam em **`metodos.js`**: cada indicação diz o método, a página (ou o número do exercício), o assunto e a ramificação onde ele entra. O app mostra isso em cada ramificação ("Nos métodos"), em cada exercício e na aba **Métodos**, que tem busca por assunto. Os PDFs abrem no Google Drive, então o aluno precisa ter acesso pelo e-mail dele.

> ⚠️ O conteúdo atual é um **rascunho** para revisão.
> Não mude o `id` de um exercício já publicado: ele guarda o progresso dos alunos.

## Métodos em PDF (Google Drive)

1. No Drive, crie a pasta **CMA** com uma subpasta para cada raiz:
   `1 Escuta`, `2 Figuras Rítmicas`, `3 Estudos Melódicos`, `4 Articulações`, `5 Dinâmicas`, `6 Ornamentos`
2. Coloque os PDFs em cada subpasta
3. Compartilhe a pasta **CMA** como **"Qualquer pessoa com o link: Leitor"**, senão os alunos não conseguem abrir
4. Peça ao Claude para atualizar os links no app (`pastas` e `livros` em `metodos.js`)

## Como publicar (gratuito, com GitHub Pages)

1. No GitHub, abra o repositório → **Settings** → **Pages**
2. Em *Source*, escolha **Deploy from a branch**, selecione a branch e a pasta `/ (root)` e salve
3. Em alguns minutos o endereço aparece no topo da página. Envie esse link aos alunos

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
| `conteudo.js` | Raízes, ramificações, exercícios e referências (edite aqui) |
| `metodos.js` | Biblioteca de métodos: página/exercício → assunto → ramificação, e pastas do Drive |
| `icones.js` | Ícones e ilustrações das raízes (SVG) |
| `index.html` | Estrutura das telas |
| `app.js` | Funcionamento do app (prazos, metrônomo, diário) |
| `styles.css` | Visual (cores, tamanhos) |
| `sw.js` | Funcionamento offline |
| `manifest.webmanifest`, `icons/` | Nome e ícone ao instalar no celular |
