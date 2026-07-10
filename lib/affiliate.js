const LINKS = {
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
  "미세먼지마스크": "https://link.coupang.com/a/fhBtX1PCsm",
  "가디건": "https://link.coupang.com/a/fhBu83zefs",
  "피크닉매트": "https://link.coupang.com/a/fhBwcMg2rA",
  "공기청정기": "https://link.coupang.com/a/fhBxhumSzc",
  "아이스박스": "https://link.coupang.com/a/fhBylA7UZg",
  "자외선차단제": "https://link.coupang.com/a/fhBztu4aLQ",
  "모기퇴치": "https://link.coupang.com/a/fhBAyio2HA",
  "김장매트": "https://link.coupang.com/a/fhBBBYgRA4",
  "트렌치코트": "https://link.coupang.com/a/fhBCGQt4NM",
  "텀블러": "https://link.coupang.com/a/fhBDMXFBNk",
  "가습기": "https://link.coupang.com/a/fhBERYuYvc",
  "패딩": "https://link.coupang.com/a/fhBFWqk0nA",
  "온수매트": "https://link.coupang.com/a/fhBG0I5R5U",
  "전기장판": "https://link.coupang.com/a/fhBH46ojTg",
  "우산": "https://link.coupang.com/a/fhBI9xJd2O",
  "닌텐도스위치": "https://link.coupang.com/a/fhBKhQ8HHE",
  "폰케이스": "https://link.coupang.com/a/fhBLmfIoMu",
  "스탠리텀블러": "https://link.coupang.com/a/fhBMrfkG8y",
  "유아물티슈": "https://link.coupang.com/a/fhBRGYj3iC",
  "키즈비타민": "https://link.coupang.com/a/fhBSLxf3qC",
  "전동킥보드": "https://link.coupang.com/a/fhBTPz7nRk",
  "노트북거치대": "https://link.coupang.com/a/fhBYj7ramq",
  "펫자동급식기": "https://link.coupang.com/a/fhBZn2BOvI",
  "모니터받침대": "https://link.coupang.com/a/fhB1qcgVgG",
};
const DEFAULT = "https://link.coupang.com/a/fhbVQhahoq";

function find(text) {
  if (!text) return null;
  for (const [k, v] of Object.entries(LINKS)) {
    if (text.includes(k)) return v;
  }
  return null;
}

export function makeAffiliateLink(url, tag) {
  return find(tag) || find(decodeURIComponent(url || "")) || DEFAULT;
}

export function makeSearchLink(keyword) {
  return find(keyword) || DEFAULT;
}

export function trackClick(category, label) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "affiliate_click", { event_category: category, event_label: label });
  }
}
