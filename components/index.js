// components/index.js — wireframes/patterns.md의 레이아웃 패턴 구현. (v2.1)
// 규칙:
//  1) 색·크기·좌표는 tokens.js에서만 가져온다 (하드코딩 금지)
//  2) 텍스트는 전부 PPT 네이티브 텍스트박스 (SVG/이미지 텍스트 금지)
//  3) x·폭은 colX/colW 그리드에서 파생 → 정렬은 계산으로 보장
//  4) 옵션 객체는 호출마다 새로 생성 (pptxgenjs가 in-place 변형하므로 공유 금지)
//  5) 서페이스: 페이지 bgSoft + 화이트 카드(헤어라인+미세 그림자), 다크는 그라데이션

const fs = require("fs");
const path = require("path");
const T = require("../tokens");

const iconPath = (k) => path.join(__dirname, "..", "assets", "icons", `${k}.png`);
const DARK_BG = path.join(__dirname, "..", "assets", "bg", "dark-gradient.png");

/* ---------------- 공통 헬퍼 ---------------- */

function txt(slide, str, o) {
  slide.addText(str, Object.assign({ fontFace: T.font.face, margin: 0, valign: "top" }, o));
}

/** 미세 그림자 — 매 호출 새 객체 (pptxgenjs가 in-place 변형) */
function shadow() {
  return { type: "outer", color: T.color.body, opacity: 0.1, blur: 7, offset: 1, angle: 90 };
}

function lightSlide(pres) {
  const slide = pres.addSlide();
  slide.background = { color: T.color.bgSoft };
  return slide;
}

function darkSlide(pres) {
  const slide = pres.addSlide();
  slide.background = fs.existsSync(DARK_BG) ? { path: DARK_BG } : { color: T.color.primary };
  return slide;
}

function footer(slide, meta, pageNum, section) {
  txt(slide, meta.company, {
    x: T.colX(0), y: T.zone.footerY, w: 3.5, h: 0.25,
    fontSize: 8.5, color: T.color.muted, charSpacing: 2,
  });
  const right = section ? `${section}  ·  ${pageNum}` : pageNum;
  txt(slide, right, {
    x: T.page.w - T.margin - 2.8, y: T.zone.footerY, w: 2.8, h: 0.25,
    fontSize: T.font.pageNum, color: T.color.muted, align: "right",
  });
}

/** 라이트 슬라이드 공통 크롬: 킥커(분류) + 타이틀(어서션) + 푸터 */
function chrome(slide, s, meta, pageNum) {
  txt(slide, s.kicker, {
    x: T.colX(0), y: T.zone.kickerY, w: T.colW(12), h: 0.28,
    fontSize: T.font.kicker, bold: true, color: T.color.muted, charSpacing: T.font.kickerSpacing,
  });
  txt(slide, s.title, {
    x: T.colX(0), y: T.zone.titleY, w: T.colW(12), h: 0.85,
    fontSize: T.font.title, bold: true, color: T.color.ink, charSpacing: T.font.titleSpacing,
  });
  footer(slide, meta, pageNum, s.section);
}

/** 화이트 카드 (헤어라인 + 미세 그림자) — 모티프 */
function card(pres, slide, x, y, w, h, o = {}) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: o.fill || T.color.white },
    line: { color: T.color.line, width: T.hairline },
    rectRadius: T.radius,
    shadow: shadow(),
  });
}

/** 번호 서클 칩 — 모티프 */
function chipNum(pres, slide, n, x, y, o = {}) {
  const d = T.chip.num;
  slide.addText(String(n), {
    shape: pres.ShapeType.ellipse,
    x, y, w: d, h: d,
    fill: { color: o.fill || T.color.primary },
    align: "center", valign: "middle",
    fontFace: T.font.face, fontSize: 13, bold: true,
    color: o.color || T.color.white, margin: 0,
  });
}

/** 아이콘 서클 칩 — 모티프. o.d로 지름 조절 */
function chipIcon(pres, slide, icon, x, y, o = {}) {
  const d = o.d || T.chip.icon;
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: o.fill || T.color.primary } });
  const s = d * 0.52;
  slide.addImage({ path: iconPath(icon), x: x + (d - s) / 2, y: y + (d - s) / 2, w: s, h: s });
}

