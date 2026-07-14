#!/usr/bin/env node
// scripts/build.js — content/deck.json → dist/deck.pptx
// 사용법: node scripts/build.js [spec.json] [out.pptx]

const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const T = require("../tokens");
const C = require("../components");

const specPath = process.argv[2] || path.join(__dirname, "..", "content", "deck.json");
const outPath = process.argv[3] || path.join(__dirname, "..", "dist", "deck.pptx");

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

const pres = new pptxgen();
pres.defineLayout({ name: "WIDE", width: T.page.w, height: T.page.h });
pres.layout = "WIDE";
pres.author = spec.meta.author || "";
pres.company = spec.meta.company || "";
pres.title = spec.meta.title || "";
pres.theme = { headFontFace: T.font.face, bodyFontFace: T.font.face };

spec.slides.forEach((s, i) => {
  const fn = C[s.type];
  if (!fn) throw new Error(`unknown slide type: "${s.type}" — components/index.js에 구현 후 export 필요`);
  fn(pres, s, spec.meta, String(i + 1).padStart(2, "0"));
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
pres.writeFile({ fileName: outPath }).then(() => console.log("built:", outPath));
