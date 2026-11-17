// Gera pdf/naipe-guia-solos.pdf a partir de guia.html (Playwright + Chromium).
// Uso: node ferramentas/guia-solos/gerar-pdf.js
const path = require("path");
const { chromium } = require("playwright");
(async () => {
  const raiz = path.resolve(__dirname, "..", "..");
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto("file://" + path.join(__dirname, "guia.html"));
  await p.pdf({
    path: path.join(raiz, "pdf", "naipe-guia-solos.pdf"), format: "A4", printBackground: true,
    displayHeaderFooter: true, headerTemplate: "<span></span>",
    footerTemplate: '<div style="font-size:7pt;color:#5d6f67;width:100%;text-align:center;font-family:Arial">Tiago Veloso · Naipe · naipesax.com.br · <span class="pageNumber"></span></div>',
    margin: { top: "16mm", bottom: "18mm", left: "15mm", right: "15mm" },
  });
  await b.close();
  console.log("ok naipe-guia-solos.pdf");
})();
