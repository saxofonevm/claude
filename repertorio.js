/*
 * Naipe — Repertório essencial (aba Estudo)
 * As músicas que todo saxofonista toca, com o caminho até a partitura e o playback no acervo do Drive.
 * Aqui ficam só o título, os autores e onde achar cada música. As partituras continuam no Drive.
 *
 * alto / tenor / playback: id do arquivo no Drive (partitura em Mi♭, partitura em Si♭, áudio para tocar junto).
 * livro: [fonte, página impressa] quando a música está num songbook ou Real Book.
 * nivel: 1 primeiras músicas · 2 intermediário · 3 desafio
 */
window.NAIPE_REPERTORIO = {
  fontes: {
    rb1: { titulo: "The Real Book Vol. 1 (Mi♭)", nota: "Sax alto e barítono. Página impressa no topo da folha.", arquivo: "1SLYMiBO0f7ZMpBFiBldVESJW2lLhJ7Rs" },
    rb1bb: { titulo: "The Real Book Vol. 1 (Si♭)", nota: "Sax tenor e soprano. Página impressa no topo da folha.", arquivo: "177A510Iy-aMU1nxBpRwL4ryCmWMuUsGF" },
    choro1: { titulo: "O Melhor do Choro Brasileiro Vol. 1 (sax tenor)", nota: "Edição para sax tenor (Si♭).", arquivo: "1xRXLpF9fy3aCyDECN_xjCx-whppCV-f3" },
    choro2: { titulo: "O Melhor do Choro Brasileiro Vol. 2 (sax tenor)", nota: "Edição para sax tenor (Si♭).", arquivo: "1pbfHjNGwi8_ebNB-FOg8YD5nzJp9OeUm" },
  },
  estilos: [
    { id: "bossa", nome: "Bossa nova", texto: "Colcheias iguais, som macio e pouco vibrato. Ouça João Gilberto e Stan Getz antes de tocar." },
    { id: "jazz", nome: "Jazz", texto: "Os standards que se tocam em qualquer jam. Colcheias com swing e a melodia cantada antes do improviso." },
    { id: "choro", nome: "Choro", texto: "A escola brasileira de virtuosismo. Partituras em Si♭, da edição para sax tenor." },
    { id: "mpb", nome: "MPB, forró e samba", texto: "Melodias que o público canta junto. Ótimas para tocar em casamentos, rodas e apresentações." },
    { id: "pop", nome: "Baladas e pop", texto: "Os solos e temas que fizeram o saxofone famoso fora do jazz. Som cheio, vibrato e muita expressão." },
  ],
  musicas: [
    // Bossa nova
    { id: "garota", titulo: "Garota de Ipanema", autor: "Tom Jobim e Vinicius de Moraes", estilo: "bossa", nivel: 1, playback: "1De4jww6JSx2wlyukgsANOoCf68Jzj-Sn", livro: ["rb1", "pág. 171 (The Girl From Ipanema)"], livroBb: ["rb1bb", "pág. 171 (The Girl From Ipanema)"] },
    { id: "corcovado", titulo: "Corcovado", autor: "Tom Jobim", estilo: "bossa", nivel: 1, tenor: "1BlyQ84dQYzGTIqwZg-rM9KxTwm6K3crT", playback: "1kq6Hq94CUYkftyFvYr31wP_ZNSAbeRfN" },
    { id: "uma-nota", titulo: "Samba de Uma Nota Só", autor: "Tom Jobim e Newton Mendonça", estilo: "bossa", nivel: 1, tenor: "1Fik-15IwuLQpArjDQYzQGSshgcconh1D", playback: "1KfnOcvCOn3jYX31Jayyb_36Z-aH1S_Q4" },
    { id: "insensatez", titulo: "Insensatez", autor: "Tom Jobim e Vinicius de Moraes", estilo: "bossa", nivel: 1, alto: "1EOKsIOVtPYvFgS6TtIkadYgaJDIa6-Ay", tenor: "1rMrzIWWzW3zkYvdHd3NVTHaTITgWPx1g" },
    { id: "manha-carnaval", titulo: "Manhã de Carnaval", autor: "Luiz Bonfá e Antônio Maria", estilo: "bossa", nivel: 1, alto: "1DWe91ONXKCeA4nowNtLzFucgtu64_tqg", tenor: "1A_YZ_TRjGvv2eGGPCB1E-ah-5aLhhYcr", playback: "1J1ck3atMZSuefp56OV-z7s3oX6TMdcA6" },
    { id: "chega", titulo: "Chega de Saudade", autor: "Tom Jobim e Vinicius de Moraes", estilo: "bossa", nivel: 2, alto: "1ztE6aW2PrUSuxhVILtaHCb-rA6QuATZo", playback: "1r2lNFJ512Zex4ZxyfVelSreW04AYEgee" },
    { id: "wave", titulo: "Wave", autor: "Tom Jobim", estilo: "bossa", nivel: 2, alto: "1vUu5idK_kBTEwrne_MweR9KPao-Pz8-8", guia: "guia-wave" },
    { id: "meditacao", titulo: "Meditação", autor: "Tom Jobim e Newton Mendonça", estilo: "bossa", nivel: 2, alto: "1lR3SifwblN5R5u7OEzL0rRe8NUhsQJa_", tenor: "1vlDxbEhrdRAMG3gtNacFj7q9-cSs9Tme" },
    { id: "minha-namorada", titulo: "Minha Namorada", autor: "Carlos Lyra e Vinicius de Moraes", estilo: "bossa", nivel: 2, alto: "1Q6QgXWVAYd8uJn95n2bsTVi7eE9ixmNk", tenor: "1SIimE-4cn8len8LkzysAJamAuMOrko5N", playback: "1_xjQ0O1WaHppvct0329_0ej6dImhdoZW" },
    { id: "barquinho", titulo: "O Barquinho", autor: "Roberto Menescal e Ronaldo Bôscoli", estilo: "bossa", nivel: 2, alto: "1K55N2NmJsQ3fmmFyzKhUMHrJs2Bkdn3f", tenor: "1l89y3FrzCqc7Dn4gFvslVd4RIiX8LWyn" },
    { id: "itapua", titulo: "Tarde em Itapuã", autor: "Toquinho e Vinicius de Moraes", estilo: "bossa", nivel: 2, alto: "1Mp8vsD7m6bggTjRPYgev4DB5P6lKncSu", playback: "1iRolsidc5N-tuNK-SCSTka6bYXr1EEvw" },
    { id: "desafinado", titulo: "Desafinado", autor: "Tom Jobim e Newton Mendonça", estilo: "bossa", nivel: 3, tenor: "1PzhtLA8HvyCVFtB8ZezyhWe5YrRjCHcJ", playback: "1Lf0M--FdM4ENFpI91AdlJwLXDb65jO9r" },
    // Jazz
    { id: "summertime", titulo: "Summertime", autor: "George Gershwin", estilo: "jazz", nivel: 1, alto: "1cxVlqNhwmOqOyXfJ4zrvsIULnAb8B1jY", tenor: "1Rv_yCPcFnCekl7AJUp-l1b9xtthORo1s" },
    { id: "autumn-leaves", titulo: "Autumn Leaves", autor: "Joseph Kosma", estilo: "jazz", nivel: 1, livro: ["rb1", "pág. 36"], livroBb: ["rb1bb", "pág. 36"] },
    { id: "all-of-me", titulo: "All of Me", autor: "Gerald Marks e Seymour Simons", estilo: "jazz", nivel: 1, alto: "1eR3dr_eDNWt90aDvYokkzOOAyCftt4_q", tenor: "1vJo9ijYt3i7X6iJEif3sRHVWmDgqp9xY", playback: "1Y2nSzEHw351rvzoafGWK6XXXipkP-zyz" },
    { id: "wonderful-world", titulo: "What a Wonderful World", autor: "Bob Thiele e George David Weiss", estilo: "jazz", nivel: 1, alto: "1bWvBXrTPaK8UKhszcn0kv_fkCDWIXtq8", tenor: "1caHBkUGg9aVhdISo8S4yiVQaN0eEDc9i" },
    { id: "moon-river", titulo: "Moon River", autor: "Henry Mancini", estilo: "jazz", nivel: 1, alto: "1CFVi9LYSxn3CNFI6g6EizLYwWDDR4DoP" },
    { id: "blue-bossa", titulo: "Blue Bossa", autor: "Kenny Dorham", estilo: "jazz", nivel: 2, alto: "1uCNA0CWUX06UQRkxnvMoycU06H_1bpcE", tenor: "16hoieIMrSpXvatufeQOrhxikFud7ooXg" },
    { id: "all-blues", titulo: "All Blues", autor: "Miles Davis", estilo: "jazz", nivel: 2, livro: ["rb1", "pág. 13"], livroBb: ["rb1bb", "pág. 13"] },
    { id: "so-what", titulo: "So What", autor: "Miles Davis", estilo: "jazz", nivel: 2, livro: ["rb1", "pág. 399"], livroBb: ["rb1bb", "pág. 399"] },
    { id: "satin-doll", titulo: "Satin Doll", autor: "Duke Ellington e Billy Strayhorn", estilo: "jazz", nivel: 2, livro: ["rb1", "pág. 367"], livroBb: ["rb1bb", "pág. 367"] },
    { id: "a-train", titulo: "Take the “A” Train", autor: "Billy Strayhorn", estilo: "jazz", nivel: 2, livro: ["rb1", "pág. 421"], livroBb: ["rb1bb", "pág. 421"] },
    { id: "footprints", titulo: "Footprints", autor: "Wayne Shorter", estilo: "jazz", nivel: 2, livro: ["rb1", "pág. 157"], livroBb: ["rb1bb", "pág. 157"] },
    { id: "georgia", titulo: "Georgia on My Mind", autor: "Hoagy Carmichael", estilo: "jazz", nivel: 2, alto: "1JNROu4zPPbsWqErDzFs_1sl8cP4N7KX_", tenor: "1gPrF8Ih3mgXDyFmEoVKhg7Fo6qzr0zLU" },
    { id: "tenderly", titulo: "Tenderly", autor: "Walter Gross", estilo: "jazz", nivel: 2, alto: "1csbF_5RyCt6sFXhxGGS4T0O-AxRwGMjL" },
    { id: "bluesette", titulo: "Bluesette", autor: "Toots Thielemans", estilo: "jazz", nivel: 3, alto: "1RhLI5tUWYfXszoDIDTKumRBeA4o9Kia7", tenor: "1vVZtb-5HD92naKYWaTd83fdXHj0rPekT" },
    { id: "autumn-ny", titulo: "Autumn in New York", autor: "Vernon Duke", estilo: "jazz", nivel: 3, alto: "1XOUF_OyF8T5SRTGI5UCz6tbgb0ptTpV1", tenor: "1TI3imH6eH81ZEMkMFCh1TNAukMZQrm-t" },
    { id: "anthropology", titulo: "Anthropology", autor: "Charlie Parker e Dizzy Gillespie", estilo: "jazz", nivel: 3, alto: "1Zjo9aR0u-L-cp_3-xh4RACsWWpBAUgIS", tenor: "1eaz2h_OiU3qtEyOwzXcmfeW9o-ksQp91", playback: "1CRwk_sR9HsUvoJ5ZqoLBUs1ExyTVKg9F" },
    { id: "ornithology", titulo: "Ornithology", autor: "Charlie Parker e Benny Harris", estilo: "jazz", nivel: 3, alto: "1ELuLFOxBUu8fFVR3xgS-7mxsq8zFOsm6" },
    // Choro
    { id: "carinhoso", titulo: "Carinhoso", autor: "Pixinguinha e João de Barro", estilo: "choro", nivel: 2, tenor: "1K__WeDD4WguEk5rs-VK9QrDNLXwxuEJ8", livroBb: ["choro2", "pág. 12"] },
    { id: "flor-amorosa", titulo: "Flor Amorosa", autor: "Joaquim Callado", estilo: "choro", nivel: 2, livroBb: ["choro1", "pág. 31"] },
    { id: "lamentos", titulo: "Lamentos", autor: "Pixinguinha e Vinicius de Moraes", estilo: "choro", nivel: 2, livroBb: ["choro1", "pág. 36"] },
    { id: "ingenuo", titulo: "Ingênuo", autor: "Pixinguinha e Benedito Lacerda", estilo: "choro", nivel: 2, livroBb: ["choro1", "pág. 34"] },
    { id: "naquele-tempo", titulo: "Naquele Tempo", autor: "Pixinguinha e Benedito Lacerda", estilo: "choro", nivel: 2, livroBb: ["choro2", "pág. 40"] },
    { id: "odeon", titulo: "Odeon", autor: "Ernesto Nazareth", estilo: "choro", nivel: 2, livroBb: ["choro2", "pág. 44"] },
    { id: "pedacinhos", titulo: "Pedacinhos do Céu", autor: "Waldir Azevedo", estilo: "choro", nivel: 2, livroBb: ["choro2", "pág. 46"] },
    { id: "doce-de-coco", titulo: "Doce de Coco", autor: "Jacob do Bandolim", estilo: "choro", nivel: 2, livroBb: ["choro1", "pág. 24"] },
    { id: "brasileirinho", titulo: "Brasileirinho", autor: "Waldir Azevedo", estilo: "choro", nivel: 3, livroBb: ["choro1", "pág. 14"] },
    { id: "tico-tico", titulo: "Tico-Tico no Fubá", autor: "Zequinha de Abreu", estilo: "choro", nivel: 3, livroBb: ["choro2", "pág. 63"] },
    { id: "noites-cariocas", titulo: "Noites Cariocas", autor: "Jacob do Bandolim", estilo: "choro", nivel: 3, livroBb: ["choro1", "pág. 44"] },
    // MPB, forró e samba
    { id: "asa-branca", titulo: "Asa Branca", autor: "Luiz Gonzaga e Humberto Teixeira", estilo: "mpb", nivel: 1, tenor: "1BRZy-1aQRPDuBeeVHN7pejZipkVC-Lf2", playback: "1SKD20bakymx1--pF7YYfkaK6vInuP92W" },
    { id: "qui-nem-jilo", titulo: "Qui Nem Jiló", autor: "Luiz Gonzaga e Humberto Teixeira", estilo: "mpb", nivel: 1, alto: "1sxowaqmmIM3_EgrnFLhW_G3ob-PQ1dtg", tenor: "1qSrUOn8heDKzI3J7q2PtqPSYeSxf888B", playback: "1Y3606ur7vbgoXkbbjmrAZwkRLmLPOZTm" },
    { id: "xote-milagres", titulo: "Xote dos Milagres", autor: "Falamansa", estilo: "mpb", nivel: 1, alto: "1yAT_97QZQYd9BYLtshtA0hXHUXZcDZBv", tenor: "1lUTrnEj2UKRuWJo-cy-QITTeuCX_-O_x" },
    { id: "leaozinho", titulo: "O Leãozinho", autor: "Caetano Veloso", estilo: "mpb", nivel: 1, alto: "1pstPzyDh2c9tkplxkdu8rWU7e0xNakH-", playback: "1eoYElEDZm7U94_GRU3LhH_1wgwWneBXS" },
    { id: "encontros", titulo: "Encontros e Despedidas", autor: "Milton Nascimento e Fernando Brant", estilo: "mpb", nivel: 1, alto: "1P7C02cLLdMd5dKe4qOM8yB13okBMk23G", tenor: "1qi2mZ_fQfh6aNKXRWhdHLbaArB7bHNXi" },
    { id: "cacador", titulo: "Caçador de Mim", autor: "Sérgio Magrão e Luiz Carlos Sá", estilo: "mpb", nivel: 1, alto: "1XdcHqLbxBDDH1JTN3JEhKyaq816Rkb5m", tenor: "1ufPLJwWtmsPdg7IcYSfmlbiXkyj0EIda", playback: "1AJO1HwIsspgw-0DRZMJAe1NOICExhcyV" },
    { id: "travessia", titulo: "Travessia", autor: "Milton Nascimento e Fernando Brant", estilo: "mpb", nivel: 2, alto: "1MQeOq9h_SiZB4-iIfoz__Jje5KGyVouQ", tenor: "1HaUaN0qupHz2PZJ05LJP38eE0fY0u2p8" },
    { id: "bebado", titulo: "O Bêbado e a Equilibrista", autor: "João Bosco e Aldir Blanc", estilo: "mpb", nivel: 2, alto: "1dMoTxuyxrtQtnwgt4njsm5vLJQbWSdeW", tenor: "1Mk7imLQ6cQjDDsPp8jQ60buhiQBy4Wsh" },
    { id: "odara", titulo: "Odara", autor: "Caetano Veloso", estilo: "mpb", nivel: 2, alto: "1uYS8-U4EKOsWdrAJZtt2sfrph3KV4Fcg", playback: "1jGgjkmmeA1hpomxycRfw1LwW3ra83WqS" },
    { id: "baixa-sapateiro", titulo: "Na Baixa do Sapateiro", autor: "Ary Barroso", estilo: "mpb", nivel: 2, alto: "1sNH3KR765iqOWppWNgJB-cdopmw0Kzzs" },
    // Baladas e pop
    { id: "ave-maria", titulo: "Ave Maria", autor: "Bach e Gounod", estilo: "pop", nivel: 1, alto: "1wrgqCGqj8hiHVFnHKWnpBQM7ST7nmqBn", tenor: "1jHn3z4EzYKvGlujrSFpp-DDW0SK2dcxM", playback: "1tgrjMhvgglUaW0E36cp9u_Sm2ZAcqDvO" },
    { id: "fascinacao", titulo: "Fascinação", autor: "Fermo Dante Marchetti", estilo: "pop", nivel: 1, alto: "1KbMez-PmKklg3v7bD-ay6X9KxTbx-WFQ", tenor: "10IBqm8sHBu8KPaaqXH1DOzJHcIAmgQpO", playback: "1y4q9dDMNPOdbj2zDNDmlZcFfV2D1TonR" },
    { id: "besame", titulo: "Bésame Mucho", autor: "Consuelo Velázquez", estilo: "pop", nivel: 1, alto: "1kx8rxwDTGb_6Dg84x-hreKImsG7Uq6Xh", playback: "1pIawpvE--IEHJPGqU4DMgsjuAhoU37UH" },
    { id: "yesterday", titulo: "Yesterday", autor: "Lennon e McCartney", estilo: "pop", nivel: 1, alto: "1nC21eyXme84AqaZqYNdpQQGnv9gXWQyT", playback: "1gqGDYcjnFhOaBn8CugWN0NSs-HsPvCRt" },
    { id: "stand-by-me", titulo: "Stand by Me", autor: "Ben E. King", estilo: "pop", nivel: 1, alto: "1pXRVeX4-hIofX4iwzh7Kw4WBacsJNxWh", tenor: "1wU7Pta5zLgSlLJoN33UZhCuu19l9-Q9y" },
    { id: "my-heart", titulo: "My Heart Will Go On", autor: "James Horner", estilo: "pop", nivel: 1, alto: "18-ST3Ys-GfW6D7Nvg8l3SPAeO5trxQTP", tenor: "1EgJ71hAfavSXI9BCeR09otoV8OOgpssS", playback: "1pnPLnONQeE7lBl5mSEP-hYfI9iFn7zsh" },
    { id: "my-way", titulo: "My Way", autor: "Claude François e Paul Anka", estilo: "pop", nivel: 1, alto: "1YKNx_WAZodYcedNSExxwMMrLuzRfRiSk", playback: "1sDRZkIopcbhQsxq69k0wtSdlNs8h-4LI" },
    { id: "your-song", titulo: "Your Song", autor: "Elton John", estilo: "pop", nivel: 1, tenor: "1oGr-KOt8n-W_C0ZXWAuKI35zX1MCNfde", playback: "1KwMZissGCCJbsWQ5DCPr66FM5X0EFAf7" },
    { id: "careless", titulo: "Careless Whisper", autor: "George Michael", estilo: "pop", nivel: 2, alto: "1V_zaC3cCdC0WBiVTOEo3Yl4t_8OpTyQ_", tenor: "1VuUoSytWNWZHvEQFR1cBvVKLtspiN3YV", playback: "1HiE440qZzDtaLu8OCuR4hhpxWVSWuZHg" },
    { id: "songbird", titulo: "Songbird", autor: "Kenny G", estilo: "pop", nivel: 2, alto: "1eOjGcTZ2Qtw5sPpMb32X3f9-Wtb_D9tZ", tenor: "1EU0XyVrWRpH1wcTJEt7ihZCQn_y1oMzU", playback: "1sctIBXx3Pgt85vHyivb5dmkNrD3ixMRO" },
    { id: "forever", titulo: "Forever in Love", autor: "Kenny G", estilo: "pop", nivel: 2, tenor: "1YOXO6HS71pBXNGunn3UsLsadFj8JUTbw" },
    { id: "just-the-way", titulo: "Just the Way You Are", autor: "Billy Joel", estilo: "pop", nivel: 2, alto: "1V0KNDYa4kuAXwRlB6_Ql3eyTdNPNh0ze" },
    { id: "smooth", titulo: "Smooth Operator", autor: "Sade", estilo: "pop", nivel: 2, alto: "1wtDiex3Wn8vdj_EzYUKwPrHedc6e_1Pc" },
  ],
};
