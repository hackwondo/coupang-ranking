import affiliateLinks from "../data/affiliate_links.json";

const DEFAULT_LINK = "https://link.coupang.com/a/fhbVQhahoq";

function findBestLink(text) {
  if (!text) return null;
  for (const [keyword, link] of Object.entries(affiliateLinks)) {
    if (keyword !== "_default" && text.includes(keyword)) {
      return link;
    }
  }
  return null;
}

export function makeAffiliateLink(productUrl, tag) {
  return findBestLink(tag) || findBestLink(decodeURIComponent(productUrl || "")) || DEFAULT_LINK;
}

export function makeSearchLink(keyword) {
  return findBestLink(keyword) || DEFAULT_LINK;
}

export function trackClick(category, label) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "affiliate_click", { event_category: category, event_label: label });
  }
}