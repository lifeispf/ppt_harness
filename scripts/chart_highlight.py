#!/usr/bin/env python3
"""단일 시리즈 바 차트에 포인트별 색 오버라이드(c:dPt)를 주입한다.

pptxgenjs는 단일 시리즈의 포인트별 색을 지원하지 않으므로, 빌드된 pptx의
차트 OOXML을 후처리해 '하이라이트 포인트만 시리즈 원색(primary), 나머지는
지정색(steel)'으로 만든다 — 차트가 결론을 말하게 하는 규칙 (design.md §6).

사용법: python chart_highlight.py deck.pptx <highlightIndex> <totalPoints> <otherColorHex>
예:     python chart_highlight.py dist/deck.pptx 7 8 AEBFD4
실행 후 반드시 validate.py로 재검증할 것.
"""
import sys
import os
import zipfile


def main():
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    pptx, hi, total, other = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4].upper()

    # 스키마 순서: c:ser 내부에서 dPt는 spPr/invertIfNegative 뒤, dLbls 앞
    dpts = "".join(
        f'<c:dPt><c:idx val="{i}"/>'
        f'<c:spPr><a:solidFill><a:srgbClr val="{other}"/></a:solidFill></c:spPr></c:dPt>'
        for i in range(total)
        if i != hi
    )

    tmp = pptx + ".tmp"
    applied = False
    with zipfile.ZipFile(pptx) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "ppt/charts/chart1.xml" and b"<c:dPt>" not in data:
                xml = data.decode("utf-8")
                pos = xml.find("<c:dLbls>")  # 첫 dLbls = 첫 시리즈 내부
                if pos != -1:
                    xml = xml[:pos] + dpts + xml[pos:]
                    data = xml.encode("utf-8")
                    applied = True
            zout.writestr(item, data)
    os.replace(tmp, pptx)
    print("chart highlight:", "applied" if applied else "SKIPPED (이미 적용됐거나 dLbls 없음)")


if __name__ == "__main__":
    main()
