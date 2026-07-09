import { useState } from "react";
import Head from "next/head";
import fs from "fs";
import path from "path";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { makeAffiliateLink, makeSearchLink, trackClick } from "../lib/affiliate";

/* ═══════════════════════════════════════════════════
 *  쿠팡랭킹 메인 페이지
 *  - getStaticProps로 빌드 시 JSON 데이터 로딩 (SSG)
 *  - 모든 상품 링크에 어필리에이트 자동 적용
 * ═══════════════════════════════════════════════════ */

// ─── SSG: 빌드 시 데이터 로딩 ──────────────────────
export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "data", "products.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  return { props: { data } };
}

// ─── 스타일 상수 ──────────────────────────────────
const C = {
  bg: "#F8F9FA", card: "#FFF", border: "#E9ECEF",
  text: "#212529", sub: "#6C757D",
  primary: "#E8590C", primaryBg: "#FFF4E6",
  blue: "#1971C2", green: "#2B8A3E", red: "#C92A2A",
  purple: "#7048E8",
};

const CHART_DATA = [
  { m: "1월", 핫팩: 92, 선풍기: 5, 캠핑: 15, 수영복: 2 },
  { m: "2월", 핫팩: 78, 선풍기: 8, 캠핑: 22, 수영복: 5 },
  { m: "3월", 핫팩: 25, 선풍기: 18, 캠핑: 45, 수영복: 12 },
  { m: "4월", 핫팩: 8, 선풍기: 32, 캠핑: 72, 수영복: 28 },
  { m: "5월", 핫팩: 3, 선풍기: 55, 캠핑: 88, 수영복: 48 },
  { m: "6월", 핫팩: 2, 선풍기: 85, 캠핑: 82, 수영복: 78 },
  { m: "7월", 핫팩: 1, 선풍기: 98, 캠핑: 75, 수영복: 95 },
  { m: "8월", 핫팩: 2, 선풍기: 88, 캠핑: 70, 수영복: 82 },
  { m: "9월", 핫팩: 8, 선풍기: 42, 캠핑: 55, 수영복: 25 },
  { m: "10월", 핫팩: 35, 선풍기: 12, 캠핑: 35, 수영복: 8 },
  { m: "11월", 핫팩: 72, 선풍기: 5, 캠핑: 18, 수영복: 3 },
  { m: "12월", 핫팩: 95, 선풍기: 3, 캠핑: 10, 수영복: 2 },
];

// ─── 공통 컴포넌트 ────────────────────────────────

function Insight({ title, children }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1A1B1E, #25262B)",
      color: "#CED4DA", padding: "16px 18px", borderRadius: "10px",
      borderLeft: `5px solid ${C.primary}`, marginBottom: "16px",
      fontSize: "13px", lineHeight: 1.7,
    }}>
      <div style={{ fontSize: "15px", fontWeight: 700, color: "#FD7E14", marginBottom: "6px" }}>{title}</div>
      {children}
    </div>
  );
}

function ProductCard({ item, type }) {
  const link = makeAffiliateLink(item.url || "", item.cat);
  const sc = (item.score || 0) >= 90 ? C.green : (item.score || 0) >= 80 ? C.blue : C.primary;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <span style={{ fontSize: "24px", lineHeight: 1 }}>{item.img}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{item.rank}. {item.name}</div>
          <div style={{ fontSize: "12px", color: C.sub, marginTop: "2px" }}>
            {item.cat} · <b style={{ color: C.text }}>{item.price}원</b>
          </div>
        </div>
        {type === "season" && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: sc }}>{item.score}</div>
            <div style={{ fontSize: "11px", color: C.green, fontWeight: 600 }}>{item.growth}</div>
          </div>
        )}
        {type === "age" && (
          <span style={{
            fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "10px",
            background: item.trend === "급상승" ? "#FFE3E3" : item.trend === "상승" ? "#D3F9D8" : "#E7F5FF",
            color: item.trend === "급상승" ? C.red : item.trend === "상승" ? C.green : C.blue,
          }}>{item.trend}</span>
        )}
        {type === "blue" && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: sc }}>{item.score}</div>
            <div style={{ fontSize: "11px", color: C.sub }}>{item.opp}</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "11px", color: C.sub }}>
          {item.reviews && <>리뷰 {item.reviews.toLocaleString()} · 추정 월 {(item.reviews * 40).toLocaleString()}건</>}
          {type === "blue" && <>검색 {(item.demand||0).toLocaleString()} · 판매자 <b style={{ color: (item.sellers||0) < 20 ? C.red : C.text }}>{item.sellers}명</b></>}
        </div>
        <a
          href={link} target="_blank" rel="noopener noreferrer nofollow"
          onClick={() => trackClick(type, item.name)}
          style={{
            background: C.primary, color: "#FFF", fontSize: "12px", fontWeight: 600,
            padding: "5px 12px", borderRadius: "6px", textDecoration: "none", whiteSpace: "nowrap",
          }}
        >쿠팡에서 보기 →</a>
      </div>
    </div>
  );
}

