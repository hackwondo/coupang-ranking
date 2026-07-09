/**
 * 쿠팡 파트너스 어필리에이트 링크 엔진
 * ======================================
 * 쿠팡 파트너스 가입 후 PARTNER_ID를 교체하세요.
 * https://partners.coupang.com/
 *
 * 수익 구조:
 *  - 사용자가 어필리에이트 링크 클릭 → 쿠팡 이동
 *  - 24시간 내 구매 시 → 구매금액의 3% 커미션
 *  - 쿠팡 파트너스 대시보드에서 수익 확인
 */

// ⚠️ 여기에 본인의 쿠팡 파트너스 ID를 입력하세요
const PARTNER_ID = "AF0000000";

/**
 * 상품 URL → 어필리에이트 링크 변환
 * @param {string} productUrl - 쿠팡 상품 URL 또는 검색 URL
 * @param {string} tag - 추적용 태그 (어떤 탭/섹션에서 클릭했는지)
 */
export function makeAffiliateLink(productUrl, tag = "general") {
  const encoded = encodeURIComponent(productUrl);
  return `https://link.coupang.com/re/AFSDP?lptag=${PARTNER_ID}&subid=coupangranking_${tag}&pageKey=${encoded}`;
}

/**
 * 키워드 → 쿠팡 검색 어필리에이트 링크
 * @param {string} keyword - 검색어
 * @param {string} tag - 추적용 태그
 */
export function makeSearchLink(keyword, tag = "search") {
  const searchUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;
  return makeAffiliateLink(searchUrl, tag);
}

/**
 * 클릭 추적 (Google Analytics 4)
 * GA4 설정 후 자동으로 이벤트가 전송됩니다.
 */
export function trackClick(category, label) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "affiliate_click", {
      event_category: category,
      event_label: label,
    });
  }
}
