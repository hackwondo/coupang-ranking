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