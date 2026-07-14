// tokens.js — design.md를 코드로 컴파일한 단일 소스. (v2.1: 타이포 대비·서페이스 체계)
// 모든 색·크기·좌표는 여기서만 파생된다. 컴포넌트에 하드코딩 금지.
// design.md와 항상 함께 수정할 것.

const page = { w: 13.333, h: 7.5 };
const margin = 0.6;
const gutter = 0.2;
const cols = 12;
const colW1 = (page.w - margin * 2 - gutter * (cols - 1)) / cols;

/** i번째 컬럼(0-base)의 x 좌표 */
function colX(i) {
  return margin + i * (colW1 + gutter);
}

/** span개 컬럼에 걸친 폭 */
function colW(span) {
  return span * colW1 + (span - 1) * gutter;
}

module.exports = {
  page,
  margin,
  gutter,
  cols,
  colX,
  colW,

  // 세로 리듬 존
  zone: {
    kickerY: 0.58,
    titleY: 0.86,
    contentY: 1.95,
    contentBottom: 6.85,
    footerY: 7.02,
  },

  // 팔레트 출처: HRD v7 프로토타입 토큰(--c-*) × 현대차 CI(Hyundai Blue 002C5F) — design.md §2
  color: {
    primary: "002C5F", // Hyundai Blue = HRD --c-navy
    primaryMid: "123E6B", // 다크 배경 위 장식/고스트
    royal: "0070AB", // HRD --c-royal: 2시리즈, KI 바, ▲증가, 콜아웃
    sky: "00A1C7", // HRD --c-sky: 액티브 포인트(슬라이드당 ≤1)
    steel: "AEBFD4", // HRD --tier3: 차트 비강조 포인트, 보조 시리즈
    ice: "B8CFE8", // 다크 배경 위 보조 텍스트
    ink: "002C5F", // 라이트 배경 헤딩 = 브랜드 네이비
    body: "1F2D3D", // HRD --text
    muted: "5C7A8E", // HRD --c-muted
    line: "DFE4EA", // HRD --gray-200: 헤어라인 보더
    bg: "FFFFFF",
    bgSoft: "F0F4F8", // HRD --c-bg: ★페이지 배경 (카드가 아니라 슬라이드 바탕)
    surface: "E8EFF5", // HRD --c-surface: 틴트 강조 셀
    white: "FFFFFF", // 카드 배경
    pos: "0070AB", // ▲ 증가 = royal (HRD 실산출물 관례)
    neg: "C4531F", // ▼ 감소/GAP = HRD --c-gap
    gapBg: "FBEDE4", // GAP 배경 강조
  },

  font: {
    // 기본 Malgun Gothic. 열람자 전원 Hyundai Sans KR 설치 확인 시 교체 (design.md §3)
    face: "Malgun Gothic",
    faceLight: "Malgun Gothic Semilight", // 히어로 숫자 전용 — 얇고 크게
    display: 52, // 표지 타이틀
    title: 36, // 슬라이드 타이틀 (어서션형 ≤22자)
    section: 20, // 카드/섹션 헤더
    itemHead: 15, // 리스트 아이템 헤드
    body: 13, // 본문
    stat: 40, // (범용) 스탯
    statHero: 64, // 히어로 지표 — faceLight로
    statSub: 20, // 서브 지표 행
    caption: 10, // 캡션/출처
    kicker: 11, // 윗머리 라벨
    pageNum: 9,
    kickerSpacing: 2.5, // 킥커 자간(pt)
    titleSpacing: -0.25, // 타이틀 자간(pt) — 큰 글자는 살짝 조이기
  },

  radius: 0.1, // 카드 라운드 (HRD --radius 10px)
  kiBar: 0.055, // Key Implication 좌측 바 폭
  hairline: 0.75, // 카드 보더 두께(pt)
  chip: { icon: 0.5, num: 0.42 }, // 서클 칩 지름
};
