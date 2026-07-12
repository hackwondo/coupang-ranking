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
import os

# ═══ 채울 키워드 자동 로드 ═══
# build_products.py를 먼저 돌리면 data/missing_keywords.json 에
# "쿠팡 링크가 아직 없는 키워드"만 자동으로 모아둡니다.
# 이 파일이 있으면 그것만 읽고, 없으면 아래 KEYWORDS를 수동으로 채워서 쓰세요.
MISSING_FILE = "data/missing_keywords.json"
if os.path.exists(MISSING_FILE):
    with open(MISSING_FILE, "r", encoding="utf-8") as f:
        KEYWORDS = json.load(f)
    print(f"'{MISSING_FILE}' 에서 {len(KEYWORDS)}개 키워드 로드")
else:
    # 수동 실행용 폴백 (build_products.py를 먼저 안 돌렸을 때)
    KEYWORDS = [
        # 여기에 링크가 필요한 새 키워드만 적어주세요
    ]
    print(f"'{MISSING_FILE}' 없음 — 수동으로 지정한 {len(KEYWORDS)}개 키워드로 진행")

# ═══ 기존 링크 자동 로드 (덮어쓰지 않고 병합) ═══
EXISTING_FILE = "data/affiliate_links.json"
if os.path.exists(EXISTING_FILE):
    with open(EXISTING_FILE, "r", encoding="utf-8") as f:
        EXISTING_LINKS = json.load(f)
else:
    EXISTING_LINKS = {}

# 이미 링크 있는 키워드는 크롤링 대상에서 자동 제외 (중복/재생성 방지)
KEYWORDS = [kw for kw in KEYWORDS if kw not in EXISTING_LINKS]

def main():
    if not KEYWORDS:
        print("")
        print("✅ 새로 만들 링크가 없습니다 (모든 키워드에 이미 링크 있음). 종료합니다.")
        return

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

    # 기존 링크(data/affiliate_links.json) + 이번에 새로 만든 링크 합치기
    all_links = {}
    all_links.update(EXISTING_LINKS)
    all_links.update(results)

    print("")
    print("=" * 50)
    print("총 %d개 링크 보유!" % len(all_links))
    print("  기존: %d개" % len(EXISTING_LINKS))
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
    js_code += '  let bestKey = null, bestVal = null;\n'
    js_code += '  for (const [k, v] of Object.entries(LINKS)) {\n'
    js_code += '    if (text.includes(k) && (!bestKey || k.length > bestKey.length)) {\n'
    js_code += '      bestKey = k; bestVal = v;\n'
    js_code += '    }\n'
    js_code += '  }\n'
    js_code += '  return bestVal;\n'
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
