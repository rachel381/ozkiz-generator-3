import { useState, useRef, useEffect } from "react";

const OZ_PAGE_CSS = `
* {margin:0;padding:0;}
.wp{display: block;} .mp{display: none;}
.detail-page { text-align:left; font-family:'Montserrat','NotoSansKR',Malgun Gothic,sans-serif; word-break: break-all; max-width:800px; margin:70px auto;}
.detail-page img { border:0; line-height:100%;}
.detail-page .img img {width:100%;}
.detail-page .opac20 { opacity: 0.2; } .detail-page .opac80 { opacity: 0.8; }
.detail-page .a-tit {font-size:36px; font-weight:300; color:#222222; line-height:1.4em; letter-spacing:-0.02em; margin:25px; text-align:center; }
.detail-page .b-tit {font-size:26px; font-weight:300; color:#222222; line-height:1.5em; letter-spacing:-0.02em; margin:25px 10px; text-align:center; }
.detail-page .txt {font-size:17px; font-weight:400; color:#3b3b3b; line-height:1.6em; letter-spacing:-0.02em; margin:10px; text-align:center; }
.detail-page .b { font-weight:800; } .detail-page .left { text-align:left; }
.detail-page .say::before { display:block; content:'\u275D'; }
.detail-page .say::after { display:block; content:'\u275E'; line-height:2em; }
.detail-page .cont {padding: 0 10px;}
.detail-page .gap150 {height:150px;} .detail-page .gap50 {height:50px;} .detail-page .gap30 {height:30px;} .detail-page .gap20 {height:20px;}
.tbl-type01 { background-color:#fcfcfc; border-collapse:collapse; width:100% !important; }
.tbl-type01 thead th, .tbl-type01 tbody th { background-color:#f7f7f7; border-bottom:1px solid #fcfcfc; padding:17px 0; text-align:center; font-weight:700; font-size:15px; color:#4C4C4C; }
.tbl-type01 tbody td { background-color:#fcfcfc; border-bottom:1px solid #fcfcfc; padding:17px 0; text-align:center; font-size:15px; color:#4C4C4C; }
.tbl-type01 .bg-on { background-color:#E6101B; border-radius:30px; color:#fff; padding:6px 10px;}
.tbl-type04 { background-color:#fcfcfc; border-collapse:collapse; width:100% !important;}
.tbl-type04 thead th { background-color:#f7f7f7; text-align:center; }
.tbl-type04 thead td { background-color:#f7f7f7; text-align:center; line-height:1.3em; font-size:14px; padding-bottom:10px; }
.tbl-type04 tbody td { background-color:#fcfcfc; padding:17px 0; text-align:center; font-size:15px; color:#4C4C4C; }
@media only screen and (max-width:680px){
  .wp{display:none;} .mp{display:block;}
  .detail-page .gap150 {height:100px;}
  .tbl-type01 thead th, .tbl-type01 tbody td, .tbl-type01 tbody th { padding:14px 0; font-size:14px;}
  .tbl-type04 thead th { font-size:12px; } .tbl-type04 tbody td { padding:14px 0; font-size:14px; }
}
`;

const WASH_ICONS = [
  { id: "washing-machine", src: "https://ozkiz.com/web/upload/oz_base/icon/wash/042-washing-machine.png", label: "세탁기가능" },
  { id: "hand-wash", src: "https://ozkiz.com/web/upload/oz_base/icon/wash/014-hand-wash.png", label: "손세탁" },
  { id: "dry-clean", src: "https://ozkiz.com/web/upload/oz_base/icon/wash/021-dry-clean.png", label: "드라이클리닝" },
  { id: "temperature", src: "https://ozkiz.com/web/upload/oz_base/icon/wash/035-temperature.png", label: "찬물세탁" },
  { id: "softener", src: "https://ozkiz.com/web/upload/oz_base/icon/wash/013-softener.png", label: "중성세제", dimmed: true },
  { id: "dry", src: "https://ozkiz.com/web/upload/oz_base/icon/wash/052-dry.png", label: "건조기불가" },
  { id: "iron", src: "https://ozkiz.com/web/upload/oz_base/icon/wash/025-iron.png", label: "다림질가능" },
  { id: "no-iron", src: "https://ozkiz.com/web/upload/oz_base/icon/wash/026-no-iron.png", label: "다림질불가" },
];

const PRODUCT_INFO_ROWS = [
  { key: "season", label: "계절감", options: ["봄/가을", "여름", "겨울"] },
  { key: "stretch", label: "신축성", options: ["좋음", "보통", "없음"] },
  { key: "lining", label: "안감", options: ["전체", "부분", "없음"] },
  { key: "transparency", label: "비침", options: ["있음", "약간", "없음"] },
  { key: "sizing", label: "사이즈", options: ["작게나옴", "정사이즈", "크게나옴"] },
];

const SIZE_ROWS = ["어깨너비", "가슴둘레", "총길이", "권장연령"];
const SIZE_COLS = ["100", "110", "120", "130", "140"];
const DEFAULT_SIZE_DATA = {
  "어깨너비": ["23.5", "25", "26.5", "28", "29.5"],
  "가슴둘레": ["62", "66", "70", "74", "78"],
  "총길이": ["52", "56.5", "61", "65.5", "70"],
  "권장연령": ["3세초과", "4-5세", "5-6세", "6-7세", "7-8세"],
};

const mkImg = (key, label) => ({ key, label, file: null, preview: "", url: "", base64: "" });
const mkColor = () => ({ id: Date.now() + Math.random(), colorName: "화이트 / white", colorDot: "#f7f7f7", image: mkImg("color", "컬러 이미지") });

