PPT 하네스 아키텍처 (2026-07-14 결정 · 디자인 v2 → v2.1 반영)

배경과 결정

이전 시도(HTML → 개별 객체 SVG → PPT)는 SVG 안에 텍스트를 넣는 구조 때문에 텍스트 정렬이 틀어졌다.
원인: 레이아웃을 계산한 엔진(브라우저)과 최종 렌더링 엔진(PowerPoint의 SVG 렌더러)의 폰트 메트릭·베이스라인 해석이 다르고, foreignObject는 PowerPoint 미지원 — SVG에 텍스트가 있는 한 구조적으로 재발.

채택: A. 네이티브 코드 생성 (pptxgenjs + 디자인 토큰 + 그리드 파생 좌표)


텍스트가 처음부터 끝까지 PPT 네이티브 → 정렬 문제 원천 차단, 완전 편집 가능
검토된 대안: B. HTML 하이브리드(컨버터 필요, 줄바꿈 재계산 리스크), C. potx 템플릿(유연성 낮음), D. SVG 아웃라인화(편집 불가 → 에셋 전용)


하네스 구조 (ppt-harness/)


design.md — 디자인 시스템 v2.1 · tokens.js — 단일 소스(그리드 colX/colW 포함)
wireframes/patterns.md — 패턴 7종: cover, agenda, kpis(히어로형), chartStory, sectionDivider, roadmap, closing
components/index.js — 패턴 구현 (keyImplication·chipNum/Icon·card 헬퍼)
assets/ — icons(react-icons→sharp PNG) + bg(그라데이션, scripts/assets-bg.js 생성)
content/deck.json — 콘텐츠/디자인 분리 · scripts/ — build.js, icons.js, assets-bg.js, chart_highlight.py(OOXML dPt 후처리)
SKILL.md — 실행 절차 (.claude/skills/ 배치 시 커스텀 스킬)


디자인 시스템 v2.1 — HMG HRD × Hyundai CI + 프로 디자인 규칙

팔레트 출처: HRD v7 프로토타입이 이미 현대차 CI로 수렴(--c-navy = Hyundai Blue 002C5F) → 그 토큰 채택.
primary 002C5F · royal 0070AB · sky 00A1C7 · steel AEBFD4 · muted 5C7A8E · 페이지 F0F4F8 · GAP C4531F. 증감 ▲royal/▼번트오렌지(신호등 금지). KI 밴드(royal 좌측 바) = 하우스 시그니처 예외.

v2.1 프로 디자인 규칙 (디자인 크리틱 8항목 중 1+2라운드 반영):


어서션 타이틀: 제목=주장(≤22자), 분류는 킥커로 ("분기별 매출 추이" → "8분기 연속 성장, 분기 매출 사상 최대")
히어로 위계: kpis = 히어로 1(64pt Malgun Semilight) + 서브 3 로우(값·증감 컬럼 정렬). 균등 N분할 금지
차트 하이라이트: 강조 포인트만 primary, 나머지 steel — pptxgenjs 미지원이라 빌드 후 chart_highlight.py가 차트 XML에 c:dPt 주입. 카드 우상단 royal 콜아웃
타이포 대비: display 52, statHero 64 Light, 타이틀 자간 -0.25/킥커 +2.5, 단위는 크기·색 2단계 강등
서페이스 반전: bgSoft 페이지 + 화이트 카드 + 헤어라인(0.75pt) + 미세 그림자(10%/blur7) — 실산출물 PDF 문법. 다크는 그라데이션 PNG 배경(pptxgenjs 그라데이션 미지원 우회)
내러티브: sectionDivider 패턴(고스트 넘버 170pt), 푸터 섹션명 · 페이지
접근성: sky 칩 글자는 navy(4.5:1). 미적용 잔여(3라운드 후보): 사진 표지·커스텀 아이콘·광학 보정 QA


폰트 전략: 기본 Malgun Gothic(+Semilight) → 열람자 전원 설치 확인 시 Hyundai Sans KR 교체. QA는 Noto 대체 렌더 → 텍스트 박스 ~10% 여유.

QA 루프

build → chart_highlight.py → validate.py(OOXML) → LibreOffice PDF → pdftoppm → 비전 검사(오버플로·겹침·정렬·대비·금지요소) → 수정 → 재렌더. 서브에이전트 신선한 눈 + PIL 픽셀 실측으로 판정 보강.

검증 결과

v1 → v2(토큰 스왑만으로 리스킨) → v2.1(프로 디자인 2라운드): 7장 덱, validate PASS, 비전 QA 통과. 차트 dPt 후처리·그라데이션 배경·히어로 KPI 모두 PowerPoint 네이티브 유지(편집 가능). 산출물: 샘플덱_현대차스타일_v2.1_프로급.pptx, ppt-harness.zip.

다음 확장 후보 (3라운드 + 패턴)

사진 기반 표지(네이비 듀오톤) · 커스텀 아이콘 세트 · 광학 정렬/대비 실측 QA 자동화 · 표 패턴(네이비 헤더+Tier 필 배지) · 도넛/커버리지 바 · deck.json 스키마 검증기 · 실무 콘텐츠 첫 실전 덱