function TrendCard({ item, idx }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>{idx + 1}. {item.keyword}</div>
          <div style={{ fontSize: "11px", color: C.sub, marginTop: "2px" }}>{item.cat} · 월 {item.vol.toLocaleString()}회</div>
        </div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: C.red }}>{item.change}</div>
      </div>
      <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {item.tags.map((tag, j) => (
          <a key={j} href={makeSearchLink(tag, "trend_tag")} target="_blank" rel="noopener noreferrer nofollow"
            onClick={() => trackClick("trend_tag", tag)}
            style={{
              background: C.primaryBg, color: C.primary, fontSize: "11px", fontWeight: 500,
              padding: "3px 10px", borderRadius: "12px", border: "1px solid #FFD8A8", textDecoration: "none",
            }}
          >#{tag}</a>
        ))}
      </div>
      <div style={{ marginTop: "8px", textAlign: "right" }}>
        <a href={makeSearchLink(item.keyword, "trend_main")} target="_blank" rel="noopener noreferrer nofollow"
          onClick={() => trackClick("trend_main", item.keyword)}
          style={{ fontSize: "12px", color: C.primary, fontWeight: 600, textDecoration: "none" }}
        >쿠팡에서 검색 →</a>
      </div>
    </div>
  );
}

// ─── 탭별 콘텐츠 ──────────────────────────────────

function TrendTab({ trending }) {
  return (
    <>
      <Insight title="실시간 급상승 키워드">
        검색량이 폭발 중인 키워드입니다. 태그를 클릭하면 쿠팡에서 바로 확인하세요.
        셀러라면 이 키워드 상품을 2~3주 전에 선점하세요.
      </Insight>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
        {trending.map((t, i) => <TrendCard key={i} item={t} idx={i} />)}
      </div>
    </>
  );
}

