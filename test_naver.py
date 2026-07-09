"""
네이버 데이터랩 API 테스트
Client ID와 Secret을 입력하고 실행하세요.
"""

import requests
import json
from datetime import datetime, timedelta

# ⚠️ 여기에 발급받은 키 입력
CLIENT_ID = "VP_yEaJuRN2fXDR1z34S"
CLIENT_SECRET = "dtPNxvD6bX"

def test_search_trend():
    """검색어 트렌드 API 테스트"""
    print("=" * 50)
    print("📊 [테스트 1] 검색어 트렌드")
    print("=" * 50)

    url = "https://openapi.naver.com/v1/datalab/search"
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
        "Content-Type": "application/json",
    }

    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")

    body = {
        "startDate": start_date,
        "endDate": end_date,
        "timeUnit": "month",
        "keywordGroups": [
            {"groupName": "선풍기", "keywords": ["선풍기"]},
            {"groupName": "핫팩", "keywords": ["핫팩"]},
            {"groupName": "캠핑", "keywords": ["캠핑"]},
        ],
    }

    resp = requests.post(url, headers=headers, json=body, timeout=10)
    print(f"응답 코드: {resp.status_code}")

    if resp.status_code == 200:
        data = resp.json()
        print("✅ 성공!\n")
        for group in data.get("results", []):
            kw = group["title"]
            points = group.get("data", [])
            print(f"🔑 '{kw}' 월별 검색량:")
            for p in points[-6:]:  # 최근 6개월
                bar = "█" * int(p["ratio"] / 5)
                print(f"   {p['period']}  {p['ratio']:5.1f}  {bar}")
            print()
    else:
        print(f"❌ 실패: {resp.text}")


def test_age_trend():
    """연령대별 검색 트렌드 테스트"""
    print("=" * 50)
    print("👤 [테스트 2] 연령대별 검색량 비교")
    print("=" * 50)

    url = "https://openapi.naver.com/v1/datalab/search"
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
        "Content-Type": "application/json",
    }

    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

    ages_map = {
        "10대": ["2"],
        "20대": ["3", "4"],
        "30대": ["5", "6"],
        "40대": ["7", "8"],
        "50대+": ["9", "10", "11"],
    }

    keyword = "무선이어폰"
    print(f"키워드: '{keyword}'\n")

    for age_label, age_codes in ages_map.items():
        body = {
            "startDate": start_date,
            "endDate": end_date,
            "timeUnit": "month",
            "keywordGroups": [{"groupName": keyword, "keywords": [keyword]}],
            "ages": age_codes,
        }

        resp = requests.post(url, headers=headers, json=body, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            results = data.get("results", [])
            if results and results[0].get("data"):
                latest = results[0]["data"][-1]["ratio"]
                bar = "█" * int(latest / 5)
                print(f"  {age_label:6s}  검색지수: {latest:5.1f}  {bar}")
        else:
            print(f"  {age_label}: 실패 ({resp.status_code})")

        import time
        time.sleep(0.3)


def test_shopping_trend():
    """쇼핑 카테고리 트렌드 테스트"""
    print("\n" + "=" * 50)
    print("🛒 [테스트 3] 쇼핑 카테고리 트렌드")
    print("=" * 50)

    url = "https://openapi.naver.com/v1/datalab/shopping/categories"
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
        "Content-Type": "application/json",
    }

    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")

    body = {
        "startDate": start_date,
        "endDate": end_date,
        "timeUnit": "month",
        "category": [
            {"name": "디지털/가전", "param": ["50000003"]},
            {"name": "식품", "param": ["50000006"]},
        ],
    }

    resp = requests.post(url, headers=headers, json=body, timeout=10)
    print(f"응답 코드: {resp.status_code}")

    if resp.status_code == 200:
        data = resp.json()
        print("✅ 성공!\n")
        for group in data.get("results", []):
            cat = group["title"]
            points = group.get("data", [])
            print(f"🏷️ '{cat}' 최근 6개월:")
            for p in points[-6:]:
                bar = "█" * int(p["ratio"] / 5)
                print(f"   {p['period']}  {p['ratio']:5.1f}  {bar}")
            print()
    else:
        print(f"❌ 실패: {resp.text}")


if __name__ == "__main__":
    if "여기에" in CLIENT_ID:
        print("⚠️  CLIENT_ID와 CLIENT_SECRET을 먼저 입력하세요!")
        print("   test_naver.py 파일을 열어서 윗부분 수정")
    else:
        test_search_trend()
        test_age_trend()
        test_shopping_trend()
        print("\n✅ 전체 테스트 완료!")