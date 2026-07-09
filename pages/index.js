import { useState } from "react";
import Head from "next/head";
import fs from "fs";
import path from "path";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Cell,
} from "recharts";
import { makeAffiliateLink, makeSearchLink, trackClick } from "../lib/affiliate";

export async function getStaticProps() {
  const fp = path.join(process.cwd(), "data", "products.json");
  const raw = fs.readFileSync(fp, "utf-8");
  return { props: { data: JSON.parse(raw) } };
}

// ─── 스타일 (글씨 크기 키움) ──────────────
const C = {
  bg:"#F8F9FA", card:"#FFF", border:"#E9ECEF",
  text:"#212529", sub:"#6C757D", muted:"#ADB5BD",
  primary:"#E8590C", primaryBg:"#FFF4E6",
  blue:"#1971C2", green:"#2B8A3E", red:"#C92A2A",
  purple:"#7048E8", teal:"#0C8599",
};
const F = { body:"15px", card:"15px", h2:"20px", h3:"17px", small:"13px", tag:"12px" };

// ─── 공통 컴포넌트 ────────────────────────
function Insight({ title, children, refs }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#1A1B1E,#25262B)", color:"#CED4DA",
      padding:"18px 20px", borderRadius:"12px", borderLeft:`5px solid ${C.primary}`,
      marginBottom:"18px", fontSize:F.body, lineHeight:1.8 }}>
      <div style={{ fontSize:F.h3, fontWeight:600, color:"#FD7E14", marginBottom:"8px" }}>{title}</div>
      <div>{children}</div>
      {refs && <div style={{ marginTop:"10px", paddingTop:"8px", borderTop:"1px solid #333",
        fontSize:F.tag, color:"#868E96" }}>📚 {refs}</div>}
    </div>
  );
}

function ProductCard({ item, type }) {
  const link = makeAffiliateLink(item.url||"", item.cat);
  const sc = (item.score||0)>=90?C.green:(item.score||0)>=80?C.blue:C.primary;
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"16px" }}>
      <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
        <span style={{ fontSize:"28px", lineHeight:1 }}>{item.img}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:F.card, fontWeight:600, color:C.text }}>{item.rank}. {item.name}</div>
          <div style={{ fontSize:F.small, color:C.sub, marginTop:"3px" }}>
            {item.cat} · <b style={{ color:C.text }}>{item.price}원</b>
            {item.bass && <span style={{ marginLeft:"8px", color:C.purple, fontWeight:600 }}>({item.bass})</span>}
          </div>
        </div>
        {type==="season" && <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"20px", fontWeight:700, color:sc }}>{item.score}</div>
          <div style={{ fontSize:F.tag, color:C.green, fontWeight:600 }}>{item.growth}</div>
        </div>}
        {type==="age" && <span style={{ fontSize:F.tag, fontWeight:600, padding:"4px 10px", borderRadius:"10px",
          background:item.trend==="급상승"?"#FFE3E3":item.trend==="상승"?"#D3F9D8":"#E7F5FF",
          color:item.trend==="급상승"?C.red:item.trend==="상승"?C.green:C.blue }}>{item.trend}</span>}
        {type==="blue" && <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"20px", fontWeight:700, color:sc }}>{item.score}</div>
          <div style={{ fontSize:F.tag, color:C.sub }}>{item.opp}</div>
        </div>}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        marginTop:"12px", paddingTop:"10px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ fontSize:F.small, color:C.sub }}>
          {item.reviews!==undefined && <>리뷰 {(item.reviews||0).toLocaleString()} · 추정 월 {((item.reviews||0)*40).toLocaleString()}건</>}
          {type==="blue" && <>검색 {(item.demand||0).toLocaleString()} · 판매자 <b style={{ color:(item.sellers||0)<20?C.red:C.text }}>{item.sellers}명</b></>}
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer nofollow"
          onClick={()=>trackClick(type,item.name)}
          style={{ background:C.primary, color:"#FFF", fontSize:F.small, fontWeight:600,
            padding:"6px 14px", borderRadius:"8px", textDecoration:"none", whiteSpace:"nowrap" }}>
          쿠팡에서 보기 →</a>
      </div>
    </div>
  );
}

