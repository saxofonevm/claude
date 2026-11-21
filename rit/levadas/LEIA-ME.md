# Levadas do Tiago: como acrescentar as suas gravações

As levadas gravadas aparecem no Naipe RIT na seção **Levadas do Tiago**. Elas tocam em loop, e a cifra (se houver) acompanha compasso a compasso, já escrita para o sax do aluno.

## 1. Grave

- **Formato**: MP3 (recomendado, arquivo menor), M4A ou WAV.
- **Comece no tempo 1**, sem silêncio antes. Se houver silêncio, informe quantos segundos em `"inicio"`.
- **Grave um número inteiro de compassos**, por exemplo 4 ou 8. O loop emenda o fim no começo.
- **Andamento fixo**, de preferência gravado com metrônomo no fone.
- **Grave 2 ou 3 andamentos** de cada levada (por exemplo 70, 90 e 110). Uma gravação só toca no andamento em que foi feita: acelerar o áudio mudaria a afinação.
- **Nome do arquivo** sem acentos e sem espaços: `samba-partido-90.mp3`.

## 2. Coloque o arquivo na pasta

`rit/levadas/audios/`

## 3. Cadastre em `rit/levadas/levadas.json`

```json
{
  "versao": 1,
  "levadas": [
    {
      "id": "samba-partido-90",
      "nome": "Partido-alto",
      "estilo": "Samba",
      "arquivo": "samba-partido-90.mp3",
      "bpm": 90,
      "compasso": "2/4",
      "compassos": 8,
      "cifra": "| C7M | A7 | Dm7 | G7 | C7M | A7 | Dm7 | G7 |"
    }
  ]
}
```

| Campo | O que é | Obrigatório |
|---|---|---|
| `id` | Código único, sem espaços. É usado para ligar a levada a um treino | sim |
| `nome` | Nome que aparece no botão | sim |
| `estilo` | Agrupa as levadas na tela (Samba, Choro, Baião, Jazz…) | sim |
| `arquivo` | Nome exato do arquivo dentro de `audios/` | sim |
| `bpm` | Andamento em que você gravou | sim |
| `compasso` | `2/4`, `3/4`, `4/4`, `6/8` ou `12/8` | sim |
| `compassos` | Quantos compassos tem o loop | recomendado |
| `cifra` | Harmonia em **som real (Dó)**, um compasso entre barras | não |
| `inicio` | Segundos de silêncio antes do tempo 1 | não |

Regras do JSON: textos entre aspas duplas, vírgula entre os itens e nenhuma vírgula depois do último.

## 4. Apague o exemplo

A primeira levada (`exemplo-100`, arquivo `exemplo-100bpm.wav`) só demonstra o funcionamento. Quando cadastrar as suas, apague o item do cadastro e o arquivo, ou me peça.

## 5. Ligar uma levada a um treino

No arquivo `conteudo/treinos.json`, dentro de um bloco:

```json
"rit": { "levada": "samba-partido-90" }
```

O botão **Tocar com a banda** abre o RIT já na sua levada.