/** 불릿 리스트 (마지막 항목 제외 breakLine, paraSpaceAfter로 간격) */
function bullets(slide, arr, o) {
  const items = arr.map((t, i) => ({
    text: t,
    options: {
      bullet: { indent: 12 },
      breakLine: i !== arr.length - 1,
      paraSpaceAfter: o.paraSpaceAfter != null ? o.paraSpaceAfter : 6,
      color: o.color, fontSize: o.fontSize,
    },
  }));
  slide.addText(items, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fontFace: T.font.face, margin: 0, valign: "top", lineSpacingMultiple: 1.2,
  });
}

/** Key Implication 밴드 (HRD 시그니처): 화이트 카드 + royal 좌측 바 + 라벨 + 불릿 */
function keyImplication(pres, slide, x, y, w, h, data) {
  card(pres, slide, x, y, w, h);
  slide.addShape(pres.ShapeType.rect, { x, y: y + 0.14, w: T.kiBar, h: h - 0.28, fill: { color: T.color.royal } });
  txt(slide, data.head || "KEY IMPLICATION", {
    x: x + 0.3, y: y + 0.24, w: w - 0.6, h: 0.28,
    fontSize: 10.5, bold: true, color: T.color.royal, charSpacing: 2,
  });
  bullets(slide, data.bullets, { x: x + 0.3, y: y + 0.62, w: w - 0.6, h: h - 0.87, fontSize: 12.5, color: T.color.body });
}

/* ---------------- 패턴: cover (다크 표지, 그라데이션) ---------------- */

function cover(pres, s, meta) {
  const slide = darkSlide(pres);

  slide.addShape(pres.ShapeType.ellipse, { x: 9.3, y: -3.3, w: 6.8, h: 6.8, fill: { color: T.color.royal, transparency: 72 } });
  slide.addShape(pres.ShapeType.ellipse, { x: 11.4, y: 4.7, w: 4.6, h: 4.6, fill: { color: T.color.sky, transparency: 85 } });
  slide.addShape(pres.ShapeType.ellipse, { x: -1.8, y: 5.4, w: 3.6, h: 3.6, fill: { color: T.color.primaryMid, transparency: 45 } });

  txt(slide, s.kicker, { x: T.colX(0), y: 1.98, w: T.colW(12), h: 0.35, fontSize: 13, bold: true, color: T.color.ice, charSpacing: 3 });
  txt(slide, s.title, {
    x: T.colX(0), y: 2.42, w: T.colW(11), h: 1.9,
    fontSize: T.font.display, bold: true, color: T.color.white,
    lineSpacingMultiple: 1.08, charSpacing: -0.5,
  });
  txt(slide, s.subtitle, { x: T.colX(0), y: 4.62, w: T.colW(10), h: 0.4, fontSize: 14, color: T.color.ice });

  txt(slide, meta.company, { x: T.colX(0), y: 6.85, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: T.color.white, charSpacing: 2 });
  txt(slide, s.footnote, { x: T.page.w - T.margin - 4, y: 6.85, w: 4, h: 0.3, fontSize: 11, color: T.color.ice, align: "right" });
}

/* ---------------- 패턴: agenda (좌 타이틀 + 우 리스트) ---------------- */

function agenda(pres, s, meta, pageNum) {
  const slide = lightSlide(pres);

  txt(slide, s.kicker, { x: T.colX(0), y: 2.0, w: T.colW(4), h: 0.28, fontSize: T.font.kicker, bold: true, color: T.color.muted, charSpacing: T.font.kickerSpacing });
  txt(slide, s.title, { x: T.colX(0), y: 2.32, w: T.colW(4) + 0.5, h: 0.7, fontSize: 34, bold: true, color: T.color.ink, charSpacing: T.font.titleSpacing });
  txt(slide, s.desc, { x: T.colX(0), y: 3.18, w: T.colW(4), h: 0.9, fontSize: T.font.body, color: T.color.body, lineSpacingMultiple: 1.3 });

  s.items.forEach((it, i) => {
    const y0 = 1.98 + i * 1.28;
    chipNum(pres, slide, i + 1, T.colX(5), y0);
    txt(slide, it.head, { x: T.colX(5) + 0.62, y: y0 - 0.04, w: T.colW(7) - 0.62, h: 0.35, fontSize: 15.5, bold: true, color: T.color.ink });
    txt(slide, it.desc, { x: T.colX(5) + 0.62, y: y0 + 0.34, w: T.colW(7) - 0.62, h: 0.35, fontSize: 12.5, color: T.color.body });
  });

  footer(slide, meta, pageNum, s.section);
}

