import { useState } from "react";
import Head from "next/head";
import fs from "fs";
import path from "path";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell,
} from "recharts";
import { makeAffiliateLink, makeSearchLink, trackClick } from "../lib/affiliate";

/* ═══════════════════════════════════════════════════
 *  마켓퀀트 (MarketQuant) 메인 페이지
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

// 월별 수요 사이클 차트 데이터는 products.json에서 로딩 (네이버 데이터랩 실제 데이터)

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

function SeasonTab({ seasons, monthlyTrends }) {
  const keys = Object.keys(seasons);
  const [sel, setSel] = useState(keys[1] || keys[0]);
  const chartData = monthlyTrends || [];
  const chartKeys = chartData.length > 0 ? Object.keys(chartData[0]).filter(k => k !== "m") : [];
  const COLORS = ["#E03131", "#1971C2", "#2B8A3E", "#0C8599", "#7048E8"];
  return (
    <>
      <Insight title="계절별 히트상품 패턴">
        네이버 검색 트렌드 2년치 데이터 기반. 점수가 높을수록 해당 시즌 필수 아이템입니다.
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
        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>월별 수요 사이클 (네이버 검색 트렌드 실제 데이터)</div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
            <XAxis dataKey="m" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {chartKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 2 }} />
            ))}
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

// ─── 가격대 분석 탭 ───────────────────────────────

function PriceTab({ priceAnalysis }) {
  const COLORS = ["#339AF0","#51CF66","#FCC419","#FF922B","#FF6B6B","#CC5DE8"];
  const chartData = priceAnalysis.map(d => ({ name: d.range, 판매량: d.avgSales, 경쟁강도: Math.round(d.competition * 5000) }));

  return (
    <>
      <Insight title="가격대별 골든존 분석">
        판매량은 높으면서 경쟁은 적당한 가격 구간을 찾아냅니다. 1~3만원대가 충동구매와 마진을 동시에 잡는 스윗스팟입니다.
      </Insight>
      <div style={{ background: C.card, borderRadius: "10px", padding: "16px", border: `1px solid ${C.border}`, marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>판매량 vs 경쟁강도</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, n) => n === "경쟁강도" ? (v / 5000).toFixed(1) + "점" : v.toLocaleString() + "건"} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="판매량" fill="#339AF0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="경쟁강도" fill="#FF922B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
        {priceAnalysis.map((d, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "16px", borderLeft: `5px solid ${COLORS[i]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>{d.range}</div>
              <span style={{ background: COLORS[i] + "18", color: COLORS[i], padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: 700 }}>마진 {d.margin}</span>
            </div>
            <div style={{ fontSize: "12px", color: C.sub, marginTop: "10px", lineHeight: 1.7 }}>
              <div>📦 월 평균 판매: <b style={{ color: C.text }}>{d.avgSales.toLocaleString()}건</b></div>
              <div>⚔️ 경쟁 강도: <b>{d.competition}/10</b></div>
              <div>🏆 대표 히트상품: <b>{d.topItem}</b></div>
              <div>📂 강세 카테고리: {d.bestCategory}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── 베스트&랭킹 탭 ──────────────────────────────

function BestTab({ bestSellers, sellerRankings }) {
  const [period, setPeriod] = useState("weekly");
  const [view, setView] = useState("products");
  const items = bestSellers[period] || [];

  return (
    <>
      <Insight title="베스트셀러 & 판매자 랭킹">
        쿠팡에서 가장 많이 팔린 상품과 매출 TOP 판매자입니다. 베스트셀러를 직접 팔기보다, 해당 상품의 보완재나 액세서리를 노리세요.
      </Insight>
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {[{ k: "weekly", l: "주간" }, { k: "monthly", l: "월간" }].map(p => (
            <button key={p.k} onClick={() => setPeriod(p.k)} style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              background: period === p.k ? C.text : "#F1F3F5", color: period === p.k ? "#FFF" : C.sub, border: "none",
            }}>{p.l}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
          {[{ k: "products", l: "🛍️ 상품" }, { k: "sellers", l: "🏪 판매자" }].map(v => (
            <button key={v.k} onClick={() => setView(v.k)} style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              background: view === v.k ? C.primary : "#F1F3F5", color: view === v.k ? "#FFF" : C.sub, border: "none",
            }}>{v.l}</button>
          ))}
        </div>
      </div>

      {view === "products" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "10px" }}>
          {items.map((item, i) => {
            const link = makeAffiliateLink(item.url || "", "best");
            return (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "24px" }}>{item.img}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{item.rank}. {item.name}</div>
                    <div style={{ fontSize: "11px", color: C.sub }}>판매자: {item.seller}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: C.green }}>{item.change}</div>
                    <div style={{ fontSize: "11px", color: C.sub }}>⭐ {item.reviews}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: "11px", color: C.sub }}>{period === "weekly" ? "주간" : "월간"} {item.sales.toLocaleString()}건</span>
                  <a href={link} target="_blank" rel="noopener noreferrer nofollow" onClick={() => trackClick("best", item.name)}
                    style={{ background: C.primary, color: "#FFF", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "6px", textDecoration: "none" }}
                  >쿠팡에서 보기 →</a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          {sellerRankings.map((s, i) => (
            <div key={i} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px", marginBottom: "8px",
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px",
            }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: i < 3 ? "#FFF3BF" : "#F1F3F5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: 700, color: i < 3 ? "#E67700" : C.sub,
                }}>{s.rank}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{s.name}</div>
                  <div style={{ fontSize: "11px", color: C.sub }}>{s.category} · 상품 {s.products.toLocaleString()}개</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ background: "#D3F9D8", color: C.green, padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 600 }}>{s.badge}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>{s.monthlySales}</div>
                  <div style={{ fontSize: "11px", color: C.sub }}>⭐ {s.rating}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── 해외소싱 탭 ──────────────────────────────────

function GlobalTab({ globalSourcing }) {
  const countries = Object.keys(globalSourcing);
  const [sel, setSel] = useState(countries[0]);
  const items = globalSourcing[sel] || [];

  return (
    <>
      <Insight title="해외소싱 핫 아이템 — 국가별 가이드">
        중국은 마진이 높지만 품질 검수 필수. 일본은 품질 안정적이나 마진 낮음. 미국은 건강식품/프리미엄에 강합니다.
        소싱 스코어 85점 이상이 추천 아이템입니다.
      </Insight>
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
        {countries.map(c => (
          <button key={c} onClick={() => setSel(c)} style={{
            padding: "7px 16px", borderRadius: "18px", fontSize: "13px", cursor: "pointer",
            fontWeight: sel === c ? 700 : 500,
            background: sel === c ? "#D3F9D8" : C.card,
            color: sel === c ? C.green : C.sub,
            border: sel === c ? `2px solid ${C.green}` : `1px solid ${C.border}`,
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "10px" }}>
        {items.map((item, i) => {
          const sc = item.score >= 85 ? C.green : item.score >= 75 ? C.blue : C.sub;
          const link = makeSearchLink(item.name, "global");
          return (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "24px" }}>{item.img}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{item.rank}. {item.name}</div>
                  <div style={{ fontSize: "12px", color: C.sub, marginTop: "2px" }}>{item.cat}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: sc }}>{item.score}</div>
                  <div style={{ fontSize: "11px", color: C.green, fontWeight: 600 }}>{item.margin}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", paddingTop: "8px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "11px", color: C.sub }}>
                  📦 {item.delivery} · ⚠️ 위험도 <b style={{ color: item.risk === "높음" ? C.red : item.risk === "중간" ? "#E67700" : C.green }}>{item.risk}</b>
                </div>
                <a href={link} target="_blank" rel="noopener noreferrer nofollow" onClick={() => trackClick("global", item.name)}
                  style={{ background: C.primary, color: "#FFF", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "6px", textDecoration: "none" }}
                >쿠팡에서 보기 →</a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── 메인 페이지 ──────────────────────────────────

const TABS = [
  { id: "trend", label: "트렌드", icon: "🔥" },
  { id: "season", label: "계절성", icon: "🌸" },
  { id: "age", label: "연령대", icon: "👤" },
  { id: "price", label: "가격대", icon: "💰" },
  { id: "best", label: "베스트&랭킹", icon: "🏆" },
  { id: "global", label: "해외소싱", icon: "🌏" },
  { id: "blue", label: "블루오션", icon: "🔵" },
];

export default function Home({ data }) {
  const [tab, setTab] = useState("trend");

  return (
    <>
      <Head>
        <title>마켓퀀트 — 퀀트 분석으로 읽는 이커머스 트렌드</title>
        <meta name="description" content="계절별·연령대별·키워드별 인기 상품을 퀀트 분석으로 보여드립니다. 뭘 사야 하지? 뭘 팔아야 하지? 데이터가 답합니다." />
        <meta property="og:title" content="마켓퀀트 MarketQuant — 이커머스 퀀트 분석" />
        <meta property="og:description" content="데이터 기반 이커머스 트렌드 분석. 계절성, 연령대, 가격대, 블루오션까지." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* 헤더 */}
      <header style={{ background: "linear-gradient(135deg, #1A1B1E, #25262B)", padding: "20px 16px 14px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#FFF", letterSpacing: "-0.5px" }}>
              <span style={{ color: "#339AF0" }}>Market</span><span style={{ color: "#FD7E14" }}>Quant</span>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#868E96", marginLeft: "8px" }}>마켓퀀트</span>
            </h1>
            <p style={{ fontSize: "12px", color: "#868E96", marginTop: "2px" }}>
              퀀트 분석으로 읽는 이커머스 트렌드 — 뭘 사야 하지? 뭘 팔아야 하지?
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
        {tab === "season" && <SeasonTab seasons={data.seasons} monthlyTrends={data.monthlyTrends} />}
        {tab === "age" && <AgeTab ageGroups={data.ageGroups} />}
        {tab === "price" && <PriceTab priceAnalysis={data.priceAnalysis} />}
        {tab === "best" && <BestTab bestSellers={data.bestSellers} sellerRankings={data.sellerRankings} />}
        {tab === "global" && <GlobalTab globalSourcing={data.globalSourcing} />}
        {tab === "blue" && <BlueOceanTab blueOcean={data.blueOcean} />}
      </main>

      {/* 푸터 — 쿠팡 파트너스 문구 필수 */}
      <footer style={{ background: "#1A1B1E", color: "#868E96", padding: "20px 16px", textAlign: "center", fontSize: "11px", lineHeight: 1.8, marginTop: "30px" }}>
        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}><span style={{ color: "#339AF0" }}>Market</span><span style={{ color: "#FD7E14" }}>Quant</span></div>
        <p>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
        <p>© 2026 마켓퀀트 · 퀀트 분석 기반 이커머스 트렌드</p>
      </footer>
    </>
  );
}
