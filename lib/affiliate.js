/**
 * 쿠팡 파트너스 어필리에이트 링크 엔진
 * 파트너 ID: AF8183915
 * 
 * 키워드 매칭 → 파트너스 링크
 * 매칭 안 되면 → 쿠팡 검색 링크 (수수료 없음)
 */

import affiliateLinks from "../data/affiliate_links.json";

function findBestLink(text) {
  // 상품명이나 카테고리에서 매칭되는 키워드 찾기
  for (const [keyword, link] of Object.entries(affiliateLinks)) {
    if (text && text.includes(keyword)) {
      return link;
    }
  }
  return null;
}

export function makeAffiliateLink(productUrl, tag = "general") {
  // 1순위: 태그(카테고리)에서 매칭
  const tagMatch = findBestLink(tag);
  if (tagMatch) return tagMatch;

  // 2순위: 상품 URL에서 키워드 추출하여 매칭
  if (productUrl) {
    const decoded = decodeURIComponent(productUrl);
    const urlMatch = findBestLink(decoded);
    if (urlMatch) return urlMatch;
  }

  // 3순위: 매칭 안 되면 일반 쿠팡 검색 링크
  const searchQuery = tag !== "general" ? tag : "추천상품";
  return "https://www.coupang.com/np/search?q=" + encodeURIComponent(searchQuery);
}

export function makeSearchLink(keyword, tag = "search") {
  // 키워드로 매칭
  const match = findBestLink(keyword);
  if (match) return match;

  // 매칭 안 되면 일반 검색 링크
  return "https://www.coupang.com/np/search?q=" + encodeURIComponent(keyword);
}

export function trackClick(category, label) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "affiliate_click", {
      event_category: category,
      event_label: label,
    });
  }
}
