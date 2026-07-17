import { useState } from "react";
import Head from "next/head";
import fs from "fs";
import path from "path";

export async function getStaticProps() {
  const stratPath = path.join(process.cwd(), "data", "strategies.json");
  const strategies = JSON.parse(fs.readFileSync(stratPath, "utf-8"));

  const ppPath = path.join(process.cwd(), "data", "papers.json");
  let papers = [];
  try {
    papers = JSON.parse(fs.readFileSync(ppPath, "utf-8"));
  } catch (e) {}

  return { props: { data: { ...strategies, papers } } };
}

// ─── 스타일 (기존 톤 유지) ──────────────
const C = {
  bg: "#F8F9FA", card: "#FFF", border: "#E9ECEF",
  text: "#212529", sub: "#6C757D", muted: "#ADB5BD",
  primary: "#E8590C", primaryBg: "#FFF4E6",
  blue: "#1971C2", green: "#2B8A3E", red: "#C92A2A",
  purple: "#7048E8", teal: "#0C8599",
};
const F = { body: "15px", card: "15px", h2: "20px", h3: "17px", small: "13px", tag: "12px" };

// ─── 공통: 학술 근거 박스 (기존 그대로 재사용) ────────────
function Insight({ title, children, refs }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,#1A1B1E,#25262B)", color: "#CED4DA",
      padding: "18px 20px", borderRadius: "12px", borderLeft: `5px solid ${C.primary}`,
      marginBottom: "18px", fontSize: F.body, lineHeight: 1.8,
    }}>
      <div style={{ fontSize: F.h3, fontWeight: 600, color: "#FD7E14", marginBottom: "8px" }}>{title}</div>
      <div>{children}</div>
      {refs && <div style={{
        marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #333",
        fontSize: F.tag, color: "#868E96",
      }}>📚 {refs}</div>}
    </div>
  );
}

// ─── 신규: 종목 카드 (ProductCard 대체) ────────────
// 쿠팡 상품카드 자리를 대체. 링크/구매 버튼 없음 — 정보 제공용.
function StockCard({ item }) {
  const positive = (item.changePct || 0) >= 0;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: F.card, fontWeight: 600, color: C.text }}>{item.rank}. {item.name}</div>
          <div style={{ fontSize: F.small, color: C.sub, marginTop: "3px" }}>
            {item.sector} · {item.market}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: C.blue }}>{item.score}</div>
          <div style={{ fontSize: F.tag, color: positive ? C.green : C.red, fontWeight: 600 }}>
            {positive ? "+" : ""}{item.changePct}%
          </div>
        </div>
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: "12px", paddingTop: "10px", borderTop: `1px solid ${C.border}`,
        fontSize: F.small, color: C.sub,
      }}>
        <span>현재가 {(item.currentPrice || 0).toLocaleString()}원</span>
        {item.signalDate && <span>📅 신호일 {item.signalDate}</span>}
      </div>
      {item.note && (
        <div style={{ fontSize: F.tag, color: C.purple, marginTop: "8px" }}>💡 {item.note}</div>
      )}
    </div>
  );
}

function StockGrid({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "12px" }}>
      {(items || []).map((item, i) => <StockCard key={item.ticker || i} item={item} />)}
    </div>
  );
}

// ─── 탭 1: 학술퀀트 (quant-endgame 5대 전략) ────────────
function AcademicQuantTab({ strategies }) {
  const list = strategies || [];
  const [sel, setSel] = useState(0);
  const s = list[sel];
  if (!s) return <div style={{ color: C.sub }}>전략 데이터를 준비 중입니다.</div>;

  return (<>
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
      {list.map((strat, i) => (
        <button key={strat.strategyId} onClick={() => setSel(i)} style={{
          padding: "8px 18px", borderRadius: "20px", fontSize: F.small, cursor: "pointer",
          fontWeight: sel === i ? 700 : 500,
          background: sel === i ? C.primaryBg : C.card, color: sel === i ? C.primary : C.sub,
          border: sel === i ? `2px solid ${C.primary}` : `1px solid ${C.border}`,
        }}>{strat.title}</button>
      ))}
    </div>

    <Insight title={`📜 ${s.paperTitle}`} refs={`${s.paperAuthors} · ${s.journal}`}>
      <span style={{ color: "#FACC15", fontWeight: 600 }}>💡 핵심 원리</span><br />
      {s.principle}
      <br /><br />
      <span style={{ color: "#FACC15", fontWeight: 600 }}>⚙️ 스크리닝 알고리즘</span><br />
      {s.algorithm}
      <br /><br />
      <span style={{ color: "#FACC15", fontWeight: 600 }}>🎯 활용 가이드</span><br />
      {s.guide}
    </Insight>

    <StockGrid items={s.stocks} />
  </>);
}

