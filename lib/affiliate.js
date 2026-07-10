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
  "미세먼지마스크": "https://link.coupang.com/a/fhftfTYCOa",
  "가디건": "https://link.coupang.com/a/fhfukovNdY",
  "피크닉매트": "https://link.coupang.com/a/fhfvpkRKMu",
  "공기청정기": "https://link.coupang.com/a/fhfws6n2vA",
  "아이스박스": "https://link.coupang.com/a/fhfxwVHTO0",
  "자외선차단제": "https://link.coupang.com/a/fhfyBmuwbQ",
  "모기퇴치": "https://link.coupang.com/a/fhfzEO92Jw",
  "김장매트": "https://link.coupang.com/a/fhfAIjmNwG",
  "트렌치코트": "https://link.coupang.com/a/fhfBL8SYQm",
  "텀블러": "https://link.coupang.com/a/fhfCQfsBJA",
  "가습기": "https://link.coupang.com/a/fhfDUkSkkS",
  "패딩": "https://link.coupang.com/a/fhfEXPrXnU",
  "온수매트": "https://link.coupang.com/a/fhfF2tzIRM",
  "전기장판": "https://link.coupang.com/a/fhfG5ZV16i",
  "우산": "https://link.coupang.com/a/fhfH9mLdvM",
  "닌텐도스위치": "https://link.coupang.com/a/fhfJcZ4EeG",
  "폰케이스": "https://link.coupang.com/a/fhfKgJWmIK",
  "스탠리텀블러": "https://link.coupang.com/a/fhfLlzSMSW",
  "다이슨에어랩": "https://link.coupang.com/a/fhfMpfuwp2",
  "포토카드바인더": "https://link.coupang.com/a/fhfNsxnbCT",
  "다꾸스티커": "https://link.coupang.com/a/fhfOwhp0sC",
  "무선이어버드": "https://link.coupang.com/a/fhfPApXjuC",
  "학생백팩": "https://link.coupang.com/a/fhfQLzypNI",
  "립틴트": "https://link.coupang.com/a/fhfRQyBvTE",
  "레티놀세럼": "https://link.coupang.com/a/fhfSTTbp2i",
  "빔프로젝터": "https://link.coupang.com/a/fhfTXT44ke",
  "무선충전패드": "https://link.coupang.com/a/fhfU647dNA",
  "LED무드등": "https://link.coupang.com/a/fhfV94GOjs",
  "유아물티슈": "https://link.coupang.com/a/fhfXdFJrZQ",
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