function TrendCard({ item, idx }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:F.card, fontWeight:700, color:C.text }}>{idx+1}. {item.keyword}</div>
          <div style={{ fontSize:F.small, color:C.sub, marginTop:"3px" }}>{item.cat} · 월 {(item.vol||0).toLocaleString()}회</div>
          {item.bass_stage && <div style={{ fontSize:F.tag, color:C.purple, fontWeight:600, marginTop:"2px" }}>📊 {item.bass_stage}</div>}
        </div>
        <div style={{ fontSize:"16px", fontWeight:700, color:C.red }}>{item.change}</div>
      </div>
      <div style={{ marginTop:"10px", display:"flex", flexWrap:"wrap", gap:"6px" }}>
        {(item.tags||[]).map((tag,j)=>(
          <a key={j} href={makeSearchLink(tag,"trend_tag")} target="_blank" rel="noopener noreferrer nofollow"
            onClick={()=>trackClick("trend_tag",tag)}
            style={{ background:C.primaryBg, color:C.primary, fontSize:F.tag, fontWeight:500,
              padding:"4px 12px", borderRadius:"14px", border:"1px solid #FFD8A8", textDecoration:"none" }}>
            #{tag}</a>
        ))}
      </div>
      <div style={{ marginTop:"10px", textAlign:"right" }}>
        <a href={makeSearchLink(item.keyword,"trend_main")} target="_blank" rel="noopener noreferrer nofollow"
          onClick={()=>trackClick("trend_main",item.keyword)}
          style={{ fontSize:F.small, color:C.primary, fontWeight:600, textDecoration:"none" }}>쿠팡에서 검색 →</a>
      </div>
    </div>
  );
}

// ─── 탭 1: 트렌드 ─────────────────────────
function TrendTab({ trending }) {
  return (<>
    <Insight title="실시간 급상승 키워드 — Bass 확산 모델 적용"
      refs="Bass, F.M. (1969). A New Product Growth Model for Consumer Durables. Management Science, 15(5).">
      검색량이 폭발 중인 키워드입니다. 각 키워드의 Bass 확산 단계(도입기→성장기→성숙기→포화기)를 표시했습니다.
      도입기 키워드는 선점 기회가 크고, 성숙기는 경쟁이 치열하지만 시장 규모가 큽니다.
    </Insight>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"14px" }}>
      {(trending||[]).map((t,i)=><TrendCard key={i} item={t} idx={i}/>)}
    </div>
  </>);
}

// ─── 탭 2: 계절성 ─────────────────────────
function SeasonTab({ seasons, monthlyTrends }) {
  const keys=Object.keys(seasons||{});
  const [sel,setSel]=useState(keys[1]||keys[0]);
  const chartData=monthlyTrends||[];
  const chartKeys=chartData.length>0?Object.keys(chartData[0]).filter(k=>k!=="m"):[];
  const COLORS=["#E03131","#1971C2","#2B8A3E","#0C8599","#7048E8"];
  return (<>
    <Insight title="계절성 수요 분석 — 시계열 분해법(STL) 기반"
      refs="Fernández-Durán, J.J. (2014). Modeling seasonal effects in the Bass model. Technological Forecasting & Social Change, 86. / Hyndman, R.J. (2021). Forecasting: Principles and Practice.">
      네이버 데이터랩 2년치 검색 트렌드를 추세(Trend)+계절성(Seasonality)+잔차(Residual)로 분해하여 분석합니다.
      계절성 스코어는 (현재 검색지수 ÷ 과거 2년 피크 검색지수 × 100)으로 계산됩니다.
    </Insight>
    <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
      {keys.map(s=>(<button key={s} onClick={()=>setSel(s)} style={{
        padding:"8px 18px", borderRadius:"20px", fontSize:F.small, cursor:"pointer", fontWeight:sel===s?700:500,
        background:sel===s?C.primaryBg:C.card, color:sel===s?C.primary:C.sub,
        border:sel===s?`2px solid ${C.primary}`:`1px solid ${C.border}` }}>{s}</button>))}
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"12px" }}>
      {(seasons[sel]||[]).map(item=><ProductCard key={item.rank} item={item} type="season"/>)}
    </div>
    {chartData.length>0 && <div style={{ background:C.card, borderRadius:"12px", padding:"18px", marginTop:"22px", border:`1px solid ${C.border}` }}>
      <div style={{ fontSize:F.h3, fontWeight:600, marginBottom:"12px" }}>월별 수요 사이클 (네이버 검색 트렌드 실제 데이터)</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5"/>
          <XAxis dataKey="m" tick={{ fontSize:12 }}/>
          <YAxis tick={{ fontSize:12 }}/>
          <Tooltip/><Legend wrapperStyle={{ fontSize:12 }}/>
          {chartKeys.map((key,i)=>(<Line key={key} type="monotone" dataKey={key} stroke={COLORS[i%COLORS.length]} strokeWidth={2} dot={{ r:3 }}/>))}
        </LineChart>
      </ResponsiveContainer>
    </div>}
  </>);
}