const initState = () => ({
  productCode: "",
  imageBaseUrl: "https://ozkizonline.cafe24.com/ozkiz/wear/",
  mainTitle: "새하얀 꽃잎이\n내려앉은 여름",
  mainImage: mkImg("main", "메인 이미지"),
  productNameBold: "코튼플로럴",
  productNameNormal: "원피스 가디건",
  description: "단추를 모두 잠그면 청초한 원피스로,\n단추를 열면 가벼운 민소매 코튼 가디건으로 변신하는\n다재다능한 아이템이에요!",
  wearingImage: mkImg("wearing", "착용 이미지"),
  checkpoints: "섬세한 아일렛 펀칭 레이스\n마법 같은 2-way 버튼다운\n로맨틱한 허리 셔링 주름",
  pointImage: mkImg("point", "포인트 이미지"),
  detailImages: [mkImg("detail_0", "제품컷 1")],
  colors: [mkColor()],
  sizeType: "상의",
  sizeData: DEFAULT_SIZE_DATA,
  productInfo: { season: "여름", stretch: "없음", lining: "없음", transparency: "약간", sizing: "정사이즈" },
  washIcons: ["washing-machine", "hand-wash", "temperature", "softener", "dry"],
  washNote: "면 혼방 소재 제품의 특성상\n찬물 세탁 및 색상별 구분 세탁을 권해드리며,\n건조기 사용시 변형이 있을 수 있으니 자연건조 해주세요.",
  productNumber: "",
  material: "주원단:면100%",
  manufacturer: "(주)오픈한 오즈키즈",
  madeIn: "중국",
});

function generateHTML(s) {
  const src = (img) => img?.base64 || img?.url || "";
  const mainTitleHtml = s.mainTitle.split("\n").join("<br>\n\t\t");
  const descHtml = s.description.split("\n").join("<br>\n\t\t");
  const checkHtml = s.checkpoints.split("\n").map(l => `· ${l}`).join("<br>\n\t\t");
  const sizeRows = SIZE_ROWS.map(row =>
    `\t\t\t\t\t<tr>\n\t\t\t\t\t\t<th>${row}</th>\n${SIZE_COLS.map((_, i) => `\t\t\t\t\t\t<td>${s.sizeData[row]?.[i] || ""}</td>`).join("\n")}\n\t\t\t\t\t</tr>`
  ).join("\n");
  const productInfoRows = PRODUCT_INFO_ROWS.map(row => {
    const selected = s.productInfo[row.key];
    const cells = row.options.map(opt =>
      opt === selected ? `<td><span class="bg-on">${opt}</span></td>` : `<td>${opt}</td>`
    ).join("");
    return `\t\t\t\t\t<tr><th>${row.label}</th>${cells}</tr>`;
  }).join("\n");
  const selectedWash = s.washIcons.map(id => WASH_ICONS.find(w => w.id === id)).filter(Boolean);
  const washIconsHtml = selectedWash.map(w =>
    `\t\t\t\t\t<th><div class="img ${w.dimmed ? "opac20" : "opac80"}"><img src="${w.src}" alt=""></div></th>`
  ).join("\n");
  const washLabelsHtml = selectedWash.map(w =>
    `\t\t\t\t\t<td><span class="${w.dimmed ? "opac20" : "opac100 b"}">${w.label}</span></td>`
  ).join("\n");
  const colW = Math.round(100 / Math.max(selectedWash.length, 1));
  const washColgroup = selectedWash.map(() => `\t\t\t\t<col width="${colW}%">`).join("\n");
  const detailImagesHtml = s.detailImages.map(img =>
    `\t<div class="img" id="onlyimg">\n\t\t<img alt="오즈키즈 아동복" src="${src(img)}">\n\t</div>\n\t<div class="gap50"></div>`
  ).join("\n");
  const colorsHtml = s.colors.map(c => `
\t<h4 class="b-tit left b">컬러정보</h4>
\t<div class="txt left"><span class="b" style="color:${c.colorDot};">●</span> ${c.colorName}</div>
\t<div class="img" id="onlyimg"><img alt="오즈키즈 아동복" src="${src(c.image)}"></div>
\t<div class="gap150"></div>`).join("\n");

  return `<!-- 스타일시트 링크 -->
<link rel="stylesheet" href="https://ozkiz1.cafe24.com/web/upload/oz_base/css/oz_page.css" type="text/css">

<!-- s: detail-page -->
<div class="detail-page" style="max-width:860px;">

\t<!-- 인트로 -->
\t<h2 class="a-tit b say" style="margin:100px auto;">
\t\t${mainTitleHtml}
\t</h2>
\t<div class="img" id="onlyimg"><img alt="오즈키즈 아동복" src="${src(s.mainImage)}"></div>
\t<div class="gap150"></div>
\t<h1 class="a-tit"><span class="b" style="color:#000;">${s.productNameBold}</span><br>${s.productNameNormal}</h1>
\t<div class="gap50"></div>
\t<div class="txt">${descHtml}</div>
\t<div class="gap150"></div>

\t<!-- 착용이미지 -->
\t<div class="img" id="onlyimg"><img alt="오즈키즈 아동복" src="${src(s.wearingImage)}"></div>
\t<div class="gap150"></div>

\t<!-- 제품포인트 -->
\t<h4 class="b-tit left b">체크포인트</h4>
\t<div class="txt left">${checkHtml}</div>
\t<div class="gap50"></div>
\t<div class="img" id="onlyimg"><img alt="오즈키즈 아동복" src="${src(s.pointImage)}"></div>
\t<div class="gap150"></div>

\t<!-- 제품컷 -->
${detailImagesHtml}
\t<div class="gap150"></div>

\t<!-- 컬러안내 -->
${colorsHtml}

\t<!-- 제품정보 -->
\t<h4 class="b-tit left b">사이즈 정보</h4>
\t<p class="txt left">측정 방법과 위치에 따라 1-3cm 정도의 오차가 발생할 수 있습니다.</p>
\t<div class="cont">
\t\t<p class="txt b left">${s.sizeType} 사이즈</p>
\t\t<table class="tbl-type01">
\t\t\t<colgroup><col width="16%">${SIZE_COLS.map(() => `<col width="15%">`).join("")}</colgroup>
\t\t\t<thead><tr><th>사이즈</th>${SIZE_COLS.map(c => `<th>${c}</th>`).join("")}</tr></thead>
\t\t\t<tbody>${sizeRows}</tbody>
\t\t</table>
\t</div>
\t<div class="gap150"></div>

\t<h4 class="b-tit left b">제품정보 보기</h4>
\t<div class="cont">
\t\t<table class="tbl-type01">
\t\t\t<colgroup><col width="25%"><col width="25%"><col width="25%"><col width="25%"></colgroup>
\t\t\t<tbody>${productInfoRows}</tbody>
\t\t</table>
\t</div>
\t<div class="gap150"></div>

\t<h4 class="b-tit left b">세탁안내</h4>
\t<div class="cont">
\t\t<table class="tbl-type04">
\t\t\t<colgroup>${washColgroup}</colgroup>
\t\t\t<thead>
\t\t\t\t<tr>${washIconsHtml}</tr>
\t\t\t\t<tr>${washLabelsHtml}</tr>
\t\t\t</thead>
\t\t\t<tbody><tr><td colspan="${selectedWash.length}">${s.washNote.split("\n").join("<br>")}</td></tr></tbody>
\t\t</table>
\t</div>
\t<div class="gap150"></div>

\t<h4 class="b-tit left b">제품상세 정보 보기</h4>
\t<div class="cont">
\t\t<table class="tbl-type01">
\t\t\t<colgroup><col width="25%"><col width="*"></colgroup>
\t\t\t<tbody>
\t\t\t\t<tr><th>제품 번호</th><td>${s.productNumber}</td></tr>
\t\t\t\t<tr><th>제품 소재</th><td>${s.material.split("\n").join("<br>")}</td></tr>
\t\t\t\t<tr><th>제조사/수입사</th><td>${s.manufacturer}</td></tr>
\t\t\t\t<tr><th>제조국</th><td>${s.madeIn}</td></tr>
\t\t\t</tbody>
\t\t</table>
\t</div>
\t<div class="gap150"></div>

\t<h4 class="b-tit left b">인증정보</h4>
\t<div class="cont">
\t\t<table class="tbl-type01">
\t\t\t<colgroup><col width="20%"><col width="*"></colgroup>
\t\t\t<tbody>
\t\t\t\t<tr>
\t\t\t\t\t<th><img src="https://ozkiz.com/web/upload/oz_kc_256.png" style="width:40%;"></th>
\t\t\t\t\t<td><p class="left" style="margin:auto 10px;">본 제품은 FITI 시험 연구원을 통해 <span class="b">공급자 적합성 확인 인증</span>을 받은 안전한 소재로 제작된 안전한 제품입니다.</p></td>
\t\t\t\t</tr>
\t\t\t</tbody>
\t\t</table>
\t</div>
\t<div class="gap150"></div>

</div>
<!-- e: detail-page //-->`;
}

