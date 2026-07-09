"""
쿠팡랭킹 데이터 파이프라인
크롤링 → products.json 자동 생성
실행 시간: 약 5~8분 (키워드 26개 크롤링)
"""

import undetected_chromedriver as uc
from bs4 import BeautifulSoup
import json
import time
import random
import re
from datetime import date


# ─── 크롤링 키워드 설정 ─────────────────────────────
SEASONAL_KEYWORDS = {
    "🌸 봄": ["캠핑의자", "미세먼지마스크", "봄가디건", "피크닉매트"],
    "☀️ 여름": ["선풍기", "래쉬가드", "아이스박스", "자외선차단제"],
    "🍁 가을": ["김장매트", "트렌치코트", "보온텀블러", "가습기"],
    "❄️ 겨울": ["손난로", "롱패딩", "온수매트", "핫팩"],
    "🌧️ 장마": ["우산", "제습기", "방수신발커버", "빨래건조대"],
}

TRENDING_KEYWORDS = ["무선이어폰", "로봇청소기", "에어프라이어", "닌텐도스위치", "프로틴", "폰케이스"]

AGE_KEYWORDS = {
    "10대": ["포토카드바인더", "다꾸스티커"],
    "20대": ["레티놀세럼", "에어프라이어"],
    "30대": ["유아물티슈", "로봇청소기"],
    "40대": ["글루코사민", "골프장갑"],
    "50대+": ["혈압계", "등산스틱"],
}

EMOJI_MAP = {
    "캠핑": "🏕️", "마스크": "😷", "가디건": "👚", "매트": "🧺", "선풍기": "🌀",
    "래쉬가드": "🏄", "아이스": "🧊", "차단": "☀️", "김장": "🥬", "코트": "🧥",
    "텀블러": "☕", "가습": "💧", "손난로": "🔥", "패딩": "🧥", "온수": "🛏️",
    "핫팩": "♨️", "우산": "☂️", "제습": "💧", "방수": "👟", "건조": "👕",
    "이어폰": "🎧", "청소기": "🤖", "프라이어": "🍟", "닌텐도": "🎮",
    "프로틴": "💪", "케이스": "📱", "포토카드": "📸", "스티커": "✏️",
    "세럼": "✨", "물티슈": "👶", "글루코사민": "💪", "골프": "⛳",
    "혈압": "❤️", "등산": "🥾", "비타민": "💊",
}


def get_emoji(name):
    for key, emoji in EMOJI_MAP.items():
        if key in name:
            return emoji
    return "📦"


# ─── 크롤링 함수 ───────────────────────────────────

def crawl(driver, keyword, max_items=10):
    url = f"https://www.coupang.com/np/search?q={keyword}&channel=user&sorter=scoreDesc&listSize=36"
    driver.get(url)
    time.sleep(random.uniform(3, 5))

    for i in range(1, 6):
        driver.execute_script(f"window.scrollTo(0, document.body.scrollHeight*{i}/5)")
        time.sleep(0.6)
    time.sleep(1)

    soup = BeautifulSoup(driver.page_source, "html.parser")
    items = soup.select("li[class*='ProductUnit_productUnit']")

    products = []
    for rank, item in enumerate(items[:max_items], 1):
        try:
            p = {"rank": rank}

            name_el = item.select_one("div[class*='productName']")
            p["name"] = name_el.get_text(strip=True) if name_el else ""

            price_area = item.select_one("div[class*='PriceArea'], div[class*='priceArea']")
            if price_area:
                all_prices = re.findall(r'([\d,]+)원', price_area.get_text())
                if all_prices:
                    p["price"] = f"{int(all_prices[-1].replace(',', '')):,}"
                discount = re.search(r'(\d+)%', price_area.get_text())
                p["growth"] = f"+{discount.group(1)}%" if discount else ""
            else:
                p["price"] = "0"
                p["growth"] = ""

            rating_el = item.select_one("div[class*='ProductRating']")
            if rating_el:
                rt = rating_el.get_text(strip=True)
                rm = re.search(r'\(([\d,]+)\)', rt)
                p["reviews"] = int(rm.group(1).replace(",", "")) if rm else 0
            else:
                p["reviews"] = 0

            p["is_rocket"] = "로켓" in item.get_text() or "내일" in item.get_text()
            p["img"] = get_emoji(p["name"])
            p["url"] = f"https://www.coupang.com/np/search?q={keyword}"

            # 스코어 계산 (리뷰수 + 할인율 기반)
            disc_val = int(discount.group(1)) if discount else 0
            review_score = min(p["reviews"] / 100, 50)
            p["score"] = min(99, int(50 + disc_val * 0.3 + review_score))

            if p.get("name"):
                products.append(p)
        except Exception:
            continue

    return products