// ─── 탭 3: 연령대 ─────────────────────────
function AgeTab({ ageGroups }) {
  const keys=Object.keys(ageGroups||{});
  const [sel,setSel]=useState("20대");
  return (<>
    <Insight title="연령대별 소비 트렌드 — 소비자 세분화(Segmentation) 분석"
      refs="Kotler, P. & Keller, K.L. (2016). Marketing Management. 15th ed. Pearson. / Smith, W.R. (1956). Product Differentiation and Market Segmentation as Alternative Marketing Strategies.">
      네이버 데이터랩의 연령대별 검색 비중 데이터를 기반으로, 각 연령층이 가장 많이 검색하는 상품을
      8개 분야(뷰티/가전/건강/패션/전자/식품/주방/생활)로 분산하여 보여줍니다. 같은 분야 중복이 없습니다.
    </Insight>
    <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
      {keys.map(a=>(<button key={a} onClick={()=>setSel(a)} style={{
        padding:"8px 18px", borderRadius:"20px", fontSize:F.small, cursor:"pointer", fontWeight:sel===a?700:500,
        background:sel===a?"#F3F0FF":C.card, color:sel===a?C.purple:C.sub,
        border:sel===a?`2px solid ${C.purple}`:`1px solid ${C.border}` }}>{a}</button>))}
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"12px" }}>
      {(ageGroups[sel]||[]).map(item=><ProductCard key={item.rank} item={item} type="age"/>)}
    </div>
  </>);
}

