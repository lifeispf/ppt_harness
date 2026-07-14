// scripts/icons.js — design_asset 파이프라인.
// react-icons(SVG) → 흰색 스트로크로 치환 → sharp로 512px PNG 래스터 → assets/icons/*.png
// 규칙: 아이콘 SVG에는 텍스트가 없어야 한다. (텍스트는 항상 PPT 네이티브)

const fs = require("fs");
const path = require("path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const Fi = require("react-icons/fi");

// deck.json에서 쓰는 아이콘 키 → Feather 아이콘 매핑
const ICONS = {
  cart: "FiShoppingCart",
  trend: "FiTrendingUp",
  users: "FiUsers",
  repeat: "FiRepeat",
  target: "FiTarget",
  globe: "FiGlobe",
  zap: "FiZap",
  check: "FiCheckCircle",
};

const OUT = path.join(__dirname, "..", "assets", "icons");
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  for (const [key, name] of Object.entries(ICONS)) {
    if (!Fi[name]) throw new Error(`unknown react-icon: ${name}`);
    let svg = renderToStaticMarkup(React.createElement(Fi[name], { size: 512, strokeWidth: 1.8 }));
    svg = svg.replace(/currentColor/g, "#FFFFFF");
    if (!svg.includes("xmlns=")) svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, `${key}.png`));
    console.log("icon:", key);
  }
})();