function SeasonTab({ seasons }) {
  const keys = Object.keys(seasons);
  const [sel, setSel] = useState(keys[1] || keys[0]);
  return (
    <>
      <Insight title="계절별 히트상품 패턴">
        과거 3년 판매 데이터 기반. 점수가 높을수록 해당 시즌 필수 아이템입니다.
      </Insight>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
        {keys.map(s => (
          <button key={s} onClick={() => setSel(s)} style={{
            padding: "7px 16px", borderRadius: "18px", fontSize: "13px", cursor: "pointer",
            fontWeight: sel === s ? 700 : 500,
            background: sel === s ? C.primaryBg : C.card,
            color: sel === s ? C.primary : C.sub,
            border: sel === s ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
          }}>{s}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
        {(seasons[sel] || []).map(item => <ProductCard key={item.rank} item={item} type="season" />)}
      </div>
      <div style={{ background: C.card, borderRadius: "10px", padding: "16px", marginTop: "20px", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>월별 수요 사이클</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={CHART_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
            <XAxis dataKey="m" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="핫팩" stroke="#E03131" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="선풍기" stroke="#1971C2" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="캠핑" stroke="#2B8A3E" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="수영복" stroke="#0C8599" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function AgeTab({ ageGroups }) {
  const keys = Object.keys(ageGroups);
  const [sel, setSel] = useState("20대");
  return (
    <>
      <Insight title="연령대별 인기 상품">
        최근 30일 구매 데이터 기반. 타겟 고객층에 맞춰 쇼핑하거나 소싱하세요.
      </Insight>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
        {keys.map(a => (
          <button key={a} onClick={() => setSel(a)} style={{
            padding: "7px 16px", borderRadius: "18px", fontSize: "13px", cursor: "pointer",
            fontWeight: sel === a ? 700 : 500,
            background: sel === a ? "#F3F0FF" : C.card,
            color: sel === a ? C.purple : C.sub,
            border: sel === a ? `2px solid ${C.purple}` : `1px solid ${C.border}`,
          }}>{a}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
        {(ageGroups[sel] || []).map(item => <ProductCard key={item.rank} item={item} type="age" />)}
      </div>
    </>
  );
}

function BlueOceanTab({ blueOcean }) {
  return (
    <>
      <Insight title="블루오션 발굴기 — 수요↑ 경쟁↓">
        검색량 대비 판매자가 적은 상품을 자동 발굴합니다. 20명 미만이면 지금 진입 기회!
      </Insight>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
        {blueOcean.map(item => <ProductCard key={item.rank} item={item} type="blue" />)}
      </div>
    </>
  );
}

// ─── 메인 페이지 ──────────────────────────────────

const TABS = [
  { id: "trend", label: "트렌드", icon: "🔥" },
  { id: "season", label: "계절성", icon: "🌸" },
  { id: "age", label: "연령대", icon: "👤" },
  { id: "blue", label: "블루오션", icon: "🔵" },
];

export default function Home({ data }) {
  const [tab, setTab] = useState("trend");

  return (
    <>
      <Head>
        <title>쿠팡랭킹 — 데이터 기반 쿠팡 트렌드 분석</title>
        <meta name="description" content="계절별·연령대별·키워드별 쿠팡 인기 상품 분석. 뭘 사야 하지? 뭘 팔아야 하지? 데이터가 답합니다." />
        <meta property="og:title" content="쿠팡랭킹 — 데이터 기반 쿠팡 트렌드 분석" />
        <meta property="og:description" content="계절별·연령대별 쿠팡 인기 상품을 퀀트 분석으로 보여드립니다." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* 헤더 */}
      <header style={{ background: "linear-gradient(135deg, #1A1B1E, #25262B)", padding: "20px 16px 14px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#FFF", letterSpacing: "-0.5px" }}>
              <span style={{ color: "#FD7E14" }}>쿠팡</span>랭킹
            </h1>
            <p style={{ fontSize: "12px", color: "#868E96", marginTop: "2px" }}>
              데이터 기반 쿠팡 트렌드 분석 — 뭘 사야 하지? 뭘 팔아야 하지?
            </p>
          </div>
          <span style={{ fontSize: "11px", color: "#868E96", background: "rgba(255,255,255,0.06)", padding: "5px 12px", borderRadius: "14px" }}>
            {data.updated} 업데이트
          </span>
        </div>
      </header>

      {/* 탭 */}
      <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "12px 20px", fontSize: "13px", cursor: "pointer",
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? C.primary : C.sub,
              borderBottom: tab === t.id ? `3px solid ${C.primary}` : "3px solid transparent",
              background: "none", border: "none", whiteSpace: "nowrap",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </nav>

      {/* 콘텐츠 */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px" }}>
        {tab === "trend" && <TrendTab trending={data.trending} />}
        {tab === "season" && <SeasonTab seasons={data.seasons} />}
        {tab === "age" && <AgeTab ageGroups={data.ageGroups} />}
        {tab === "blue" && <BlueOceanTab blueOcean={data.blueOcean} />}
      </main>

      {/* 푸터 — 쿠팡 파트너스 문구 필수 */}
      <footer style={{ background: "#1A1B1E", color: "#868E96", padding: "20px 16px", textAlign: "center", fontSize: "11px", lineHeight: 1.8, marginTop: "30px" }}>
        <div style={{ color: "#FD7E14", fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>쿠팡랭킹</div>
        <p>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
        <p>© 2026 쿠팡랭킹 · 데이터 기반 쇼핑 트렌드 분석</p>
      </footer>
    </>
  );
}