// ─── 탭 4: 가격대 ─────────────────────────
function PriceTab({ priceAnalysis }) {
  const COLORS=["#339AF0","#51CF66","#FCC419","#FF922B","#FF6B6B","#CC5DE8"];
  const chartData=(priceAnalysis||[]).map(d=>({ name:d.range, 판매량:d.avgSales, 경쟁강도:Math.round(d.competition*5000) }));
  return (<>
    <Insight title="가격대별 골든존 분석 — 가격탄력성(Price Elasticity) 적용"
      refs="Marshall, A. (1890). Principles of Economics. / Nagle, T.T. & Müller, G. (2018). The Strategy and Tactics of Pricing. 6th ed. Routledge.">
      가격탄력성 이론에 따르면, 소비자의 가격 민감도는 가격대에 따라 비선형적으로 변합니다.
      1~3만원대는 충동구매 임계점 이하로, 판매량과 마진의 균형이 최적인 '골든존'입니다.
      강세 카테고리는 실제 크롤링 데이터에서 해당 가격대에 가장 많은 상품이 속한 분야입니다.
    </Insight>
    <div style={{ background:C.card, borderRadius:"12px", padding:"18px", border:`1px solid ${C.border}`, marginBottom:"18px" }}>
      <div style={{ fontSize:F.h3, fontWeight:600, marginBottom:"12px" }}>판매량 vs 경쟁강도</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5"/>
          <XAxis dataKey="name" tick={{ fontSize:12 }}/>
          <YAxis tick={{ fontSize:12 }}/>
          <Tooltip formatter={(v,n)=>n==="경쟁강도"?(v/5000).toFixed(1)+"점":v.toLocaleString()+"건"}/>
          <Legend wrapperStyle={{ fontSize:12 }}/>
          <Bar dataKey="판매량" fill="#339AF0" radius={[4,4,0,0]}/>
          <Bar dataKey="경쟁강도" fill="#FF922B" radius={[4,4,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"12px" }}>
      {(priceAnalysis||[]).map((d,i)=>(
        <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"18px", borderLeft:`5px solid ${COLORS[i]}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:F.card, fontWeight:700, color:C.text }}>{d.range}</div>
            <span style={{ background:COLORS[i]+"18", color:COLORS[i], padding:"4px 12px", borderRadius:"12px", fontSize:F.tag, fontWeight:700 }}>마진 {d.margin}</span>
          </div>
          <div style={{ fontSize:F.small, color:C.sub, marginTop:"12px", lineHeight:1.8 }}>
            <div>📦 월 평균 판매: <b style={{ color:C.text }}>{(d.avgSales||0).toLocaleString()}건</b></div>
            <div>⚔️ 경쟁 강도: <b>{d.competition}/10</b></div>
            <div>🏆 대표 상품: <b>{d.topItem}</b></div>
            <div>📂 강세 카테고리: <b style={{ color:C.blue }}>{d.bestCategory}</b></div>
          </div>
        </div>))}
    </div>
  </>);
}

// ─── 탭 5: 베스트&랭킹 ───────────────────
function BestTab({ bestSellers, sellerRankings }) {
  const [period,setPeriod]=useState("weekly");
  const [view,setView]=useState("products");
  const items=(bestSellers||{})[period]||[];
  return (<>
    <Insight title="베스트셀러 & 판매자 랭킹 — 롱테일(Long Tail) 전략"
      refs="Anderson, C. (2006). The Long Tail: Why the Future of Business is Selling Less of More. Hyperion.">
      Chris Anderson의 롱테일 이론에 따르면, 이커머스에서는 상위 20% 히트상품보다
      나머지 80%의 니치 상품이 총 매출에서 더 큰 비중을 차지합니다.
      베스트셀러를 직접 팔기보다, 해당 상품의 보완재/액세서리/소모품을 노리세요.
    </Insight>
    <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
      <div style={{ display:"flex", gap:"4px" }}>
        {[{k:"weekly",l:"주간"},{k:"monthly",l:"월간"}].map(p=>(
          <button key={p.k} onClick={()=>setPeriod(p.k)} style={{ padding:"7px 16px", borderRadius:"8px",
            fontSize:F.small, fontWeight:600, cursor:"pointer", border:"none",
            background:period===p.k?C.text:"#F1F3F5", color:period===p.k?"#FFF":C.sub }}>{p.l}</button>))}
      </div>
      <div style={{ display:"flex", gap:"4px", marginLeft:"auto" }}>
        {[{k:"products",l:"🛍️ 상품"},{k:"sellers",l:"🏪 판매자"}].map(v=>(
          <button key={v.k} onClick={()=>setView(v.k)} style={{ padding:"7px 16px", borderRadius:"8px",
            fontSize:F.small, fontWeight:600, cursor:"pointer", border:"none",
            background:view===v.k?C.primary:"#F1F3F5", color:view===v.k?"#FFF":C.sub }}>{v.l}</button>))}
      </div>
    </div>
    {view==="products" ? (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"12px" }}>
        {items.map((item,i)=>{
          const link=makeAffiliateLink(item.url||"","best");
          return (<div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"16px" }}>
            <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
              <span style={{ fontSize:"28px" }}>{item.img}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:F.card, fontWeight:600, color:C.text }}>{item.rank}. {item.name}</div>
                <div style={{ fontSize:F.small, color:C.sub }}>판매자: {item.seller}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:F.card, fontWeight:700, color:C.green }}>{item.change}</div>
                <div style={{ fontSize:F.small, color:C.sub }}>⭐ {item.reviews}</div>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"12px", paddingTop:"10px", borderTop:`1px solid ${C.border}` }}>
              <span style={{ fontSize:F.small, color:C.sub }}>{period==="weekly"?"주간":"월간"} {(item.sales||0).toLocaleString()}건</span>
              <a href={link} target="_blank" rel="noopener noreferrer nofollow" onClick={()=>trackClick("best",item.name)}
                style={{ background:C.primary, color:"#FFF", fontSize:F.small, fontWeight:600, padding:"6px 14px", borderRadius:"8px", textDecoration:"none" }}>쿠팡에서 보기 →</a>
            </div>
          </div>);})}
      </div>
    ) : (
      <div>{(sellerRankings||[]).map((s,i)=>(
        <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"16px", marginBottom:"10px",
          display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"10px" }}>
          <div style={{ display:"flex", gap:"14px", alignItems:"center" }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:i<3?"#FFF3BF":"#F1F3F5",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", fontWeight:700, color:i<3?"#E67700":C.sub }}>{s.rank}</div>
            <div><div style={{ fontSize:F.card, fontWeight:600, color:C.text }}>{s.name}</div>
              <div style={{ fontSize:F.small, color:C.sub }}>{s.category} · 상품 {(s.products||0).toLocaleString()}개</div></div>
          </div>
          <div style={{ display:"flex", gap:"14px", alignItems:"center" }}>
            <span style={{ background:"#D3F9D8", color:C.green, padding:"4px 12px", borderRadius:"12px", fontSize:F.tag, fontWeight:600 }}>{s.badge}</span>
            <div style={{ textAlign:"right" }}><div style={{ fontSize:F.card, fontWeight:700, color:C.text }}>{s.monthlySales}</div>
              <div style={{ fontSize:F.small, color:C.sub }}>⭐ {s.rating}</div></div>
          </div>
        </div>))}</div>
    )}
  </>);
}

// ─── 탭 6: 해외소싱 ──────────────────────
function GlobalSourcingTab({ globalSourcing }) {
  const countries=Object.keys(globalSourcing||{});
  const [sel,setSel]=useState(countries[0]);
  return (<>
    <Insight title="해외소싱 핫 아이템 — 글로벌 소싱 전략"
      refs="Monczka, R.M. et al. (2015). Purchasing and Supply Chain Management. 6th ed. Cengage.">
      소싱 스코어는 예상마진율(40%) × 수요안정성(30%) × 배송속도(20%) × 품질리스크 역수(10%)로 가중 합산한 지표입니다.
      중국은 마진↑ 리스크↑, 일본은 품질↑ 마진↓, 미국은 프리미엄 라인에 강합니다.
    </Insight>
    <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
      {countries.map(c=>(<button key={c} onClick={()=>setSel(c)} style={{
        padding:"8px 18px", borderRadius:"20px", fontSize:F.small, cursor:"pointer", fontWeight:sel===c?700:500,
        background:sel===c?"#D3F9D8":C.card, color:sel===c?C.green:C.sub,
        border:sel===c?`2px solid ${C.green}`:`1px solid ${C.border}` }}>{c}</button>))}
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"12px" }}>
      {((globalSourcing||{})[sel]||[]).map((item,i)=>{
        const sc=item.score>=85?C.green:item.score>=75?C.blue:C.sub;
        const link=makeSearchLink(item.name,"global");
        return (<div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"16px" }}>
          <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
            <span style={{ fontSize:"28px" }}>{item.img}</span>
            <div style={{ flex:1 }}><div style={{ fontSize:F.card, fontWeight:600, color:C.text }}>{item.rank}. {item.name}</div>
              <div style={{ fontSize:F.small, color:C.sub, marginTop:"3px" }}>{item.cat}</div></div>
            <div style={{ textAlign:"right" }}><div style={{ fontSize:"20px", fontWeight:700, color:sc }}>{item.score}</div>
              <div style={{ fontSize:F.tag, color:C.green, fontWeight:600 }}>{item.margin}</div></div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"12px", paddingTop:"10px", borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontSize:F.small, color:C.sub }}>📦 {item.delivery} · ⚠️ <b style={{ color:item.risk==="높음"?C.red:item.risk==="중간"?"#E67700":C.green }}>{item.risk}</b></div>
            <a href={link} target="_blank" rel="noopener noreferrer nofollow" onClick={()=>trackClick("global",item.name)}
              style={{ background:C.primary, color:"#FFF", fontSize:F.small, fontWeight:600, padding:"6px 14px", borderRadius:"8px", textDecoration:"none" }}>쿠팡에서 보기 →</a>
          </div>
        </div>);})}
    </div>
  </>);
}

// ─── 탭 7: 블루오션 ──────────────────────
function BlueOceanTab({ blueOcean }) {
  return (<>
    <Insight title="블루오션 발굴기 — Kim & Mauborgne 블루오션 전략론"
      refs="Kim, W.C. & Mauborgne, R. (2005). Blue Ocean Strategy. Harvard Business Review Press. / Porter, M.E. (1980). Competitive Strategy. Free Press.">
      블루오션 전략에서 핵심은 '가치 혁신(Value Innovation)' — 경쟁이 무의미해지는 새로운 시장 공간을 창출하는 것입니다.
      블루오션 스코어는 검색수요(40%) × 판매자 희소성(30%) × 리뷰 만족도(20%) × 카테고리 성장률(10%)을 종합한 지표입니다.
      판매자가 20명 미만이면 '극히 낮은 경쟁'으로 분류됩니다.
    </Insight>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"12px" }}>
      {(blueOcean||[]).map(item=><ProductCard key={item.rank} item={item} type="blue"/>)}
    </div>
  </>);
}

// ─── 탭 8: 글로벌 트렌드 (NEW) ───────────
function GlobalTrendTab({ globalTrends }) {
  const items = globalTrends || [];
  return (<>
    <Insight title="글로벌 트렌드 선행 지표 — Rogers 혁신확산 이론"
      refs="Rogers, E.M. (1962). Diffusion of Innovations. Free Press. / Moore, G.A. (1991). Crossing the Chasm. HarperBusiness.">
      Rogers의 혁신확산 이론에 따르면, 신제품은 혁신자(2.5%)→얼리어답터(13.5%)→전기다수(34%)→후기다수(34%)→지각수용자(16%) 순으로 확산됩니다.
      구글 트렌드로 글로벌 검색량과 한국 검색량을 비교하면, 해외에서 먼저 확산된 트렌드가 한국에 진입하는 시점을 2~3개월 전에 예측할 수 있습니다.
      예: 스탠리 텀블러, 다이슨 에어랩 — 모두 글로벌에서 먼저 터지고 한국에 후행 진입했습니다.
    </Insight>
    {items.length > 0 ? (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"14px" }}>
        {items.map((item,i)=>(
          <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
              <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                <span style={{ fontSize:"28px" }}>{item.img}</span>
                <div><div style={{ fontSize:F.card, fontWeight:700, color:C.text }}>{item.keyword_kr}</div>
                  <div style={{ fontSize:F.small, color:C.sub }}>{item.keyword_en}</div></div>
              </div>
              <span style={{ fontSize:F.small, fontWeight:600, padding:"4px 12px", borderRadius:"12px",
                background:item.stage.includes("임박")?"#FFE3E3":item.stage.includes("상승")?"#D3F9D8":"#E7F5FF",
                color:item.stage.includes("임박")?C.red:item.stage.includes("상승")?C.green:C.blue }}>{item.stage}</span>
            </div>
            <div style={{ display:"flex", gap:"16px", marginBottom:"10px" }}>
              <div style={{ flex:1, background:"#F8F9FA", borderRadius:"8px", padding:"10px", textAlign:"center" }}>
                <div style={{ fontSize:F.tag, color:C.sub }}>🌍 글로벌</div>
                <div style={{ fontSize:"18px", fontWeight:700, color:C.text }}>{item.global_score}</div>
                <div style={{ fontSize:F.tag, color:item.global_change?.startsWith("+")?C.green:C.red, fontWeight:600 }}>{item.global_change}</div>
              </div>
              <div style={{ flex:1, background:"#F8F9FA", borderRadius:"8px", padding:"10px", textAlign:"center" }}>
                <div style={{ fontSize:F.tag, color:C.sub }}>🇰🇷 한국</div>
                <div style={{ fontSize:"18px", fontWeight:700, color:C.text }}>{item.kr_score}</div>
                <div style={{ fontSize:F.tag, color:item.kr_change?.startsWith("+")?C.green:C.red, fontWeight:600 }}>{item.kr_change}</div>
              </div>
            </div>
            <div style={{ fontSize:F.small, color:C.purple, fontWeight:600 }}>📊 Bass 단계: {item.bass_stage}</div>
          </div>))}
      </div>
    ) : (
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"24px", textAlign:"center", color:C.sub, fontSize:F.body }}>
        구글 트렌드 데이터 수집 중입니다. 다음 업데이트에 반영됩니다.
      </div>
    )}
  </>);
}

// ─── 탭 9: 카테고리 경쟁도 (NEW) ─────────
function CategoryCompTab({ categoryCompetition }) {
  const items = categoryCompetition || [];
  return (<>
    <Insight title="카테고리 경쟁도 맵 — HHI(허핀달-허쉬만) 지수"
      refs="Herfindahl, O.C. (1950). Concentration in the Steel Industry. / U.S. DOJ & FTC (2023). Merger Guidelines. / Kim, W.C. & Mauborgne, R. (2005). Blue Ocean Strategy.">
      HHI(Herfindahl-Hirschman Index)는 미국 법무부가 시장 독과점 판단에 사용하는 공식 지표입니다.
      판매자 점유율의 제곱합으로 계산하며, HHI {'<'} 1,500 = 경쟁적 시장(진입 기회), 1,500~2,500 = 보통, {'>'} 2,500 = 과점(진입 어려움)으로 분류합니다.
      이를 이커머스 카테고리에 적용하여 진입 난이도를 객관적으로 평가합니다.
    </Insight>
    {items.length > 0 ? (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"12px" }}>
        {items.map((item,i)=>{
          const color = item.level?.includes("🟢")?C.green:item.level?.includes("🟡")?"#E67700":C.red;
          return (<div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"18px", borderLeft:`5px solid ${color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:F.card, fontWeight:700, color:C.text }}>{item.category}</div>
              <span style={{ fontSize:F.small, fontWeight:600, color }}>{item.level}</span>
            </div>
            <div style={{ fontSize:F.small, color:C.sub, marginTop:"12px", lineHeight:1.9 }}>
              <div>📊 HHI 지수: <b style={{ color:C.text }}>{(item.hhi||0).toLocaleString()}</b></div>
              <div>📦 분석 상품: <b>{item.products}개</b></div>
              <div>💰 평균 가격: <b>{item.avgPrice}원</b></div>
              <div>⭐ 평균 리뷰: <b>{item.avgReviews}개</b></div>
              <div>🚀 로켓배송 비율: <b>{item.rocketPct}%</b></div>
              <div>🏆 대표 상품: <b>{item.topProduct}</b></div>
            </div>
          </div>);})}
      </div>
    ) : (
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"24px", textAlign:"center", color:C.sub, fontSize:F.body }}>
        카테고리 경쟁도 데이터 수집 중입니다.
      </div>
    )}
  </>);
}