/* ---------------- 패턴: kpis (히어로 1 + 서브 3 + KI 밴드) ---------------- */

function kpis(pres, s, meta, pageNum) {
  const slide = lightSlide(pres);
  chrome(slide, s, meta, pageNum);

  const y = 2.0, h = 2.6;

  // 히어로 카드 (5col) — 슬라이드의 주인공 하나
  const hx = T.colX(0), hw = T.colW(5);
  card(pres, slide, hx, y, hw, h);
  chipIcon(pres, slide, s.hero.icon, hx + hw - 0.78, y + 0.26);
  txt(slide, s.hero.label, { x: hx + 0.3, y: y + 0.32, w: hw - 1.1, h: 0.3, fontSize: 12.5, bold: true, color: T.color.muted });
  slide.addText([
    { text: s.hero.value, options: { fontSize: T.font.statHero, color: T.color.primary, fontFace: T.font.faceLight } },
    { text: s.hero.unit, options: { fontSize: 16, color: T.color.muted } },
  ], { x: hx + 0.3, y: y + 0.6, w: hw - 0.6, h: 1.2, fontFace: T.font.face, margin: 0, valign: "middle" });
  slide.addText([
    { text: s.hero.delta, options: { fontSize: 13, bold: true, color: s.hero.deltaDir === "neg" ? T.color.neg : T.color.pos } },
    { text: "  " + (s.hero.note || ""), options: { fontSize: 10.5, color: T.color.muted } },
  ], { x: hx + 0.3, y: y + 1.88, w: hw - 0.6, h: 0.3, fontFace: T.font.face, margin: 0 });
  if (s.hero.desc) {
    txt(slide, s.hero.desc, { x: hx + 0.3, y: y + 2.2, w: hw - 0.6, h: 0.3, fontSize: 11.5, color: T.color.muted });
  }

  // 서브 지표 카드 (7col) — 3행 스탯 로우
  const sx = T.colX(5), sw = T.colW(7);
  card(pres, slide, sx, y, sw, h);
  const rowH = h / 3;
  s.subs.forEach((c, i) => {
    const top = y + i * rowH;
    const cy = top + rowH / 2;
    chipIcon(pres, slide, c.icon, sx + 0.3, cy - 0.18, { d: 0.36 });
    txt(slide, c.label, { x: sx + 0.82, y: cy - 0.12, w: 2.6, h: 0.3, fontSize: 12.5, color: T.color.body });
    // 값 컬럼과 증감 컬럼을 분리해 각각 우측 정렬 — 세로로 열이 맞는다
    slide.addText([
      { text: c.value, options: { fontSize: T.font.statSub, bold: true, color: T.color.primary } },
      { text: " " + c.unit, options: { fontSize: 11, color: T.color.muted } },
    ], { x: sx + sw - 3.87, y: cy - 0.19, w: 2.45, h: 0.38, fontFace: T.font.face, margin: 0, align: "right", valign: "middle" });
    txt(slide, c.delta, {
      x: sx + sw - 1.42, y: cy - 0.19, w: 1.12, h: 0.38,
      fontSize: 11, bold: true, color: c.deltaDir === "neg" ? T.color.neg : T.color.pos,
      align: "right", valign: "middle",
    });
    if (i < s.subs.length - 1) {
      slide.addShape(pres.ShapeType.line, {
        x: sx + 0.3, y: top + rowH, w: sw - 0.6, h: 0,
        line: { color: T.color.line, width: T.hairline },
      });
    }
  });
  txt(slide, "증감은 전년 동기(YoY) 대비", { x: sx, y: y + h + 0.08, w: sw - 0.02, h: 0.22, fontSize: 9, color: T.color.muted, align: "right" });

  keyImplication(pres, slide, T.colX(0), 4.95, T.colW(12), 1.8, s.summary);
}

