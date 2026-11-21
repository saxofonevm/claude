# Como editar os treinos do dia

Os treinos ficam no arquivo `conteudo/treinos.json`. Você pode criar, mudar ou apagar treinos sem mexer no código do app.

## Como o arquivo é organizado

```json
{
  "versao": 1,
  "categorias": {
    "tecnica":      { "nome": "Técnica",      "pilar": "melodia" },
    "percepcao":    { "nome": "Percepção",    "pilar": "escuta" },
    "improvisacao": { "nome": "Improvisação", "pilar": "ornamentos" },
    "repertorio":   { "nome": "Repertório",   "pilar": null }
  },
  "treinos": [ ...lista de treinos... ]
}
```

- **categorias**: os tipos de bloco. `nome` é o que aparece na tela, e você pode trocar à vontade. `pilar` liga a categoria a um pilar do app. Os pilares que existem hoje são `escuta`, `ritmo`, `melodia`, `articulacao`, `dinamica` e `ornamentos`. Use `null` quando não houver pilar.
- **treinos**: cada treino tem `id`, que deve ser único (por exemplo `t06`), `nome` e `blocos`.

## Um bloco

```json
{ "categoria": "tecnica", "minutos": 5, "titulo": "Escalas maiores",
  "instrucao": "Dó, Sol e Fá maior em toda a extensão.",
  "exercicio": "mel-02" }
```

Cada bloco pode apontar para **um** destes (ou nenhum):

| Campo | Para onde leva | Exemplo |
|---|---|---|
| `"exercicio"` | Um exercício dos Pilares | `"mel-02"` |
| `"material"` | Uma página de um método da Biblioteca | `{ "livro": "arpejos-tv", "onde": "pág. 1–2" }` |
| `"musica"` | Uma música do Repertório essencial | `"summertime"` |

Os códigos de exercícios, livros e músicas estão em `conteudo.js`, `metodos.js` e `repertorio.js`. Se não achar, me peça a lista.

## Regras do JSON (onde costuma dar erro)

- Textos sempre entre **aspas duplas**: `"assim"`.
- **Vírgula** entre os itens de uma lista, mas **nunca depois do último**.
- Cada `{` precisa do seu `}` e cada `[` do seu `]`.

## Antes de publicar

Rode o verificador (ou me peça para rodar):

```bash
node ferramentas/verificar-treinos.js
```

Ele avisa sobre vírgula errada, exercício que não existe, categoria que não existe e treino fora de 15 a 20 minutos.

## Como o app escolhe o treino

- Cada dia mostra um treino da lista, em rodízio. Ao chegar ao fim da lista, volta ao primeiro.
- O aluno pode tocar em "Trocar por outro treino" antes de começar.
- Ao concluir, o tempo dos blocos feitos vai para o Diário e conta nos dias seguidos.