// ─── 탭 10: 키워드 대결 (NEW) ────────────
function KeywordBattleTab({ trending, seasons }) {
  const allItems = [...(trending||[])];
  const seasonItems = Object.values(seasons||{}).flat().filter(x=>x.score);
  const [a,setA]=useState(0);
  const [b,setB]=useState(1);
  const listA = trending||[];
  const listB = seasonItems.length>0 ? seasonItems : listA;
  const itemA = listA[a%listA.length] || {};
  const itemB = listB[b%listB.length] || {};
  return (<>
    <Insight title="키워드 대결 — 기회비용 분석"
      refs="Mankiw, N.G. (2020). Principles of Economics. 9th ed. Cengage. / 기회비용(Opportunity Cost): 하나를 선택함으로써 포기하는 최선의 대안 가치.">
      두 키워드를 나란히 비교하여, 어떤 상품을 올릴지 데이터 기반으로 결정할 수 있습니다.
      검색량, 경쟁도, 트렌드 방향을 종합적으로 비교하세요.
    </Insight>
    <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center" }}>
      <select value={a} onChange={e=>setA(Number(e.target.value))}
        style={{ padding:"8px 14px", borderRadius:"8px", border:`1px solid ${C.border}`, fontSize:F.small, flex:1, minWidth:"140px" }}>
        {listA.map((t,i)=><option key={i} value={i}>{t.keyword}</option>)}
      </select>
      <span style={{ fontSize:"18px", fontWeight:700, color:C.primary }}>VS</span>
      <select value={b} onChange={e=>setB(Number(e.target.value))}
        style={{ padding:"8px 14px", borderRadius:"8px", border:`1px solid ${C.border}`, fontSize:F.small, flex:1, minWidth:"140px" }}>
        {listA.map((t,i)=><option key={i} value={i}>{t.keyword}</option>)}
      </select>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
      {[itemA,itemB].map((item,idx)=>(
        <div key={idx} style={{ background:C.card, border:`2px solid ${idx===0?"#339AF0":"#FF922B"}`, borderRadius:"12px", padding:"18px" }}>
          <div style={{ fontSize:F.h3, fontWeight:700, color:C.text, marginBottom:"12px", textAlign:"center" }}>{item.keyword||item.name||"—"}</div>
          <div style={{ fontSize:F.body, color:C.sub, lineHeight:2.2 }}>
            <div>📊 검색량: <b style={{ color:C.text }}>{(item.vol||0).toLocaleString()}</b></div>
            <div>📈 변화율: <b style={{ color:(item.change||"").startsWith("+")?C.green:C.red }}>{item.change||"—"}</b></div>
            {item.bass_stage && <div>🔬 Bass 단계: <b style={{ color:C.purple }}>{item.bass_stage}</b></div>}
            <div>🏷️ 카테고리: <b>{item.cat||"—"}</b></div>
          </div>
        </div>))}
    </div>
  </>);
}

