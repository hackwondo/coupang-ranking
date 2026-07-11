# -*- coding: utf-8 -*-
"""
쿠팡 파트너스 링크 자동 생성기 v4
- JavaScript 클릭으로 배너 가림 문제 해결
"""

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
import time
import json
import re

KEYWORDS = [
    "미세먼지마스크", "가디건", "피크닉매트", "공기청정기",
    "아이스박스", "자외선차단제", "모기퇴치",
    "김장매트", "트렌치코트", "텀블러", "가습기",
    "패딩", "온수매트", "전기장판", "우산",
    "닌텐도스위치", "폰케이스", "스탠리텀블러", "다이슨에어랩",
    "포토카드바인더", "다꾸스티커", "무선이어버드", "학생백팩", "립틴트",
    "레티놀세럼", "빔프로젝터", "무선충전패드", "LED무드등",
    "유아물티슈", "키즈비타민", "전동킥보드",
    "글루코사민", "골프장갑", "안마기", "등산화",
    "혈압계", "등산스틱", "홍삼", "무릎보호대",
    "반려식물자동급수기", "노트북거치대", "펫자동급식기",
    "칫솔살균기", "모니터받침대",
    # ---- 신규 추가 (마켓퀀트 트렌드 상품 대응) ----
    "물티슈", "멀티비타민", "철제선반", "베이비로션",
    "식기세척기", "수유브라", "마사지기", "와인오프너",
    "수면유도안경", "견과류선물세트", "요추쿠션", "태블릿PC",
    "저당밥솥", "운동화", "포토앨범", "그립톡",
    "크롭티셔츠", "마커틴트",
]

