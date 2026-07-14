---
name: ppt-harness
description: 전문가 수준 비즈니스 PPT 제작 하네스. design.md(디자인 시스템) + wireframes(레이아웃 패턴) + content/deck.json(콘텐츠 스펙)으로 네이티브 PPTX를 빌드하고, 렌더-비전검사 QA 루프로 품질을 수렴시킨다. 비즈니스 덱/보고서/제안서 PPT 요청 시 사용.
---

# PPT 하네스 실행 절차

핵심 원칙: **텍스트는 처음부터 끝까지 PowerPoint 네이티브 객체**(SVG/이미지 텍스트 금지),
그래픽은 래스터 에셋, 좌표는 12컬럼 그리드에서 계산으로 파생.

## 0. 최초 1회 설정

```bash
npm install                      # pptxgenjs, react-icons, sharp 등
pip install lxml defusedxml Pillow "markitdown[pptx]" --break-system-packages
node scripts/icons.js            # design_asset → assets/icons/*.png 래스터
node scripts/assets-bg.js        # 다크 슬라이드용 그라데이션 배경 PNG 생성
```

## 1. 콘텐츠 스펙 작성 — `content/deck.json`

- 슬라이드 = `type`(레이아웃 패턴) + 슬롯 콘텐츠. 패턴 목록과 슬롯 스키마는 `wireframes/patterns.md`.
- 덱 구성은 다크 표지 → 라이트 본문 → (파트마다 `sectionDivider`) → 다크 클로징. 같은 패턴 연속 사용 금지.
- **타이틀은 어서션(주장)형 ≤22자** — "분기별 매출 추이"(라벨) ✗ → "8분기 연속 성장, 분기 매출 사상 최대" ✓.
  분류명은 `kicker`로. 본문 슬라이드에는 `section`(푸터 표기용 섹션명)을 넣는다.
- **kpis는 히어로 1 + 서브 3 구조** — 주인공 지표 하나만 `hero`에, 나머지는 `subs`로.
- 텍스트 길이 가이드(넘침 방지): 아이템 헤드 ≤ 14자 · 아이템 설명 ≤ 45자 ·
  히어로 값 ≤ 5자 · 서브 값 ≤ 6자 · 카드 불릿 ≤ 18자.
- 새 아이콘이 필요하면 `scripts/icons.js`의 `ICONS`에 키를 추가하고 재실행.

## 2. 빌드 & 스키마 검증

```bash
node scripts/build.js                                    # → dist/deck.pptx
# 차트 하이라이트(강조 포인트 외 steel 처리) — deck.json의 highlightIndex와 일치시킬 것
python scripts/chart_highlight.py dist/deck.pptx <highlightIndex> <totalPoints> AEBFD4
python <pptx스킬>/scripts/office/validate.py dist/deck.pptx
```

`<pptx스킬>` = Anthropic pptx 스킬 경로 (예: `~/.claude/skills/pptx`). 실패 시 생성 코드를 고쳐 재빌드(수동 XML 수정 금지).

## 3. 렌더 & 비전 QA (필수 — 최소 1회 루프)

```bash
cd dist
python <pptx스킬>/scripts/office/soffice.py --headless --convert-to pdf deck.pptx
rm -f slide-*.jpg && pdftoppm -jpeg -r 150 deck.pdf slide
```

slide-N.jpg 를 **전부 눈으로 확인**하고 아래를 검사한다:

- [ ] 텍스트 넘침/잘림 (가장 흔한 결함 — 최우선 확인)
- [ ] 요소 겹침, 0.3" 미만 근접, 카드 내부 과다 여백
- [ ] 컬럼 정렬 불일치 (그리드 이탈), 슬라이드 가장자리 0.5" 침범
- [ ] 저대비 텍스트/아이콘, 금지 요소(액센트 스트라이프·타이틀 밑줄 등 design.md §7)
- [ ] 데모/플레이스홀더 텍스트 잔존: `markitdown dist/deck.pptx | grep -iE "lorem|TODO|\[insert"`

수정 → 재빌드 → 재렌더를 결함이 없을 때까지 반복. 결함 수정은:
콘텐츠 문제 = `deck.json`, 레이아웃 문제 = `components/`, 시스템 문제 = `tokens.js`+`design.md` 동시 수정.

## 4. 폰트 규칙 (한글)

- 기본 지정 폰트는 **Malgun Gothic** (Windows PowerPoint 기본 탑재).
- 브랜드 서체 전환: 열람자 전원 **Hyundai Sans KR** 설치 확인 시 `tokens.js`의 `font.face`만 교체 (design.md §3 폰트 전략).
- QA 렌더는 Noto Sans CJK KR로 **대체 렌더**되므로 글자 폭이 미세하게 다르다 →
  텍스트 박스는 예상 폭 대비 ~10% 여유. QA에서 "딱 맞는" 박스는 실환경에서 넘칠 수 있다.
- Pretendard 등 커스텀 폰트 요청 시: 열람 환경 설치 여부를 사용자에게 확인.

## 5. 새 레이아웃 패턴 추가

1. `wireframes/patterns.md`에 스펙(슬롯 + ASCII 스케치) 작성
2. `components/index.js`에 동명 함수 구현 후 export — 좌표는 `colX/colW`만 사용,
   색·크기는 `tokens.js`만 참조, 옵션 객체는 호출마다 새로 생성(pptxgenjs가 in-place 변형)
3. `deck.json`에서 사용 → 빌드 → QA 루프

## 금지 (요약)

SVG/이미지 안의 텍스트 · 하드코딩 좌표/색 · 액센트 스트라이프/색 바/타이틀 밑줄 ·
본문 가운데정렬 · 텍스트만 있는 슬라이드 · 이미지로 넣는 차트(네이티브 `addChart` 사용) ·
`#` 붙은 HEX(파일 손상) · 공유 옵션 객체 재사용
