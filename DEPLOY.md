# 🚀 쿠팡랭킹 배포 가이드

## 1단계: 로컬 테스트 (5분)

```bash
# 압축 해제
tar xzf coupang-ranking-web.tar.gz
cd coupang-ranking-web

# 패키지 설치
npm install

# 로컬 실행
npm run dev
# → http://localhost:3000 에서 확인
```

## 2단계: GitHub 레포 생성 (2분)

```bash
# Git 초기화 & push
git init
git add .
git commit -m "🛒 쿠팡랭킹 초기 커밋"

# GitHub에서 새 레포 생성 후:
git remote add origin https://github.com/hackwondo/coupang-ranking.git
git push -u origin main
```

## 3단계: Vercel 배포 (3분)

1. **https://vercel.com** 접속 → GitHub 계정으로 로그인
2. **"Add New Project"** 클릭
3. **"Import Git Repository"** → `coupang-ranking` 레포 선택
4. **Framework Preset**: `Next.js` (자동 감지됨)
5. **"Deploy"** 클릭 → 1~2분 후 배포 완료!

배포 완료 시 URL:
- 기본: `https://coupang-ranking.vercel.app`
- 커스텀 도메인 연결: Vercel 대시보드 → Settings → Domains

## 4단계: 필수 설정

### 쿠팡 파트너스 설정
1. https://partners.coupang.com/ 가입
2. 승인 후 파트너 ID 발급
3. `lib/affiliate.js` 에서 `PARTNER_ID` 교체:
   ```js
   const PARTNER_ID = "AF본인ID";
   ```

### Google Analytics 4 설정
1. https://analytics.google.com/ 에서 속성 생성
2. 측정 ID (G-XXXXXXXXXX) 복사
3. `pages/_app.js` 에서 `GA_ID` 교체:
   ```js
   const GA_ID = "G-본인ID";
   ```

### 네이버 데이터랩 API (선택)
1. https://developers.naver.com/ 에서 앱 등록
2. "데이터랩" API 선택
3. Vercel 대시보드 → Settings → Environment Variables:
   - `NAVER_CLIENT_ID` = 발급받은 ID
   - `NAVER_CLIENT_SECRET` = 발급받은 Secret

## 5단계: 데이터 자동 업데이트

### 방법 A: EC2 crontab (이미 EC2가 있으므로 추천)

```bash
# EC2에서 크롤링 후 data/products.json을 GitHub에 push
# → Vercel이 자동 재배포

# crontab 설정 (매일 새벽 3시)
crontab -e

# 추가:
0 3 * * * cd /home/ubuntu/coupang-ranking && \
  python pipeline.py --full && \
  python export_json.py && \
  cd /home/ubuntu/coupang-ranking-web && \
  cp /home/ubuntu/coupang-ranking/data/products.json data/ && \
  git add data/products.json && \
  git commit -m "📊 $(date +'%Y-%m-%d')" && \
  git push
```

### 방법 B: GitHub Actions (EC2 없이)

`.github/workflows/update-data.yml`이 매일 KST 03시에 자동 실행됩니다.
GitHub Secrets에 네이버 API 키를 등록하세요.

## 커스텀 도메인 연결 (선택)

1. 도메인 구매 (가비아, 호스팅KR 등에서 .kr 도메인 연 1~2만원)
2. Vercel 대시보드 → Settings → Domains → 도메인 입력
3. DNS 설정:
   - CNAME: `cname.vercel-dns.com`
   - 또는 A: `76.76.21.21`
4. 10분 내 SSL 자동 설정 완료

추천 도메인: `coupangranking.kr` / `쿠팡랭킹.kr`

## 구조 요약

```
coupang-ranking-web/          ← Vercel 배포 (프론트엔드)
├── pages/index.js            ← 메인 대시보드 (SSG)
├── lib/affiliate.js          ← 어필리에이트 링크 엔진
├── data/products.json        ← EC2에서 매일 업데이트
└── next.config.js            ← 정적 사이트 생성 설정

coupang-ranking/              ← EC2 (백엔드 크롤링)
├── scrapers/coupang_scraper.py
├── scrapers/naver_datalab.py
├── database.py
└── pipeline.py
```