def main():
    print("크롬 실행...")
    opts = uc.ChromeOptions()
    opts.add_argument("--lang=ko-KR")
    driver = uc.Chrome(options=opts)

    driver.get("https://partners.coupang.com/#affiliate/ws/link-to-any-page")

    print("")
    print("=" * 50)
    print("  크롬에서 파트너스 로그인하세요")
    print("  링크 생성 페이지 보이면 엔터")
    print("=" * 50)
    input("  엔터: ")
    time.sleep(2)

    results = {}
    total = len(KEYWORDS)
    print("")
    print("총 %d개 시작!" % total)
    print("")

    for idx, kw in enumerate(KEYWORDS, 1):
        search_url = "https://www.coupang.com/np/search?q=" + kw
        print("  [%d/%d] %s..." % (idx, total, kw), end=" ", flush=True)

        try:
            # 생성 전에 이미 화면에 떠 있는 링크 목록 기록 (신규 링크 판별용)
            before_links = set(re.findall(
                r'https://link\.coupang\.com/a/[A-Za-z0-9]+', driver.page_source
            ))

            # React 컨트롤드 인풋은 .value만 바꾸면 내부 state가 갱신되지 않으므로
            # 네이티브 setter를 통해 값을 넣고 input 이벤트를 발생시킴
            driver.execute_script("""
                var inp = document.getElementById('url');
                if (inp) {
                    var nativeSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype, 'value'
                    ).set;
                    nativeSetter.call(inp, arguments[0]);
                    inp.dispatchEvent(new Event('input', {bubbles: true}));
                    inp.dispatchEvent(new Event('change', {bubbles: true}));
                }
            """, search_url)
            time.sleep(0.7)

            # 값이 실제로 반영됐는지 확인
            actual_val = driver.execute_script(
                "return document.getElementById('url') ? document.getElementById('url').value : '';"
            )
            if search_url not in actual_val:
                print("FAIL (입력값 반영 안됨: %s)" % actual_val[:30])
                time.sleep(1)
                continue

            # JavaScript로 버튼 클릭 (배너 가림 우회)
            driver.execute_script("""
                var buttons = document.querySelectorAll('button');
                for (var b of buttons) {
                    if (b.textContent.includes('링크 생성')) {
                        b.click();
                        break;
                    }
                }
            """)

            # 새 링크가 나타날 때까지 최대 8초 폴링 (이전 링크와 달라야 함)
            new_url = None
            for _ in range(16):
                time.sleep(0.5)
                current_links = set(re.findall(
                    r'https://link\.coupang\.com/a/[A-Za-z0-9]+', driver.page_source
                ))
                diff = current_links - before_links
                if diff:
                    new_url = sorted(diff)[-1]
                    break

            if new_url:
                results[kw] = new_url
                print("OK: " + new_url)
            else:
                print("FAIL (타임아웃, 새 링크 없음)")

            time.sleep(1.0)

        except Exception as e:
            print("ERROR: " + str(e)[:50])
            time.sleep(2)
            continue

    driver.quit()

    # 기존 링크 합치기
    existing = {
        "선풍기": "https://link.coupang.com/a/fhbfTzeJdQ",
        "무선이어폰": "https://link.coupang.com/a/fhbqIzUOei",
        "캠핑의자": "https://link.coupang.com/a/fhbss3l6ii",
        "래쉬가드": "https://link.coupang.com/a/fhbtkGc5HU",
        "손난로": "https://link.coupang.com/a/fhbvrYCwWO",
        "로봇청소기": "https://link.coupang.com/a/fhbxlihCbk",
        "에어프라이어": "https://link.coupang.com/a/fhbDqbFYU8",
        "프로틴": "https://link.coupang.com/a/fhbERdb3bE",
        "제습기": "https://link.coupang.com/a/fhbFlsNR3A",
        "핫팩": "https://link.coupang.com/a/fhbGDkhnkz",
    }

    all_links = {}
    all_links.update(existing)
    all_links.update(results)

    print("")
    print("=" * 50)
    print("총 %d개 링크 수집!" % len(all_links))
    print("  기존: %d개" % len(existing))
    print("  신규: %d개" % len(results))
    print("  실패: %d개" % (total - len(results)))
    print("=" * 50)

    # JS 파일 생성
    lines = []
    for kw, link in all_links.items():
        lines.append('  "%s": "%s"' % (kw, link))
    links_str = ",\n".join(lines)

    js_code = 'const LINKS = {\n' + links_str + ',\n};\n'
    js_code += 'const DEFAULT = "https://link.coupang.com/a/fhbVQhahoq";\n\n'
    js_code += 'function find(text) {\n'
    js_code += '  if (!text) return null;\n'
    js_code += '  for (const [k, v] of Object.entries(LINKS)) {\n'
    js_code += '    if (text.includes(k)) return v;\n'
    js_code += '  }\n'
    js_code += '  return null;\n'
    js_code += '}\n\n'
    js_code += 'export function makeAffiliateLink(url, tag) {\n'
    js_code += '  return find(tag) || find(decodeURIComponent(url || "")) || DEFAULT;\n'
    js_code += '}\n\n'
    js_code += 'export function makeSearchLink(keyword) {\n'
    js_code += '  return find(keyword) || DEFAULT;\n'
    js_code += '}\n\n'
    js_code += 'export function trackClick(category, label) {\n'
    js_code += '  if (typeof window !== "undefined" && window.gtag) {\n'
    js_code += '    window.gtag("event", "affiliate_click", { event_category: category, event_label: label });\n'
    js_code += '  }\n'
    js_code += '}\n'

    with open("lib/affiliate.js", "w", encoding="utf-8") as f:
        f.write(js_code)
    print("")
    print("lib/affiliate.js 저장! (%d개 링크)" % len(all_links))

    with open("data/affiliate_links.json", "w", encoding="utf-8") as f:
        json.dump(all_links, f, ensure_ascii=False, indent=2)
    print("data/affiliate_links.json 백업 저장")
    print("")
    print("git add . && git commit -m 'all links' && git push")


if __name__ == "__main__":
    main()