// ─── 탭 2: 차트패턴 (컵앤핸들, 박스권 돌파 등) ────────────
function ChartPatternTab({ patterns }) {
  const list = patterns || [];
  const [sel, setSel] = useState(0);
  const p = list[sel];
  if (!p) return <div style={{ color: C.sub }}>패턴 데이터를 준비 중입니다.</div>;

  return (<>
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
      {list.map((pattern, i) => (
        <button key={pattern.patternId} onClick={() => setSel(i)} style={{
          padding: "8px 18px", borderRadius: "20px", fontSize: F.small, cursor: "pointer",
          fontWeight: sel === i ? 700 : 500,
          background: sel === i ? "#F3F0FF" : C.card, color: sel === i ? C.purple : C.sub,
          border: sel === i ? `2px solid ${C.purple}` : `1px solid ${C.border}`,
        }}>{pattern.title}</button>
      ))}
    </div>

    <Insight title={`📈 ${p.title}`}>
      <span style={{ color: "#FACC15", fontWeight: 600 }}>💡 패턴 설명</span><br />
      {p.description}
      <br /><br />
      <span style={{ color: "#FACC15", fontWeight: 600 }}>⚙️ 감지 조건</span><br />
      {p.criteria}
    </Insight>

    <StockGrid items={p.stocks} />
  </>);
}

// ─── 탭 3: 레전드 투자자 전략 (버핏/오닐/린치 등) ────────────
function LegendaryInvestorTab({ investors }) {
  const list = investors || [];
  const [sel, setSel] = useState(0);
  const inv = list[sel];
  if (!inv) return <div style={{ color: C.sub }}>투자자 전략 데이터를 준비 중입니다.</div>;

  return (<>
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
      {list.map((investor, i) => (
        <button key={investor.investorId} onClick={() => setSel(i)} style={{
          padding: "8px 18px", borderRadius: "20px", fontSize: F.small, cursor: "pointer",
          fontWeight: sel === i ? 700 : 500,
          background: sel === i ? "#E7F5FF" : C.card, color: sel === i ? C.blue : C.sub,
          border: sel === i ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
        }}>{investor.name}</button>
      ))}
    </div>

    <Insight title={`👑 ${inv.name} — ${inv.strategyName}`}>
      <span style={{ color: "#FACC15", fontWeight: 600 }}>💡 투자 철학</span><br />
      {inv.principle}
      <br /><br />
      <span style={{ color: "#FACC15", fontWeight: 600 }}>⚙️ 스크리닝 기준</span><br />
      {inv.criteria}
    </Insight>

    <StockGrid items={inv.stocks} />
  </>);
}