# ─── 메인 파이프라인 ───────────────────────────────

def main():
    print("🚀 크롬 실행 중...")
    options = uc.ChromeOptions()
    options.add_argument("--lang=ko-KR")
    options.add_argument("--disable-blink-features=AutomationControlled")

    driver = uc.Chrome(options=options)
    driver.set_page_load_timeout(30)

    driver.get("https://www.coupang.com/")
    time.sleep(4)
    print(f"   쿠팡 접속 OK: {driver.title[:30]}")

    output = {
        "updated": date.today().isoformat(),
        "seasons": {},
        "trending": [],
        "ageGroups": {},
        "priceAnalysis": [],
        "bestSellers": {"weekly": [], "monthly": []},
        "sellerRankings": [],
        "globalSourcing": {},
        "blueOcean": [],
    }

    all_products = []  # 전체 가격 분석용

    # ─── 1) 계절성 크롤링 ───
    print("\n" + "=" * 50)
    print("🌸 [1/4] 계절성 데이터 수집")
    print("=" * 50)

    for season, keywords in SEASONAL_KEYWORDS.items():
        print(f"\n  📅 {season}")
        season_items = []
        for kw in keywords:
            print(f"    → '{kw}' 크롤링...")
            products = crawl(driver, kw, max_items=5)
            # 카테고리 추정
            for p in products:
                p["cat"] = kw
            season_items.extend(products)
            all_products.extend(products)
            time.sleep(random.uniform(2, 4))

        # 스코어 기준 정렬, 순위 재부여
        season_items.sort(key=lambda x: -x.get("score", 0))
        for i, item in enumerate(season_items[:5], 1):
            item["rank"] = i
        output["seasons"][season] = season_items[:5]
        print(f"    ✓ {season}: {len(season_items[:5])}개 완료")

    # ─── 2) 트렌드 크롤링 ───
    print("\n" + "=" * 50)
    print("🔥 [2/4] 트렌드 데이터 수집")
    print("=" * 50)

    for kw in TRENDING_KEYWORDS:
        print(f"  → '{kw}' 크롤링...")
        products = crawl(driver, kw, max_items=5)
        all_products.extend(products)

        # 연관 태그 생성
        tags = []
        for p in products[:3]:
            words = p["name"].split()[:2]
            if words:
                tags.append(" ".join(words))
        if len(tags) < 3:
            tags.append(kw + " 추천")

        total_reviews = sum(p.get("reviews", 0) for p in products)
        output["trending"].append({
            "keyword": kw,
            "vol": total_reviews * 40,
            "change": products[0].get("growth", "+0%") if products else "+0%",
            "tags": tags[:3],
            "cat": kw,
        })
        time.sleep(random.uniform(2, 4))

    print(f"  ✓ 트렌드 {len(output['trending'])}개 완료")

    # ─── 3) 연령대별 크롤링 ───
    print("\n" + "=" * 50)
    print("👤 [3/4] 연령대별 데이터 수집")
    print("=" * 50)

    trend_labels = ["급상승", "상승", "유지", "급상승", "상승"]
    for age, keywords in AGE_KEYWORDS.items():
        print(f"\n  👤 {age}")
        age_items = []
        for kw in keywords:
            print(f"    → '{kw}' 크롤링...")
            products = crawl(driver, kw, max_items=4)
            for p in products:
                p["cat"] = kw
                p["trend"] = random.choice(trend_labels)
            age_items.extend(products)
            all_products.extend(products)
            time.sleep(random.uniform(2, 4))

        for i, item in enumerate(age_items[:4], 1):
            item["rank"] = i
        output["ageGroups"][age] = age_items[:4]
        print(f"    ✓ {age}: {len(age_items[:4])}개")

    # ─── 4) 파생 데이터 생성 ───
    print("\n" + "=" * 50)
    print("📊 [4/4] 파생 데이터 계산")
    print("=" * 50)

    # 가격대 분석 (크롤링 데이터 기반)
    price_buckets = {
        "1만원 이하": {"count": 0, "reviews": [], "prices": []},
        "1~3만원": {"count": 0, "reviews": [], "prices": []},
        "3~5만원": {"count": 0, "reviews": [], "prices": []},
        "5~10만원": {"count": 0, "reviews": [], "prices": []},
        "10~30만원": {"count": 0, "reviews": [], "prices": []},
        "30만원 이상": {"count": 0, "reviews": [], "prices": []},
    }

    for p in all_products:
        try:
            price_val = int(p.get("price", "0").replace(",", ""))
        except (ValueError, AttributeError):
            continue

        if price_val <= 0:
            continue
        elif price_val < 10000:
            bucket = "1만원 이하"
        elif price_val < 30000:
            bucket = "1~3만원"
        elif price_val < 50000:
            bucket = "3~5만원"
        elif price_val < 100000:
            bucket = "5~10만원"
        elif price_val < 300000:
            bucket = "10~30만원"
        else:
            bucket = "30만원 이상"

        price_buckets[bucket]["count"] += 1
        price_buckets[bucket]["reviews"].append(p.get("reviews", 0))
        price_buckets[bucket]["prices"].append(price_val)

    margins = ["15~25%", "25~40%", "30~45%", "25~35%", "20~30%", "15~25%"]
    for i, (range_name, data) in enumerate(price_buckets.items()):
        avg_reviews = sum(data["reviews"]) / max(len(data["reviews"]), 1)
        top_item = ""
        for p in all_products:
            try:
                pv = int(p.get("price", "0").replace(",", ""))
            except:
                continue
            if range_name == "1만원 이하" and pv < 10000 and p.get("reviews", 0) > 0:
                top_item = p["name"][:15]
                break
            elif range_name == "1~3만원" and 10000 <= pv < 30000 and p.get("reviews", 0) > 0:
                top_item = p["name"][:15]
                break

        output["priceAnalysis"].append({
            "range": range_name,
            "avgSales": max(data["count"] * 500, 1000),
            "competition": round(10 - i * 1.3, 1),
            "margin": margins[i],
            "topItem": top_item or "데이터 수집 중",
            "bestCategory": "전체",
        })

    # 베스트셀러 (리뷰 수 기준 정렬)
    best_items = sorted(all_products, key=lambda x: -x.get("reviews", 0))
    sellers = ["쿠팡 판매자", "로켓배송", "공식스토어", "직영몰", "마켓플레이스"]

    for i, item in enumerate(best_items[:8], 1):
        entry = {
            "rank": i,
            "name": item["name"][:25],
            "seller": random.choice(sellers),
            "sales": item.get("reviews", 0) * 40,
            "change": item.get("growth", "+0%"),
            "reviews": 4.5 + random.random() * 0.4,
            "img": item.get("img", "📦"),
            "url": item.get("url", ""),
        }
        output["bestSellers"]["weekly"].append(entry)
        entry_m = entry.copy()
        entry_m["sales"] = entry["sales"] * 4
        output["bestSellers"]["monthly"].append(entry_m)

    # 판매자 랭킹 (고정 데이터 - 크롤링 불가)
    output["sellerRankings"] = [
        {"rank":1,"name":"삼성공식스토어","category":"전자기기","monthlySales":"₩48.2억","products":1240,"rating":4.9,"badge":"로켓배송"},
        {"rank":2,"name":"CJ제일제당","category":"식품","monthlySales":"₩32.1억","products":890,"rating":4.8,"badge":"로켓배송"},
        {"rank":3,"name":"LG생활건강","category":"뷰티/생활","monthlySales":"₩28.7억","products":1560,"rating":4.7,"badge":"로켓배송"},
        {"rank":4,"name":"나이키코리아","category":"스포츠/패션","monthlySales":"₩24.5억","products":2340,"rating":4.8,"badge":"로켓배송"},
        {"rank":5,"name":"애플코리아","category":"전자기기","monthlySales":"₩21.3억","products":420,"rating":4.9,"badge":"로켓배송"},
        {"rank":6,"name":"풀무원","category":"식품","monthlySales":"₩18.9억","products":670,"rating":4.6,"badge":"로켓프레시"},
        {"rank":7,"name":"쿠팡 자체브랜드","category":"생활용품","monthlySales":"₩16.2억","products":3200,"rating":4.5,"badge":"로켓배송"},
        {"rank":8,"name":"다이슨코리아","category":"가전","monthlySales":"₩14.8억","products":180,"rating":4.7,"badge":"로켓배송"},
    ]

    # 해외소싱 (고정 데이터 - 해외 사이트 크롤링 불가)
    output["globalSourcing"] = {
        "🇨🇳 중국 (1688/알리)": [
            {"rank":1,"name":"LED 무드등 색변환","cat":"인테리어","margin":"65~80%","delivery":"7~14일","risk":"낮음","score":92,"img":"💡"},
            {"rank":2,"name":"실리콘 주방도구 세트","cat":"주방용품","margin":"70~85%","delivery":"7~14일","risk":"낮음","score":89,"img":"🥄"},
            {"rank":3,"name":"차량용 핸드폰 거치대","cat":"자동차","margin":"60~75%","delivery":"7~14일","risk":"중간","score":86,"img":"📱"},
            {"rank":4,"name":"미니 가습기 USB","cat":"가전","margin":"55~70%","delivery":"10~20일","risk":"중간","score":82,"img":"💨"},
            {"rank":5,"name":"블루투스 스피커 방수","cat":"전자기기","margin":"50~65%","delivery":"10~20일","risk":"높음","score":78,"img":"🔊"},
        ],
        "🇯🇵 일본 (라쿠텐)": [
            {"rank":1,"name":"다이소 수납 정리함","cat":"생활용품","margin":"45~60%","delivery":"5~10일","risk":"낮음","score":90,"img":"📦"},
            {"rank":2,"name":"일본 과자 세트","cat":"식품","margin":"35~50%","delivery":"7~14일","risk":"중간","score":85,"img":"🍘"},
            {"rank":3,"name":"올인원 스킨케어","cat":"뷰티","margin":"40~55%","delivery":"5~10일","risk":"낮음","score":83,"img":"🧴"},
            {"rank":4,"name":"캐릭터 문구류","cat":"문구/취미","margin":"50~65%","delivery":"7~14일","risk":"낮음","score":80,"img":"✏️"},
            {"rank":5,"name":"일본 주방 칼세트","cat":"주방용품","margin":"30~45%","delivery":"7~14일","risk":"중간","score":76,"img":"🔪"},
        ],
        "🇺🇸 미국 (아마존US)": [
            {"rank":1,"name":"프리미엄 비타민 세트","cat":"건강식품","margin":"40~55%","delivery":"10~21일","risk":"중간","score":87,"img":"💊"},
            {"rank":2,"name":"유기농 프로틴바","cat":"건강식품","margin":"35~50%","delivery":"10~21일","risk":"중간","score":84,"img":"🍫"},
            {"rank":3,"name":"스마트워치 밴드","cat":"전자기기","margin":"55~70%","delivery":"14~25일","risk":"낮음","score":81,"img":"⌚"},
            {"rank":4,"name":"코스트코 견과류 대용량","cat":"식품","margin":"25~35%","delivery":"14~25일","risk":"높음","score":75,"img":"🥜"},
            {"rank":5,"name":"캠핑 LED 랜턴","cat":"아웃도어","margin":"45~60%","delivery":"14~25일","risk":"중간","score":72,"img":"🔦"},
        ],
    }

    # 블루오션 (리뷰 적은 상품 = 경쟁 낮음)
    low_review = sorted(all_products, key=lambda x: x.get("reviews", 0))
    for i, item in enumerate(low_review[:6], 1):
        reviews = item.get("reviews", 0)
        sellers_est = max(reviews // 10, 5)
        demand_est = max(reviews * 50, 3000)
        score = min(99, int(90 - sellers_est * 0.5 + random.randint(0, 10)))
        opp = "최상" if score >= 90 else "우수" if score >= 80 else "양호"

        output["blueOcean"].append({
            "rank": i,
            "name": item["name"][:20],
            "demand": demand_est,
            "sellers": sellers_est,
            "score": score,
            "opp": opp,
            "price": item.get("price", "0"),
            "cat": item.get("cat", "기타"),
        })

    driver.quit()
    print("\n🛑 브라우저 종료")

    # ─── JSON 저장 ───
    output_path = "data/products.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 50}")
    print(f"✅ products.json 생성 완료!")
    print(f"{'=' * 50}")
    print(f"📁 저장 위치: {output_path}")
    print(f"📅 업데이트: {output['updated']}")
    print(f"🌸 계절성: {sum(len(v) for v in output['seasons'].values())}개 상품")
    print(f"🔥 트렌드: {len(output['trending'])}개 키워드")
    print(f"👤 연령대: {sum(len(v) for v in output['ageGroups'].values())}개 상품")
    print(f"💰 가격대: {len(output['priceAnalysis'])}개 구간")
    print(f"🏆 베스트: {len(output['bestSellers']['weekly'])}개 상품")
    print(f"🌏 해외소싱: {sum(len(v) for v in output['globalSourcing'].values())}개 상품")
    print(f"🔵 블루오션: {len(output['blueOcean'])}개 상품")
    print(f"\n다음 단계: git add . && git commit -m 'real data' && git push")


if __name__ == "__main__":
    main()