// ─── 메인 ─────────────────────────────────
const TABS = [
  { id:"trend", label:"트렌드", icon:"🔥" },
  { id:"season", label:"계절성", icon:"🌸" },
  { id:"age", label:"연령대", icon:"👤" },
  { id:"price", label:"가격대", icon:"💰" },
  { id:"best", label:"베스트", icon:"🏆" },
  { id:"source", label:"해외소싱", icon:"🌏" },
  { id:"blue", label:"블루오션", icon:"🔵" },
  { id:"global", label:"글로벌", icon:"🌐" },
  { id:"compete", label:"경쟁도", icon:"📊" },
  { id:"battle", label:"키워드대결", icon:"⚔️" },
];

export default function Home({ data }) {
  const [tab,setTab]=useState("trend");
  return (<>
    <Head>
      <title>MarketQuant 마켓퀀트 — 퀀트 분석으로 읽는 이커머스 트렌드</title>
      <meta name="description" content="학술 기반 이커머스 분석. Bass 확산 모델, HHI 시장집중도, Rogers 혁신확산 이론으로 트렌드를 예측합니다."/>
      <meta property="og:title" content="MarketQuant — 이커머스 퀀트 분석"/>
      <meta property="og:description" content="데이터와 학술 이론 기반 이커머스 트렌드 분석"/>
      <meta property="og:type" content="website"/>
      <meta name="robots" content="index, follow"/>
    </Head>

    <header style={{ background:"linear-gradient(135deg,#1A1B1E,#25262B)", padding:"22px 16px 16px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"10px" }}>
        <div>
          <h1 style={{ fontSize:"26px", fontWeight:800, color:"#FFF", letterSpacing:"-0.5px", margin:0 }}>
            <span style={{ color:"#339AF0" }}>Market</span><span style={{ color:"#FD7E14" }}>Quant</span>
            <span style={{ fontSize:"13px", fontWeight:500, color:"#868E96", marginLeft:"10px" }}>마켓퀀트</span>
          </h1>
          <p style={{ fontSize:F.small, color:"#868E96", margin:"4px 0 0" }}>
            퀀트 분석으로 읽는 이커머스 트렌드 — 뭘 사야 하지? 뭘 팔아야 하지?
          </p>
        </div>
        <div style={{ fontSize:F.tag, color:"#868E96", background:"rgba(255,255,255,0.06)", padding:"6px 14px", borderRadius:"16px" }}>
          📅 {data.updated} 업데이트
        </div>
      </div>
    </header>

    <nav style={{ background:C.card, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:50 }}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", overflowX:"auto" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"14px 16px", fontSize:F.small, cursor:"pointer", fontWeight:tab===t.id?700:500,
            color:tab===t.id?C.primary:C.sub,
            borderBottom:tab===t.id?`3px solid ${C.primary}`:"3px solid transparent",
            background:"none", border:"none", whiteSpace:"nowrap" }}>{t.icon} {t.label}</button>))}
      </div>
    </nav>

    <main style={{ maxWidth:1200, margin:"0 auto", padding:"20px 16px" }}>
      {tab==="trend" && <TrendTab trending={data.trending}/>}
      {tab==="season" && <SeasonTab seasons={data.seasons} monthlyTrends={data.monthlyTrends}/>}
      {tab==="age" && <AgeTab ageGroups={data.ageGroups}/>}
      {tab==="price" && <PriceTab priceAnalysis={data.priceAnalysis}/>}
      {tab==="best" && <BestTab bestSellers={data.bestSellers} sellerRankings={data.sellerRankings}/>}
      {tab==="source" && <GlobalSourcingTab globalSourcing={data.globalSourcing}/>}
      {tab==="blue" && <BlueOceanTab blueOcean={data.blueOcean}/>}
      {tab==="global" && <GlobalTrendTab globalTrends={data.globalTrends}/>}
      {tab==="compete" && <CategoryCompTab categoryCompetition={data.categoryCompetition}/>}
      {tab==="battle" && <KeywordBattleTab trending={data.trending} seasons={data.seasons}/>}
    </main>

    <footer style={{ background:"#1A1B1E", color:"#868E96", padding:"32px 16px 24px", fontSize:F.tag, lineHeight:1.9, marginTop:"30px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"16px" }}>
          <span style={{ fontWeight:700, fontSize:"18px" }}><span style={{ color:"#339AF0" }}>Market</span><span style={{ color:"#FD7E14" }}>Quant</span></span>
          <span style={{ color:"#495057", marginLeft:"8px" }}>마켓퀀트</span>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"16px 18px", marginBottom:"16px", textAlign:"left", color:"#ADB5BD" }}>
          <div style={{ fontWeight:600, color:"#CED4DA", marginBottom:"8px" }}>분석 방법론 및 데이터 출처</div>
          <p>상품 데이터: 주요 이커머스 플랫폼 실시간 크롤링 (상품명, 가격, 리뷰 수, 평점, 배송 유형)</p>
          <p>검색 트렌드: 네이버 데이터랩 API 기반 월별 검색량, 연령대/성별 분석 (최대 2년치 시계열)</p>
          <p>글로벌 트렌드: Google Trends API 기반 글로벌 vs 한국 검색량 교차 분석</p>
          <p>계절성 스코어: 현재 검색지수 ÷ 과거 2년 피크 검색지수 × 100 (STL 분해법 응용)</p>
          <p>블루오션 스코어: 검색 수요 ÷ 활성 판매자 수 기반 기회 지수 (Kim & Mauborgne, 2005)</p>
          <p>시장집중도: HHI(Herfindahl-Hirschman Index) — 미국 법무부 기준 적용</p>
          <p>확산 단계: Bass 확산 모델(1969) 기반 도입기→성장기→성숙기→포화기 판정</p>
          <p>추정 판매량: 리뷰 수 × 40 (업계 경험치 기반 역추정, Hu et al. 2019 참고)</p>
        </div>
        <div style={{ textAlign:"center", marginBottom:"14px", color:"#868E96" }}>
          <p>본 사이트의 데이터는 공개 소스 기반 통계 분석 결과이며, 수집 시기 및 분석 방법에 따라 실제와 차이가 있을 수 있습니다.</p>
          <p>모든 투자 및 사업 결정은 본인의 판단과 책임 하에 이루어져야 합니다.</p>
          <p>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
        </div>
        <div style={{ textAlign:"center", borderTop:"1px solid #2C2E33", paddingTop:"14px", color:"#495057" }}>
          <p>© 2026 MarketQuant(마켓퀀트). All rights reserved.</p>
          <p>본 사이트의 콘텐츠, 데이터, 분석 방법론, 소스 코드 및 디자인은 저작권법에 의해 보호됩니다.</p>
          <p>무단 복제, 배포, 재가공을 금지하며, 위반 시 관련 법령에 따라 법적 조치를 취할 수 있습니다.</p>
          <p style={{ marginTop:"8px", color:"#868E96" }}>문의: marketquant.info@gmail.com</p>
        </div>
      </div>
    </footer>
  </>);
}