/* ---------------- 패턴: chartStory (차트 7 + 시사점 5) ---------------- */

function chartStory(pres, s, meta, pageNum) {
  const slide = lightSlide(pres);
  chrome(slide, s, meta, pageNum);

  const y = 2.0, h = 4.55;
  const cx = T.colX(0), cw = T.colW(7);
  card(pres, slide, cx, y, cw, h);
  txt(slide, s.chart.label, { x: cx + 0.28, y: y + 0.24, w: cw - 3.3, h: 0.28, fontSize: 11, bold: true, color: T.color.muted });
  if (s.chart.callout) {
    txt(slide, s.chart.callout, { x: cx + cw - 3.05, y: y + 0.24, w: 2.77, h: 0.28, fontSize: 11, bold: true, color: T.color.royal, align: "right" });
  }

  slide.addChart(pres.ChartType.bar, [
    { name: s.chart.name || "value", labels: s.chart.labels, values: s.chart.values },
  ], {
    x: cx + 0.25, y: y + 0.66, w: cw - 0.5, h: h - 1.0,
    barDir: "col",
    barGapWidthPct: 40,
    chartColors: [T.color.primary], // 하이라이트 외 포인트는 chart_highlight.py가 steel로 후처리
    showLegend: false,
    showTitle: false,
    showValue: true,
    dataLabelPosition: "outEnd",
    dataLabelColor: T.color.body,
    dataLabelFontSize: 9,
    dataLabelFormatCode: "#,##0",
    dataLabelFontFace: T.font.face,
    catAxisLabelColor: T.color.muted,
    catAxisLabelFontSize: 9.5,
    catAxisLabelFontFace: T.font.face,
    catAxisLineColor: T.color.line,
    catGridLine: { style: "none" },
    valAxisHidden: true,
    valGridLine: { style: "none" },
  });

  s.takeaways.forEach((t, i) => {
    const y0 = 2.18 + i * 1.5;
    chipNum(pres, slide, i + 1, T.colX(7), y0);
    txt(slide, t.head, { x: T.colX(7) + 0.62, y: y0 - 0.03, w: T.colW(5) - 0.62, h: 0.32, fontSize: T.font.itemHead, bold: true, color: T.color.ink });
    txt(slide, t.desc, { x: T.colX(7) + 0.62, y: y0 + 0.34, w: T.colW(5) - 0.62, h: 0.78, fontSize: 12.5, color: T.color.body, lineSpacingMultiple: 1.2 });
  });

  if (s.source) {
    txt(slide, s.source, { x: cx, y: 6.7, w: T.colW(7) + 2, h: 0.25, fontSize: 9.5, color: T.color.muted });
  }
}

/* ---------------- 패턴: sectionDivider (다크, 파트 전환) ---------------- */

function sectionDivider(pres, s) {
  const slide = darkSlide(pres);

  // 고스트 넘버 — 다크 그라데이션 위 톤온톤
  txt(slide, s.number, {
    x: T.colX(6), y: 4.1, w: T.colW(6), h: 2.9,
    fontSize: 170, bold: true, color: T.color.primaryMid, align: "right",
  });

  txt(slide, s.kicker, { x: T.colX(0), y: 2.3, w: T.colW(8), h: 0.3, fontSize: T.font.kicker, bold: true, color: T.color.ice, charSpacing: 3 });
  txt(slide, s.title, { x: T.colX(0), y: 2.64, w: T.colW(8), h: 0.85, fontSize: 40, bold: true, color: T.color.white, charSpacing: T.font.titleSpacing });
  txt(slide, s.desc, { x: T.colX(0), y: 3.68, w: T.colW(7), h: 0.6, fontSize: 13.5, color: T.color.ice, lineSpacingMultiple: 1.3 });
}

