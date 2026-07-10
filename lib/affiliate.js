/**
 * 쿠팡 파트너스 어필리에이트 링크 엔진
 * 파트너 ID: AF8183915
 */

const PARTNER_ID = "AF8183915";

export function makeAffiliateLink(productUrl, tag = "general") {
  const sep = productUrl.includes('?') ? '&' : '?';
  return `${productUrl}${sep}lptag=${PARTNER_ID}&subid=marketquant_${tag}`;
}

export function makeSearchLink(keyword, tag = "search") {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}&lptag=${PARTNER_ID}&subid=marketquant_${tag}`;
}

export function trackClick(category, label) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "affiliate_click", {
      event_category: category, event_label: label,
    });
  }
}