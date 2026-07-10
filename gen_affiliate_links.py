# -*- coding: utf-8 -*-
"""
쿠팡 파트너스 링크 자동 생성기 v3
"""

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import json

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
]

def find_partner_url(driver):
    """페이지에서 link.coupang.com URL 찾기"""
    # 방법1: 모든 input에서 찾기
    for inp in driver.find_elements(By.TAG_NAME, "input"):
        val = inp.get_attribute("value") or ""
        if "link.coupang.com" in val:
            return val
    # 방법2: 페이지 전체 텍스트에서 찾기
    import re
    page = driver.page_source
    matches = re.findall(r'https://link\.coupang\.com/a/[A-Za-z0-9]+', page)
    if matches:
        return matches[-1]
    # 방법3: span, div 등에서 찾기
    for tag in ["span", "div", "p", "a"]:
        for el in driver.find_elements(By.TAG_NAME, tag):
            txt = el.text or ""
            if "link.coupang.com" in txt:
                return txt.strip()
    return None

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

    # 먼저 수동 테스트: 1개만 해보기
    print("")
    print("=" * 50)
    print("  수동 테스트: 아무 URL 넣고 링크 생성을 눌러보세요")
    print("  파트너스 URL이 나타나면 엔터")
    print("=" * 50)
    input("  엔터: ")
    
    # 생성된 링크 찾기 테스트
    url = find_partner_url(driver)
    if url:
        print("  찾음! -> " + url)
    else:
        print("  못 찾음. 페이지 구조 덤프:")
        inputs = driver.find_elements(By.TAG_NAME, "input")
        print("  input %d개:" % len(inputs))
        for i, inp in enumerate(inputs):
            val = inp.get_attribute("value") or ""
            if val:
                print("    [%d] %s" % (i, val[:80]))
    
    print("")
    ok = input("  자동 수집 시작할까요? (y/n): ")
    if ok.lower() != "y":
        driver.quit()
        return

    results = {}
    total = len(KEYWORDS)
    print("")
    print("총 %d개 시작! (각 4초 간격)" % total)
    print("")
    
    for idx, kw in enumerate(KEYWORDS, 1):
        search_url = "https://www.coupang.com/np/search?q=" + kw
        print("  [%d/%d] %s..." % (idx, total, kw), end=" ", flush=True)
        
        try:
            # input#url 에 URL 입력
            inp = driver.find_element(By.ID, "url")
            inp.click()
            time.sleep(0.2)
            inp.send_keys(Keys.CONTROL, "a")
            time.sleep(0.1)
            inp.send_keys(search_url)
            time.sleep(0.5)
            
            # 링크 생성 버튼 클릭
            buttons = driver.find_elements(By.TAG_NAME, "button")
            for btn in buttons:
                if "링크 생성" in (btn.text or ""):
                    btn.click()
                    break
            
            # 충분히 대기
            time.sleep(4)
            
            # 생성된 링크 찾기
            url = find_partner_url(driver)
            if url:
                results[kw] = url
                print("OK: " + url)
            else:
                print("FAIL")
            
            time.sleep(1)
            
        except Exception as e:
            print("ERROR: " + str(e)[:50])
            time.sleep(3)
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
    print("총 %d개 링크!" % len(all_links))
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
    print("lib/affiliate.js 저장!")
    
    with open("data/affiliate_links.json", "w", encoding="utf-8") as f:
        json.dump(all_links, f, ensure_ascii=False, indent=2)
    print("data/affiliate_links.json 백업 저장")
    print("")
    print("git add . && git commit -m 'all links' && git push")

if __name__ == "__main__":
    main()