// scripts/assets-bg.js — 다크 슬라이드용 그라데이션 배경 생성 (SVG → PNG).
// pptxgenjs는 그라데이션 필 미지원 → 이미지 배경으로 우회 (design.md §5).
// 규칙: 배경 SVG에 텍스트 금지.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "assets", "bg");
fs.mkdirSync(OUT, { recursive: true });

// 좌상(밝은 네이비) → 중앙(Hyundai Blue) → 우하(딥 네이비) 대각 그라데이션
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#0E4A86"/>
<stop offset="52%" stop-color="#002C5F"/>
<stop offset="100%" stop-color="#001736"/>
</linearGradient></defs>
<rect width="1920" height="1080" fill="url(#g)"/></svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(OUT, "dark-gradient.png"))
  .then(() => console.log("bg: dark-gradient.png"));