// ─── 탭 4: 논문 분석 (기존 PapersTab 그대로 재사용) ────────────
function PapersTab({ papers }) {
  const [selected, setSelected] = useState(null);
  const list = papers || [];
  return (<>
    <Insight title="퀀트 학술 논문 분석 — 각 전략의 원 논문 정리"
      refs="본 섹션의 논문들은 peer-reviewed 학술지 또는 워킹페이퍼로 게재된 연구입니다.">
      이 사이트가 사용하는 각 퀀트 전략의 원 논문을 정리했습니다. 논문 제목을 클릭하면 상세 내용을 확인할 수 있습니다.
    </Insight>

    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {list.map((paper, i) => (
        <div key={paper.id || i}
          onClick={() => setSelected(selected === i ? null : i)}
          style={{
            background: C.card, border: selected === i ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
            borderRadius: "12px", padding: "18px", cursor: "pointer",
            borderLeft: `5px solid ${selected === i ? C.blue : C.purple}`,
            transition: "all 0.15s",
          }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: F.card, fontWeight: 700, color: C.text }}>{i + 1}. {paper.title}</div>
              {paper.titleEn && <div style={{ fontSize: F.small, color: C.sub, marginTop: "2px", fontStyle: "italic" }}>{paper.titleEn}</div>}
              <div style={{ fontSize: F.small, color: C.sub, marginTop: "6px" }}>
                {paper.authors} · <span style={{ color: C.blue }}>{paper.journal}</span> · {paper.year}
              </div>
            </div>
            <span style={{ fontSize: "20px", color: C.sub, flexShrink: 0, marginLeft: "12px" }}>
              {selected === i ? "▲" : "▼"}
            </span>
          </div>
          {paper.tags && paper.tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
              {paper.tags.map((tag, j) => (
                <span key={j} style={{
                  background: "#F3F0FF", color: C.purple, fontSize: F.tag, fontWeight: 500,
                  padding: "3px 10px", borderRadius: "12px",
                }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>

    {selected !== null && list[selected] && (() => {
      const p = list[selected];
      return (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }} onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.card, borderRadius: "16px", padding: "28px",
            maxWidth: "700px", width: "100%", maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: F.h2, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{p.title}</div>
                {p.titleEn && <div style={{ fontSize: F.small, color: C.sub, fontStyle: "italic", marginTop: "4px" }}>{p.titleEn}</div>}
              </div>
              <button onClick={() => setSelected(null)} style={{
                background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: C.sub, padding: "0 4px", flexShrink: 0,
              }}>✕</button>
            </div>
            <div style={{
              fontSize: F.small, color: C.sub, marginBottom: "16px",
              padding: "10px 14px", background: "#F8F9FA", borderRadius: "8px", lineHeight: 1.8,
            }}>
              <div>👤 저자: <b style={{ color: C.text }}>{p.authors}</b></div>
              <div>📖 저널: <b style={{ color: C.blue }}>{p.journal}</b> ({p.year})</div>
              {p.methodology && <div>🔬 방법론: <b>{p.methodology}</b></div>}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: F.card, fontWeight: 600, color: C.text, marginBottom: "8px" }}>Abstract</div>
              <div style={{
                fontSize: F.body, color: C.sub, lineHeight: 1.8,
                padding: "12px 16px", background: "#FFFBF0", borderRadius: "8px", borderLeft: "4px solid #FCC419",
              }}>{p.abstract}</div>
            </div>
            {p.keyFindings && p.keyFindings.length > 0 && (
              <div>
                <div style={{ fontSize: F.card, fontWeight: 600, color: C.text, marginBottom: "8px" }}>주요 발견</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {p.keyFindings.map((finding, j) => (
                    <div key={j} style={{
                      fontSize: F.body, color: C.text, lineHeight: 1.7,
                      padding: "10px 14px", background: "#F0FFF4", borderRadius: "8px", borderLeft: `4px solid ${C.green}`,
                    }}>{finding}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    })()}
  </>);
}

// ─── 메인 ─────────────────────────────────
const TABS = [
  { id: "academic", label: "학술퀀트", icon: "🎯" },
  { id: "chart", label: "차트패턴", icon: "📈" },
  { id: "legend", label: "레전드투자자", icon: "👑" },
  { id: "papers", label: "논문분석", icon: "📚" },
];

export default function Home({ data }) {
  const [tab, setTab] = useState("academic");
  return (<>
    <Head>
      <title>MarketQuant 마켓퀀트 — 학술 논문 기반 퀀트 전략 스크리너</title>
      <meta name="description" content="Jegadeesh(1993), Heston(2008) 등 학술 논문 기반 퀀트 전략, 컵앤핸들/박스권 돌파 등 차트패턴, 버핏·오닐·린치 등 레전드 투자자 전략을 한 곳에서 확인합니다." />
      <meta property="og:title" content="MarketQuant — 학술 퀀트 전략 스크리너" />
      <meta property="og:description" content="데이터와 학술 이론 기반 주식 전략 분석" />
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />
    </Head>

    <header style={{ background: "linear-gradient(135deg,#1A1B1E,#25262B)", padding: "22px 16px 16px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#FFF", letterSpacing: "-0.5px", margin: 0 }}>
            <span style={{ color: "#339AF0" }}>Market</span><span style={{ color: "#FD7E14" }}>Quant</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#868E96", marginLeft: "10px" }}>마켓퀀트</span>
          </h1>
          <p style={{ fontSize: F.small, color: "#868E96", margin: "4px 0 0" }}>
            학술 논문 기반 퀀트 전략, 차트패턴, 레전드 투자자 전략을 한 곳에서
          </p>
        </div>
        <div style={{ fontSize: F.tag, color: "#868E96", background: "rgba(255,255,255,0.06)", padding: "6px 14px", borderRadius: "16px" }}>
          📅 {data.updated || "업데이트 준비 중"}
        </div>
      </div>
    </header>

    <div style={{
      background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B",
      padding: "10px 16px", fontSize: "13px", textAlign: "center",
    }}>
      본 사이트는 투자자문업이 아니며, 매매 시그널을 제공하지 않는 통계 시각화 툴입니다. 모든 투자 판단과 책임은 본인에게 있습니다.
    </div>

    <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "14px 16px", fontSize: F.small, cursor: "pointer", fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? C.primary : C.sub,
            borderBottom: tab === t.id ? `3px solid ${C.primary}` : "3px solid transparent",
            background: "none", border: "none", whiteSpace: "nowrap",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>
    </nav>

    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>
      {tab === "academic" && <AcademicQuantTab strategies={data.academicQuant} />}
      {tab === "chart" && <ChartPatternTab patterns={data.chartPatterns} />}
      {tab === "legend" && <LegendaryInvestorTab investors={data.legendaryInvestors} />}
      {tab === "papers" && <PapersTab papers={data.papers} />}
    </main>

    <footer style={{ background: "#1A1B1E", color: "#868E96", padding: "32px 16px 24px", fontSize: F.tag, lineHeight: 1.9, marginTop: "30px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span style={{ fontWeight: 700, fontSize: "18px" }}><span style={{ color: "#339AF0" }}>Market</span><span style={{ color: "#FD7E14" }}>Quant</span></span>
          <span style={{ color: "#495057", marginLeft: "8px" }}>마켓퀀트</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "16px 18px", marginBottom: "16px", textAlign: "left", color: "#ADB5BD" }}>
          <div style={{ fontWeight: 600, color: "#CED4DA", marginBottom: "8px" }}>분석 방법론 및 데이터 출처</div>
          <p>가격 데이터: KRX 상장 종목 일봉 데이터 (10년치 누적, 매일 갱신)</p>
          <p>학술퀀트 전략: Jegadeesh & Titman(1993) 모멘텀, Heston & Sadka(2008) 계절성 등 peer-reviewed 논문 기반</p>
          <p>차트패턴: 컵앤핸들, 박스권 돌파 등 고전 기술적 분석 패턴을 알고리즘으로 자동 감지</p>
          <p>레전드 투자자 전략: 워런 버핏(가치투자), 윌리엄 오닐(CANSLIM), 피터 린치(GARP) 등 공개된 투자 원칙을 스크리닝 기준으로 정량화</p>
        </div>
        <div style={{ textAlign: "center", marginBottom: "14px", color: "#868E96" }}>
          <p>본 사이트의 데이터는 공개 소스 기반 통계 분석 결과이며, 수집 시기 및 분석 방법에 따라 실제와 차이가 있을 수 있습니다.</p>
          <p>모든 투자 및 매매 결정은 본인의 판단과 책임 하에 이루어져야 하며, 본 사이트는 투자자문업에 해당하지 않습니다.</p>
        </div>
        <div style={{ textAlign: "center", borderTop: "1px solid #2C2E33", paddingTop: "14px", color: "#495057" }}>
          <p>© 2026 MarketQuant(마켓퀀트). All rights reserved.</p>
          <p style={{ marginTop: "8px", color: "#868E96" }}>문의: marketquant.info@gmail.com</p>
        </div>
      </div>
    </footer>
  </>);
}