/* ---------------- 패턴: roadmap (타임라인 + 페이즈 카드 3) ---------------- */

function roadmap(pres, s, meta, pageNum) {
  const slide = lightSlide(pres);
  chrome(slide, s, meta, pageNum);

  const cardW = T.colW(4);
  const centers = s.phases.map((_, i) => T.colX(i * 4) + cardW / 2);

  slide.addShape(pres.ShapeType.line, {
    x: centers[0], y: 2.62, w: centers[centers.length - 1] - centers[0], h: 0,
    line: { color: T.color.line, width: 2 },
  });
  s.phases.forEach((p, i) => {
    txt(slide, p.period, { x: centers[i] - 0.8, y: 2.14, w: 1.6, h: 0.3, fontSize: 12.5, bold: true, color: T.color.primary, align: "center" });
    slide.addShape(pres.ShapeType.ellipse, { x: centers[i] - 0.14, y: 2.48, w: 0.28, h: 0.28, fill: { color: T.color.primary } });
    slide.addShape(pres.ShapeType.ellipse, { x: centers[i] - 0.05, y: 2.57, w: 0.1, h: 0.1, fill: { color: T.color.white } });
  });

  const y = 3.2, h = 2.7;
  s.phases.forEach((p, i) => {
    const x = T.colX(i * 4);
    card(pres, slide, x, y, cardW, h);
    chipIcon(pres, slide, p.icon, x + 0.28, y + 0.3);
    txt(slide, p.phase, { x: x + 0.94, y: y + 0.32, w: cardW - 1.2, h: 0.24, fontSize: 10.5, bold: true, color: T.color.muted, charSpacing: 1.5 });
    txt(slide, p.name, { x: x + 0.94, y: y + 0.56, w: cardW - 1.2, h: 0.36, fontSize: 16, bold: true, color: T.color.ink });
    bullets(slide, p.items, { x: x + 0.3, y: y + 1.18, w: cardW - 0.6, h: h - 1.48, fontSize: 12.5, color: T.color.body, paraSpaceAfter: 8 });
  });
}

/* ---------------- 패턴: closing (다크, 요청 카드 3) ---------------- */

function closing(pres, s, meta) {
  const slide = darkSlide(pres);
  slide.addShape(pres.ShapeType.ellipse, { x: 10.6, y: -2.8, w: 5.6, h: 5.6, fill: { color: T.color.royal, transparency: 75 } });
  slide.addShape(pres.ShapeType.ellipse, { x: -2.0, y: 5.2, w: 4.2, h: 4.2, fill: { color: T.color.primaryMid, transparency: 45 } });

  txt(slide, s.kicker, { x: T.colX(0), y: 1.02, w: T.colW(12), h: 0.3, fontSize: T.font.kicker, bold: true, color: T.color.ice, charSpacing: 3 });
  txt(slide, s.title, { x: T.colX(0), y: 1.34, w: T.colW(12), h: 0.75, fontSize: T.font.title, bold: true, color: T.color.white, charSpacing: T.font.titleSpacing });

  const y = 2.85, h = 2.6, w = T.colW(4);
  s.cards.forEach((c, i) => {
    const x = T.colX(i * 4);
    slide.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: T.color.white, transparency: 90 }, rectRadius: T.radius });
    chipNum(pres, slide, i + 1, x + 0.3, y + 0.34, { fill: T.color.sky, color: T.color.primary });
    txt(slide, c.head, { x: x + 0.3, y: y + 1.06, w: w - 0.6, h: 0.34, fontSize: 15.5, bold: true, color: T.color.white });
    txt(slide, c.desc, { x: x + 0.3, y: y + 1.5, w: w - 0.6, h: h - 1.78, fontSize: 12.5, color: T.color.ice, lineSpacingMultiple: 1.25 });
  });

  txt(slide, s.contact, { x: T.colX(0), y: 6.4, w: T.colW(12), h: 0.3, fontSize: 11, color: T.color.ice, align: "center" });
}

module.exports = { cover, agenda, kpis, chartStory, sectionDivider, roadmap, closing };