// ── UI 컴포넌트 ──
const Section = ({ num, title, isOpen, onToggle, children }) => (
  <div style={{ marginBottom: 5, border: "0.5px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
    <div onClick={onToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", cursor: "pointer", background: "#fff" }}
      onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
      onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#4f46e5", color: "#fff", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{num}</div>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#111827" }}>{title}</span>
      </div>
      <span style={{ fontSize: 10, color: "#9ca3af", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
    </div>
    {isOpen && <div style={{ padding: "10px 12px", borderTop: "0.5px solid #e5e7eb" }}>{children}</div>}
  </div>
);

const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 9 }}>
    <label style={{ display: "block", fontSize: 10, fontWeight: 500, color: "#6b7280", marginBottom: 3 }}>{label}</label>
    {hint && <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 3 }}>{hint}</div>}
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", padding: "6px 8px", border: "0.5px solid #d1d5db", borderRadius: 5, fontSize: 11, boxSizing: "border-box", fontFamily: "inherit" }} />
);

const Textarea = ({ value, onChange, rows = 3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
    style={{ width: "100%", padding: "6px 8px", border: "0.5px solid #d1d5db", borderRadius: 5, fontSize: 11, resize: "vertical", boxSizing: "border-box", lineHeight: 1.6, fontFamily: "inherit" }} />
);

function ImageUploader({ image, onChange, label }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange({ ...image, file, preview: e.target.result, base64: e.target.result, url: "" });
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 10, fontWeight: 500, color: "#6b7280", marginBottom: 3 }}>{label}</div>}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current.click()}
        style={{ border: `1.5px dashed ${dragOver ? "#4f46e5" : "#d1d5db"}`, borderRadius: 7, padding: 8, cursor: "pointer", textAlign: "center", background: dragOver ? "#eef2ff" : "#f9fafb", minHeight: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 3 }}>
        {(image.preview || image.base64) ? (
          <><img src={image.preview || image.base64} alt="" style={{ height: 36, objectFit: "contain", borderRadius: 3 }} /><span style={{ fontSize: 9, color: "#9ca3af" }}>클릭해서 변경</span></>
        ) : (
          <span style={{ fontSize: 10, color: "#9ca3af" }}>클릭 또는 드래그</span>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
      <input value={image.url} onChange={e => onChange({ ...image, url: e.target.value, file: null, preview: "", base64: "" })}
        placeholder="또는 이미지 URL 입력"
        style={{ width: "100%", padding: "3px 6px", border: "0.5px solid #d1d5db", borderRadius: 5, fontSize: 10, boxSizing: "border-box", color: "#6b7280" }} />
    </div>
  );
}

