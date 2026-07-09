"""
네이버 월별 트렌드 차트 데이터만 빠르게 업데이트
크롬 없이 10초면 끝남
"""
import requests, json, os, time
from datetime import datetime, timedelta

# test_naver.py에서 키 자동 로드
CLIENT_ID = ""
CLIENT_SECRET = ""
if os.path.exists("test_naver.py"):
    import re
    with open("test_naver.py", "r", encoding="utf-8") as f:
        content = f.read()
    m1 = re.search(r'CLIENT_ID\s*=\s*"([^"]+)"', content)
    m2 = re.search(r'CLIENT_SECRET\s*=\s*"([^"]+)"', content)
    if m1: CLIENT_ID = m1.group(1)
    if m2: CLIENT_SECRET = m2.group(1)
    print(f"✅ API 키 로드 완료")

def naver_trend(keywords, months=24):
    url = "https://openapi.naver.com/v1/datalab/search"
    end = datetime.now().strftime("%Y-%m-%d")
    start = (datetime.now() - timedelta(days=months*30)).strftime("%Y-%m-%d")
    groups = [{"groupName": kw, "keywords": [kw]} for kw in keywords[:5]]
    body = {"startDate": start, "endDate": end, "timeUnit": "month", "keywordGroups": groups}
    headers = {"X-Naver-Client-Id": CLIENT_ID, "X-Naver-Client-Secret": CLIENT_SECRET, "Content-Type": "application/json"}
    resp = requests.post(url, headers=headers, json=body, timeout=10)
    return resp.json() if resp.status_code == 200 else {}

# 월별 트렌드 수집
print("\n📈 네이버 월별 검색 트렌드 수집 중...")
keywords = ["선풍기", "핫팩", "캠핑", "패딩", "제습기"]
data = naver_trend(keywords, months=24)

monthly = {}
if data.get("results"):
    for group in data["results"]:
        kw = group["title"]
        for pt in group.get("data", []):
            m = int(pt["period"].split("-")[1])
            if m not in monthly:
                monthly[m] = {}
            if kw not in monthly[m]:
                monthly[m][kw] = []
            monthly[m][kw].append(pt["ratio"])

chart = []
for m in range(1, 13):
    row = {"m": f"{m}월"}
    for kw in keywords:
        vals = monthly.get(m, {}).get(kw, [0])
        row[kw] = round(sum(vals) / len(vals), 1)
    chart.append(row)

# 결과 출력
print("\n📊 월별 수요 사이클:")
print(f"{'월':>4s}", end="")
for kw in keywords:
    print(f"  {kw:>6s}", end="")
print()
for row in chart:
    print(f"{row['m']:>4s}", end="")
    for kw in keywords:
        val = row[kw]
        bar = "█" * int(val / 5)
        print(f"  {val:>5.1f}", end="")
    print()

# products.json 업데이트
products_path = "data/products.json"
if os.path.exists(products_path):
    with open(products_path, "r", encoding="utf-8") as f:
        products = json.load(f)
    products["monthlyTrends"] = chart
    with open(products_path, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"\n✅ {products_path} 업데이트 완료!")
    print("👉 git add . && git commit -m 'real chart data' && git push")
else:
    print(f"\n[!] {products_path} 없음. build_products.py를 먼저 실행하세요.")
