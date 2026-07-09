/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 사이트 생성 (Vercel에서 자동 최적화)
  output: "export",
  // 이미지 최적화 (정적 배포용)
  images: { unoptimized: true },
  // trailing slash (SEO)
  trailingSlash: true,
};

module.exports = nextConfig;