export default function OzkizGenerator() {
  const [s, setS] = useState(initState());
  const [tab, setTab] = useState("edit");
  const [openSecs, setOpenSecs] = useState({ 1: true, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false });
  const [copied, setCopied] = useState(false);
  const [savingJpg, setSavingJpg] = useState(false);
  const [exportingCoupang, setExportingCoupang] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const iframeRef = useRef(null);

  const set = (key, val) => setS(prev => ({ ...prev, [key]: val }));
  const html = generateHTML(s);

  const toggleSec = (n) => setOpenSecs(prev => ({ ...prev, [n]: !prev[n] }));

  useEffect(() => {
    if (tab !== "preview") return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const inject = () => {
      try {
        const win = iframe.contentWindow;
        const doc = win.document;
        const scrollY = win.scrollY || 0;
        if (!doc.head.querySelector("style[data-oz]")) {
          const st = doc.createElement("style"); st.setAttribute("data-oz", "1"); st.textContent = OZ_PAGE_CSS; doc.head.appendChild(st);
        }
        doc.body.innerHTML = html;
        win.scrollTo(0, scrollY);
      } catch (e) {}
    };
    if (iframe.contentDocument?.readyState === "complete") inject();
    else iframe.onload = inject;
  }, [html, tab]);

  // ── AI 자동 생성 ──
  const handleAIGenerate = async () => {
    if (aiLoading) return;
    if (!s.productNameBold && !s.productNameNormal) { alert("상품명을 먼저 입력해주세요!"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: `오즈키즈는 한국의 감성 아동복 브랜드입니다. 아래 상품 정보를 바탕으로 2가지 텍스트를 작성해주세요.

상품명: ${s.productNameBold} ${s.productNameNormal}
소재: ${s.material}
계절: ${s.productInfo.season}

[대표슬로건]
- 10자 이내 (줄바꿈 포함 최대 2줄 가능)
- 다정하고 감성적인 구어체 톤
- 계절감과 제품 무드를 담아서

[제품설명]
- 150자 내외
- 고객 입장에서 구매 욕구를 자극
- 엄마들이 공감할 수 있는 따뜻한 시선
- 다정하고 감성적인 구어체 톤
- 줄바꿈으로 2~3문장 구분

아래 JSON 형식으로만 응답하세요:
{"slogan":"슬로건(줄바꿈은 \\n)","desc":"설명(줄바꿈은 \\n)"}`
          }]
        })
      });
      const data = await res.json();
      const parsed = JSON.parse((data.content?.[0]?.text || "").trim());
      if (parsed.slogan) set("mainTitle", parsed.slogan);
      if (parsed.desc) set("description", parsed.desc);
    } catch (e) {
      alert("오류가 발생했어요. 다시 시도해주세요.");
    }
    setAiLoading(false);
  };

  // ── 제품컷 ──
  const addDetailImage = () => set("detailImages", [...s.detailImages, mkImg(`detail_${Date.now()}`, `제품컷 ${s.detailImages.length + 1}`)]);
  const removeDetailImage = (idx) => { if (s.detailImages.length <= 1) return; set("detailImages", s.detailImages.filter((_, i) => i !== idx)); };
  const updateDetailImage = (idx, img) => { const arr = [...s.detailImages]; arr[idx] = img; set("detailImages", arr); };

  // ── 컬러 ──
  const addColor = () => set("colors", [...s.colors, mkColor()]);
  const removeColor = (id) => { if (s.colors.length <= 1) return; set("colors", s.colors.filter(c => c.id !== id)); };
  const updateColor = (id, key, val) => set("colors", s.colors.map(c => c.id === id ? { ...c, [key]: val } : c));
  const updateColorImage = (id, img) => set("colors", s.colors.map(c => c.id === id ? { ...c, image: img } : c));

  // ── 사이즈 ──
  const updateSizeData = (row, colIdx, val) => {
    const nd = { ...s.sizeData, [row]: [...(s.sizeData[row] || [])] };
    nd[row][colIdx] = val;
    set("sizeData", nd);
  };

  // ── 내보내기 ──
  const handleCopy = () => { navigator.clipboard.writeText(html); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    a.download = `${s.productCode || "detail"}_page.html`; a.click();
  };

  const loadH2C = () => new Promise((resolve, reject) => {
    if (window.html2canvas) { resolve(); return; }
    const sc = document.createElement("script");
    sc.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    sc.onload = resolve; sc.onerror = reject;
    document.head.appendChild(sc);
  });

  const renderToCanvas = async (bodyHtml, width = 860) => {
    const iframe = document.createElement("iframe");
    iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${width}px;border:none;height:1px;`;
    document.body.appendChild(iframe);
    await new Promise(r => { iframe.onload = r; iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${OZ_PAGE_CSS} body{margin:0;background:#fff;}</style></head><body>${bodyHtml}</body></html>`; });
    const doc = iframe.contentDocument;
    const h = doc.documentElement.scrollHeight;
    iframe.style.height = h + "px";
    await new Promise(r => setTimeout(r, 800));
    const canvas = await window.html2canvas(doc.body, { useCORS: true, allowTaint: true, scale: 2, width, height: h, windowWidth: width, windowHeight: h, scrollX: 0, scrollY: 0, backgroundColor: "#ffffff" });
    document.body.removeChild(iframe);
    return canvas;
  };

  const openInNewTab = (canvas, filename) => {
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const w = window.open();
    w.document.write(`<html><head><title>${filename}</title></head><body style="margin:0;background:#111;display:flex;flex-direction:column;align-items:center;"><div style="padding:12px;background:#222;width:100%;text-align:center;position:sticky;top:0;z-index:9"><a href="${dataUrl}" download="${filename}" style="background:#4f46e5;color:#fff;padding:8px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700;">⬇ 다운로드</a></div><img src="${dataUrl}" style="max-width:100%;display:block;"/></body></html>`);
    w.document.close();
  };

  const handleSaveJpg = async () => {
    setSavingJpg(true);
    try { await loadH2C(); const c = await renderToCanvas(html, 860); openInNewTab(c, `${s.productCode || "detail"}_page.jpg`); }
    catch (e) { alert("오류: " + e.message); }
    setSavingJpg(false);
  };

  const getCoupangSections = () => {
    const src = (img) => img?.base64 || img?.url || "";
    const descHtml = s.description.split("\n").join("<br>");
    const checkHtml = s.checkpoints.split("\n").map(l => `· ${l}`).join("<br>");
    const B = "max-width:860px;margin:0 auto;background:#fff;font-family:'Malgun Gothic',sans-serif;padding:0;";
    const selectedWash = s.washIcons.map(id => WASH_ICONS.find(w => w.id === id)).filter(Boolean);
    const sizeRows = SIZE_ROWS.map(row =>
      `<tr><th style="background:#f7f7f7;padding:14px 0;font-size:15px;font-weight:700;text-align:center;">${row}</th>${SIZE_COLS.map((_, i) => `<td style="background:#fcfcfc;padding:14px 0;font-size:15px;text-align:center;">${s.sizeData[row]?.[i] || ""}</td>`).join("")}</tr>`
    ).join("");
    const infoRows = PRODUCT_INFO_ROWS.map(row => {
      const sel = s.productInfo[row.key];
      return `<tr><th style="background:#f7f7f7;padding:14px 0;font-size:15px;font-weight:700;text-align:center;">${row.label}</th>${row.options.map(o => o === sel ? `<td style="background:#fcfcfc;padding:14px 0;text-align:center;"><span style="background:#E6101B;border-radius:30px;color:#fff;padding:6px 10px;">${o}</span></td>` : `<td style="background:#fcfcfc;padding:14px 0;text-align:center;">${o}</td>`).join("")}</tr>`;
    }).join("");
    return [
      { id: "01_intro", label: "인트로", html: `<div style="${B}"><div style="padding:60px 30px 30px;text-align:center;"><p style="font-size:18px;color:#666;margin-bottom:12px;">${s.mainTitle.split("\n").join(" ")}</p><h1 style="font-size:32px;font-weight:900;color:#111;line-height:1.3;">${s.productNameBold} ${s.productNameNormal}</h1></div><img src="${src(s.mainImage)}" style="width:100%;display:block;"><div style="padding:40px 30px;text-align:center;"><p style="font-size:16px;color:#444;line-height:1.9;">${descHtml}</p></div><div style="height:60px;"></div></div>` },
      { id: "02_wearing", label: "착용이미지", html: `<div style="${B}"><img src="${src(s.wearingImage)}" style="width:100%;display:block;"><div style="height:60px;"></div></div>` },
      { id: "03_point", label: "제품포인트", html: `<div style="${B}"><div style="padding:60px 30px 30px;"><h2 style="font-size:22px;font-weight:800;margin-bottom:16px;">체크포인트</h2><p style="font-size:16px;color:#444;line-height:2;">${checkHtml}</p></div><img src="${src(s.pointImage)}" style="width:100%;display:block;"><div style="height:60px;"></div></div>` },
      { id: "04_detail", label: "제품컷", html: `<div style="${B}">${s.detailImages.map(img => `<img src="${src(img)}" style="width:100%;display:block;">`).join("")}<div style="height:60px;"></div></div>` },
      { id: "05_color", label: "컬러안내", html: `<div style="${B}">${s.colors.map(c => `<div style="padding:40px 30px 16px;"><h2 style="font-size:22px;font-weight:800;margin-bottom:12px;">컬러 정보</h2><p style="font-size:16px;"><span style="color:${c.colorDot};font-size:20px;">●</span> ${c.colorName}</p></div><img src="${src(c.image)}" style="width:100%;display:block;">`).join("")}<div style="height:60px;"></div></div>` },
      { id: "06_info", label: "상세정보", html: `<div style="${B}padding-bottom:60px;"><div style="padding:50px 30px 20px;"><h2 style="font-size:22px;font-weight:800;margin-bottom:16px;">사이즈 정보</h2><table style="width:100%;border-collapse:collapse;"><thead><tr><th style="background:#f7f7f7;padding:14px 0;text-align:center;font-weight:700;">사이즈</th>${SIZE_COLS.map(c => `<th style="background:#f7f7f7;padding:14px 0;text-align:center;font-weight:700;">${c}</th>`).join("")}</tr></thead><tbody>${sizeRows}</tbody></table></div><div style="padding:30px 30px 20px;"><h2 style="font-size:22px;font-weight:800;margin-bottom:16px;">제품 정보</h2><table style="width:100%;border-collapse:collapse;"><colgroup><col width="25%"><col width="25%"><col width="25%"><col width="25%"></colgroup><tbody>${infoRows}</tbody></table></div><div style="padding:30px 30px 20px;"><h2 style="font-size:22px;font-weight:800;margin-bottom:16px;">세탁 안내</h2><table style="width:100%;border-collapse:collapse;background:#f7f7f7;"><thead><tr>${selectedWash.map(w => `<th style="padding:16px 0;text-align:center;"><img src="${w.src}" style="width:40px;opacity:${w.dimmed ? 0.2 : 0.8};display:block;margin:0 auto 6px;"><span style="font-size:13px;font-weight:700;">${w.label}</span></th>`).join("")}</tr></thead><tbody><tr><td colspan="${selectedWash.length}" style="background:#fcfcfc;padding:20px;text-align:center;font-size:14px;color:#444;line-height:1.8;">${s.washNote.split("\n").join("<br>")}</td></tr></tbody></table></div><div style="padding:30px;"><table style="width:100%;border-collapse:collapse;"><colgroup><col width="20%"><col width="80%"></colgroup><tbody><tr><td style="background:#f7f7f7;padding:20px;text-align:center;"><img src="https://ozkiz.com/web/upload/oz_kc_256.png" style="width:60%;"></td><td style="background:#fcfcfc;padding:20px;font-size:14px;color:#444;line-height:1.8;">본 제품은 FITI 시험 연구원을 통해 <strong>공급자 적합성 확인 인증</strong>을 받은 안전한 소재로 제작된 안전한 제품입니다.</td></tr></tbody></table></div></div>` },
    ];
  };

  const handleExportCoupang = async () => {
    setExportingCoupang(true);
    try {
      await loadH2C();
      const sections = getCoupangSections();
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        setExportProgress(`${sec.label} (${i + 1}/${sections.length})`);
        const canvas = await renderToCanvas(sec.html, 860);
        const a = document.createElement("a");
        a.download = `${s.productCode || "detail"}_${sec.id}.jpg`;
        a.href = canvas.toDataURL("image/jpeg", 0.95); a.click();
        await new Promise(r => setTimeout(r, 400));
      }
      setExportProgress("");
    } catch (e) { alert("오류: " + e.message); setExportProgress(""); }
    setExportingCoupang(false);
  };

  const handleExportNaver = () => {
    const src = (img) => img?.base64 || img?.url || "";
    const naverHtml = `<div style="max-width:860px;margin:0 auto;font-family:'Malgun Gothic',sans-serif;line-height:1.8;">
<img src="${src(s.mainImage)}" style="width:100%;display:block;">
<div style="padding:40px 20px;text-align:center;"><h2 style="font-size:28px;font-weight:900;margin-bottom:16px;">${s.productNameBold} ${s.productNameNormal}</h2><p style="font-size:16px;color:#444;line-height:1.9;">${s.description.split("\n").join("<br>")}</p></div>
<img src="${src(s.wearingImage)}" style="width:100%;display:block;">
<div style="padding:40px 20px;background:#f9f9f9;"><h3 style="font-size:20px;font-weight:800;margin-bottom:12px;">✅ 체크포인트</h3><p style="font-size:16px;color:#444;line-height:2;">${s.checkpoints.split("\n").map(l => `· ${l}`).join("<br>")}</p></div>
<img src="${src(s.pointImage)}" style="width:100%;display:block;">
${s.detailImages.map(img => `<img src="${src(img)}" style="width:100%;display:block;">`).join("\n")}
${s.colors.map(c => `<div style="padding:30px 20px;"><h3 style="font-size:20px;font-weight:800;">🎨 ${c.colorName}</h3></div><img src="${src(c.image)}" style="width:100%;display:block;">`).join("\n")}
</div>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([naverHtml], { type: "text/html;charset=utf-8" }));
    a.download = `${s.productCode || "detail"}_naver.html`; a.click();
  };

  const BtnS = (bg, disabled) => ({ padding: "6px 10px", background: disabled ? "#d1d5db" : bg, color: "#fff", border: "none", borderRadius: 5, cursor: disabled ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" });

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Malgun Gothic', sans-serif", background: "#f8fafc", overflow: "hidden", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ background: "#4f46e5", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>🧸 오즈키즈 상세페이지 생성기</span>
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: 2 }}>
          {[["edit", "편집"], ["preview", "미리보기"], ["html", "HTML"]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "4px 10px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, background: tab === t ? "#fff" : "transparent", color: tab === t ? "#4f46e5" : "rgba(255,255,255,0.8)" }}>{label}</button>
          ))}
        </div>
      </div>

      {/* 채널 툴바 */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb", padding: "7px 14px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
        {exportProgress && <span style={{ fontSize: 11, color: "#6b7280" }}>{exportProgress}</span>}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>자사몰</span>
          <div style={{ display: "flex", gap: 3 }}>
            <button onClick={handleCopy} style={BtnS(copied ? "#059669" : "#6b7280", false)}>{copied ? "✓ 복사" : "📋 복사"}</button>
            <button onClick={handleDownload} style={BtnS("#4f46e5", false)}>⬇ HTML</button>
            <button onClick={handleSaveJpg} disabled={savingJpg || tab !== "preview"} style={BtnS("#4f46e5", savingJpg || tab !== "preview")}>{savingJpg ? "⏳" : "🖼 JPG"}</button>
          </div>
        </div>
        <div style={{ width: 0.5, height: 32, background: "#e5e7eb" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>쿠팡/입점몰</span>
          <button onClick={handleExportCoupang} disabled={exportingCoupang} style={BtnS("#f97316", exportingCoupang)}>{exportingCoupang ? "⏳ 변환중..." : "🖼 섹션 JPG"}</button>
        </div>
        <div style={{ width: 0.5, height: 32, background: "#e5e7eb" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>네이버</span>
          <button onClick={handleExportNaver} style={BtnS("#03c75a", false)}>📝 블로그</button>
        </div>
      </div>

      {/* 메인 */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {tab === "edit" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>

            <Section num={1} title="기본정보" isOpen={openSecs[1]} onToggle={() => toggleSec(1)}>
              <Field label="상품 코드"><Input value={s.productCode} onChange={v => set("productCode", v)} placeholder="o500" /></Field>
              <Field label="이미지 서버 주소"><Input value={s.imageBaseUrl} onChange={v => set("imageBaseUrl", v)} /></Field>
            </Section>

            <Section num={2} title="인트로 (슬로건·메인이미지·상품명·설명)" isOpen={openSecs[2]} onToggle={() => toggleSec(2)}>
              <div style={{ background: "#f5f3ff", border: "0.5px solid #c4b5fd", borderRadius: 7, padding: 9, marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#7c3aed", marginBottom: 6 }}>✨ AI 자동 생성</div>
                <button onClick={handleAIGenerate} disabled={aiLoading}
                  style={{ width: "100%", padding: 7, background: aiLoading ? "#d1d5db" : "#6d28d9", border: "none", borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 500, cursor: aiLoading ? "not-allowed" : "pointer" }}>
                  {aiLoading ? "⏳ 생성 중..." : "✨ AI 자동 생성 (슬로건 + 설명)"}
                </button>
                <div style={{ fontSize: 9, color: "#7c3aed", marginTop: 5, lineHeight: 1.5 }}>상품명·소재·계절 입력 후 버튼을 누르면<br />슬로건(10자 이내) + 제품설명(150자 내외)을 한번에 작성해드려요</div>
              </div>
              <Field label="대표 슬로건"><Textarea value={s.mainTitle} onChange={v => set("mainTitle", v)} rows={2} /></Field>
              <ImageUploader image={s.mainImage} onChange={img => set("mainImage", img)} label="메인 이미지" />
              <Field label="상품명 (굵게)"><Input value={s.productNameBold} onChange={v => set("productNameBold", v)} placeholder="코튼플로럴" /></Field>
              <Field label="상품명 (일반)"><Input value={s.productNameNormal} onChange={v => set("productNameNormal", v)} placeholder="원피스 가디건" /></Field>
              <Field label="제품 설명"><Textarea value={s.description} onChange={v => set("description", v)} rows={4} /></Field>
            </Section>

            <Section num={3} title="착용 이미지" isOpen={openSecs[3]} onToggle={() => toggleSec(3)}>
              <ImageUploader image={s.wearingImage} onChange={img => set("wearingImage", img)} label="착용 이미지" />
            </Section>

            <Section num={4} title="제품포인트" isOpen={openSecs[4]} onToggle={() => toggleSec(4)}>
              <Field label="체크포인트" hint="항목마다 Enter로 구분"><Textarea value={s.checkpoints} onChange={v => set("checkpoints", v)} rows={3} /></Field>
              <ImageUploader image={s.pointImage} onChange={img => set("pointImage", img)} label="포인트 이미지" />
            </Section>

            <Section num={5} title="제품컷" isOpen={openSecs[5]} onToggle={() => toggleSec(5)}>
              {s.detailImages.map((img, i) => (
                <div key={img.key} style={{ position: "relative", marginBottom: 6 }}>
                  <ImageUploader image={img} onChange={ni => updateDetailImage(i, ni)} label={`제품컷 ${i + 1}`} />
                  {s.detailImages.length > 1 && (
                    <button onClick={() => removeDetailImage(i)} style={{ position: "absolute", top: 18, right: 0, width: 20, height: 20, background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>✕</button>
                  )}
                </div>
              ))}
              <button onClick={addDetailImage} style={{ width: "100%", padding: 6, background: "#f3f4f6", border: "1.5px dashed #d1d5db", borderRadius: 7, cursor: "pointer", fontSize: 11, color: "#6b7280", fontWeight: 500 }}>+ 제품컷 추가</button>
            </Section>

            <Section num={6} title="컬러안내" isOpen={openSecs[6]} onToggle={() => toggleSec(6)}>
              {s.colors.map((c, i) => (
                <div key={c.id} style={{ background: "#f9fafb", border: "0.5px solid #e5e7eb", borderRadius: 7, padding: 9, marginBottom: 7, position: "relative" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#4f46e5", marginBottom: 7 }}>컬러 {i + 1}</div>
                  {s.colors.length > 1 && <button onClick={() => removeColor(c.id)} style={{ position: "absolute", top: 7, right: 7, width: 18, height: 18, background: "#ef4444", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontSize: 11 }}>✕</button>}
                  <Field label="컬러명">
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <input type="color" value={c.colorDot} onChange={e => updateColor(c.id, "colorDot", e.target.value)} style={{ width: 30, height: 28, border: "0.5px solid #d1d5db", borderRadius: 5, padding: 2, cursor: "pointer", flexShrink: 0 }} />
                      <input value={c.colorName} onChange={e => updateColor(c.id, "colorName", e.target.value)} placeholder="화이트 / white" style={{ flex: 1, padding: "6px 8px", border: "0.5px solid #d1d5db", borderRadius: 5, fontSize: 11 }} />
                    </div>
                  </Field>
                  <ImageUploader image={c.image} onChange={img => updateColorImage(c.id, img)} label="컬러 이미지" />
                </div>
              ))}
              {s.colors.length < 6 && <button onClick={addColor} style={{ width: "100%", padding: 6, background: "#f3f4f6", border: "1.5px dashed #d1d5db", borderRadius: 7, cursor: "pointer", fontSize: 11, color: "#6b7280", fontWeight: 500 }}>+ 컬러 추가 ({s.colors.length}/6)</button>}
            </Section>

            <Section num={7} title="제품정보" isOpen={openSecs[7]} onToggle={() => toggleSec(7)}>
              <Field label="사이즈 유형"><Input value={s.sizeType} onChange={v => set("sizeType", v)} placeholder="상의 / 하의" /></Field>
              <div style={{ overflowX: "auto", marginBottom: 9 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                  <thead><tr><th style={{ background: "#f3f4f6", padding: "4px 3px", border: "0.5px solid #e5e7eb" }}></th>{SIZE_COLS.map(c => <th key={c} style={{ background: "#f3f4f6", padding: "4px 3px", border: "0.5px solid #e5e7eb", fontWeight: 600 }}>{c}</th>)}</tr></thead>
                  <tbody>{SIZE_ROWS.map(row => (<tr key={row}><td style={{ background: "#f9fafb", padding: "3px 5px", border: "0.5px solid #e5e7eb", fontWeight: 600, whiteSpace: "nowrap", fontSize: 10, textAlign: "center" }}>{row}</td>{SIZE_COLS.map((_, i) => (<td key={i} style={{ border: "0.5px solid #e5e7eb", padding: 0 }}><input value={s.sizeData[row]?.[i] || ""} onChange={e => updateSizeData(row, i, e.target.value)} style={{ width: "100%", padding: "3px 2px", border: "none", fontSize: 10, textAlign: "center", background: "transparent" }} /></td>))}</tr>))}</tbody>
                </table>
              </div>
              {PRODUCT_INFO_ROWS.map(row => (
                <Field key={row.key} label={row.label}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {row.options.map(opt => (
                      <button key={opt} onClick={() => set("productInfo", { ...s.productInfo, [row.key]: opt })}
                        style={{ padding: "3px 9px", borderRadius: 20, border: "0.5px solid", fontSize: 10, cursor: "pointer", fontWeight: 500, borderColor: s.productInfo[row.key] === opt ? "#4f46e5" : "#e5e7eb", background: s.productInfo[row.key] === opt ? "#4f46e5" : "#fff", color: s.productInfo[row.key] === opt ? "#fff" : "#374151" }}>{opt}</button>
                    ))}
                  </div>
                </Field>
              ))}
              <Field label="세탁 아이콘">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {WASH_ICONS.map(w => (
                    <div key={w.id} onClick={() => { const has = s.washIcons.includes(w.id); set("washIcons", has ? s.washIcons.filter(id => id !== w.id) : [...s.washIcons, w.id]); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 5px", border: `1.5px solid ${s.washIcons.includes(w.id) ? "#4f46e5" : "#e5e7eb"}`, borderRadius: 6, cursor: "pointer", background: s.washIcons.includes(w.id) ? "#eef2ff" : "#fff", minWidth: 38 }}>
                      <img src={w.src} alt={w.label} style={{ width: 18, opacity: w.dimmed ? 0.3 : 0.8 }} />
                      <span style={{ fontSize: 8, textAlign: "center" }}>{w.label}</span>
                    </div>
                  ))}
                </div>
              </Field>
              <Field label="세탁 안내 문구"><Textarea value={s.washNote} onChange={v => set("washNote", v)} rows={2} /></Field>
              <Field label="제품 번호"><Input value={s.productNumber} onChange={v => set("productNumber", v)} placeholder="O26SB03G" /></Field>
              <Field label="소재" hint="줄바꿈으로 구분"><Textarea value={s.material} onChange={v => set("material", v)} rows={2} /></Field>
              <Field label="제조사/수입사"><Input value={s.manufacturer} onChange={v => set("manufacturer", v)} /></Field>
              <Field label="제조국"><Input value={s.madeIn} onChange={v => set("madeIn", v)} /></Field>
            </Section>

          </div>
        )}

        {tab === "preview" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ margin: "0 auto", maxWidth: 900 }}>
              <div style={{ background: "#e2e8f0", padding: "7px 14px", fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5, borderRadius: "10px 10px 0 0" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", display: "inline-block" }}></span>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fbbf24", display: "inline-block" }}></span>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                <span style={{ marginLeft: 8 }}>미리보기 · 860px</span>
              </div>
              <iframe ref={iframeRef} src="about:blank" style={{ width: "860px", height: "80vh", border: "none", background: "#fff", display: "block", borderRadius: "0 0 10px 10px" }} title="preview" />
            </div>
          </div>
        )}

        {tab === "html" && (
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ background: "#1e1e2e", borderRadius: 10, padding: 16 }}>
              <pre style={{ color: "#cdd6f4", fontSize: 11, margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "monospace" }}>{html}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
