import{t as e,e as l,c as U}from"./lazy-BPnoRbtf.js";import{V as Q,H,o as T,p as L,q as V,v as O,w as E,R as F,S as W,x as j,N as G,y as $,z as q,A as Z,B as Y,M as ee,D as _,E as te,F as ae,G as se,n as oe}from"./main-D4ay-rZD.js";import{I as ye}from"./main-D4ay-rZD.js";import{a as ne}from"./reference-Ct7Xg2F5.js";function re(){return[{name:e("VWAP with bands"),source:Q,place:"map"},{name:e("Stochastic heat map"),source:H},{name:e("Buyer and seller VWAPs"),source:`// Buyer and seller VWAPs: the average price aggressive buyers paid (what was bought at market, weighted by its dollars)
// and the average price aggressive sellers got, over the last candles, each with a band one deviation wide. Where the
// buyers' line is above the sellers', buying came in at higher prices than selling; where it is below, selling led.

len = option(type=number, default=48, min=2, step=1, label="Window (candles)")
mult = option(type=number, default=1, min=0.1, step=0.1, label="Band width (deviations)")
buyColor = option(type=color, default="rgb(0,170,140)", label="Buyers")
sellColor = option(type=color, default="rgb(230,60,110)", label="Sellers")
buyFill = option(type=color, default="rgba(0,170,140,0.10)", label="Buyers' band")
sellFill = option(type=color, default="rgba(230,60,110,0.10)", label="Sellers' band")

var typical = ($price.high + $price.low + $price.close) / 3

var bought = sum(vbuy, len)
var buyers = sum(typical * vbuy, len) / bought
var buyersSpread = Math.sqrt(Math.max(0, sum(typical * typical * vbuy, len) / bought - buyers * buyers))

var sold = sum(vsell, len)
var sellers = sum(typical * vsell, len) / sold
var sellersSpread = Math.sqrt(Math.max(0, sum(typical * typical * vsell, len) / sold - sellers * sellers))

cloudarea(buyers - mult * buyersSpread, buyers + mult * buyersSpread, positiveColor=buyFill, negativeColor=buyFill, higherLineColor=buyFill, lowerLineColor=buyFill)
cloudarea(sellers - mult * sellersSpread, sellers + mult * sellersSpread, positiveColor=sellFill, negativeColor=sellFill, higherLineColor=sellFill, lowerLineColor=sellFill)
line(buyers, title="Buyers", color=buyColor, lineWidth=2)
line(sellers, title="Sellers", color=sellColor, lineWidth=2)
`,place:"map"},{name:e("Liquidations"),source:`// Liquidations: shorts liquidated (forced buys) up in violet, longs liquidated (forced sells) down in amber. Heights are
// compressed so one cascade does not flatten every other bar. A bar is dim while the candle's liquidations are ordinary
// and burns to full as they become unusual against the last candles, so a cascade reads before you look at the axis.
// The line is the net pressure, brightening as it becomes unusual too.

compression = option(type=number, default=0.5, min=0.1, step=0.05, label="Height compression (1 = linear)")
win = option(type=number, default=72, min=10, step=1, label="Baseline window (candles)")
cascadeZ = option(type=number, default=2, min=0.5, step=0.1, label="Cascade at (deviations)")
pressureLen = option(type=number, default=21, min=1, step=1, label="Pressure smoothing (candles)")
dimAlpha = option(type=number, default=0.26, min=0.02, step=0.02, label="Quiet opacity")
showPressure = option(type=checkbox, default=true, label="Net pressure line")
markCandles = option(type=checkbox, default=false, label="Colour cascade candles")

var SHORT_RGB = "150,105,255"
var LONG_RGB = "255,196,64"
var PRESSURE_RGB = "130,130,150"

// A colour from a hue: at the quiet opacity while z is at or under 0, at full once it reaches the gate.
function heat(rgb, z, gate, floor) {
  var d = Math.min(1, Math.max(0, z) / Math.max(gate, Number.EPSILON))
  return "rgba(" + rgb + "," + (floor + (1 - floor) * d).toFixed(3) + ")"
}

// lbuy is the dollars of shorts liquidated in the candle (their positions were bought back), lsell the longs.
var shorts = lbuy
var longs = lsell
var up = Math.pow(shorts, compression)
var down = Math.pow(longs, compression)

// How unusual the candle's liquidations are: deviations from their average over the window.
var total = shorts + longs
var mean = sma(total, win)
var spread = Math.sqrt(Math.max(0, sma(total * total, win) - mean * mean))
var z = spread > Number.EPSILON ? (total - mean) / spread : 0

histogram({ time: time, value: up, color: heat(SHORT_RGB, z, cascadeZ, dimAlpha) }, title="Shorts liquidated")
histogram({ time: time, value: -down, color: heat(LONG_RGB, z, cascadeZ, dimAlpha) }, title="Longs liquidated")

var pressure = ema(up - down, pressureLen)
var pMean = sma(pressure, win)
var pSpread = Math.sqrt(Math.max(0, sma(pressure * pressure, win) - pMean * pMean))
var pZ = pSpread > Number.EPSILON ? Math.abs((pressure - pMean) / pSpread) : 0
if (showPressure) line({ time: time, value: pressure, color: heat(PRESSURE_RGB, pZ, 2, 0.3) }, title="Net pressure", lineWidth=2)

if (markCandles && z > cascadeZ) $price.color = shorts >= longs ? "rgb(150,105,255)" : "rgb(255,196,64)"
`},{name:e("Volume anomalies"),source:`// Volume anomalies: each candle's volume, in the buy colour where more was bought at market and the sell colour where more
// was sold. A bar is dim while its volume is ordinary and bright when it is more than Threshold deviations above its average
// over the last candles. A grey bar marks a candle whose delta (bought less sold) is unusual in the same way.

length = option(type=number, default=72, min=5, step=1, label="Baseline window (candles)")
mult = option(type=number, default=2, min=0.5, step=0.1, label="Threshold (deviations)")
upColor = option(type=color, default="rgba(0,190,165,0.25)", label="Bought")
downColor = option(type=color, default="rgba(235,40,130,0.25)", label="Sold")
upBright = option(type=color, default="rgb(0,190,165)", label="Bought, unusual")
downBright = option(type=color, default="rgb(235,40,130)", label="Sold, unusual")
deltaColor = option(type=color, default="rgba(128,128,128,0.8)", label="Unusual delta")
showDelta = option(type=checkbox, default=true, label="Mark unusual delta")
colorCandles = option(type=checkbox, default=false, label="Colour unusual candles")

var volume = vbuy + vsell
var delta = vbuy - vsell
var bought = vbuy > vsell

// Unusual: more than mult deviations above the average over the window.
var vMean = sma(volume, length)
var vSpread = Math.sqrt(Math.max(0, sma(volume * volume, length) - vMean * vMean))
var unusual = volume > vMean + mult * vSpread
var size = Math.abs(delta)
var dMean = sma(size, length)
var dSpread = Math.sqrt(Math.max(0, sma(size * size, length) - dMean * dMean))

histogram({ time: time, value: volume, color: unusual ? (bought ? upBright : downBright) : (bought ? upColor : downColor) }, title="Volume")
if (showDelta && size > dMean + mult * dSpread) histogram({ time: time, value: size, color: deltaColor }, title="Delta")

if (colorCandles && unusual) $price.color = bought ? upBright : downBright
`},{name:e("Cumulative delta"),source:`// What was bought at market less what was sold, added up candle after candle.
line(cum(vbuy - vsell), title=CVD)
`},{name:e("Spot and perpetual CVD"),source:`// The cumulative delta of the spot markets and of the perpetuals, apart.
spotColor = option(type=color, default=#2e9bff, label=Spot)
perpColor = option(type=color, default=#ff9f1c, label=Perpetual)
spotDelta = source(vbuy, type=spot) - source(vsell, type=spot)
perpDelta = source(vbuy, type=perp) - source(vsell, type=perp)
line(cum(spotDelta), title=Spot, color=spotColor)
line(cum(perpDelta), title=Perp, color=perpColor, priceScaleId=perp)
`},{name:e("Delta histogram"),source:`// Each candle's delta, in the buy colour where buyers led and the sell colour where sellers did.
up = option(type=color, default=rgb(38,166,154), label=Buys)
down = option(type=color, default=rgb(239,83,80), label=Sells)
var delta = vbuy - vsell
histogram({ time: time, value: delta, color: delta > 0 ? up : down }, title=Delta)
`},{name:e("Buy share"),source:`// The share of the volume bought at market over the last candles, in percent.
length = option(default=20, min=1, label=Candles)
line(100 * sum(vbuy, length) / sum(vbuy + vsell, length), title="Buy share %")
line(50, color=rgba(128,128,128,0.6), title=Even)
`}]}const le=n=>n===H?160:void 0,B=n=>!("program"in n);function fe(n,r){for(const i of r.querySelectorAll("[data-script-status]")){const t=n.records.find(d=>d.id===i.dataset.scriptStatus);if(!t)continue;const h=V(n,t);i.textContent!==h.text&&(i.textContent=h.text),i.classList.toggle("error",h.error)}}function z(n,r={}){if(B(n))return[];const i=n.declared.map(t=>({name:t.name,label:t.label??t.name,type:t.type,value:t.value,declared:!0,...t.min!==void 0?{min:t.min}:{},...t.max!==void 0?{max:t.max}:{},...t.step!==void 0?{step:t.step}:{}}));for(const t of n.read){const h=Object.prototype.hasOwnProperty.call(r,t)?r[t]:void 0,d=h!==void 0?h:ae(t),s=typeof d=="boolean"?"boolean":typeof d=="number"?"number":typeof d=="string"&&/^(#|rgb|hsl)/i.test(d)?"color":"text";i.push({name:t,label:t,type:s,value:d??"",declared:!1})}return i}function ge(n,r,i,t){const h=(o,g=!1)=>{t.message={text:o,error:g},i()},d=(o,g)=>{n.setRecords(o)?h(g):h(e("This browser did not let the page keep it."),!0)};if(t.editing){ce(n,r,i,t,d,h);return}r.append(T(e("Scripts draw your own indicators from the candles and the taker flow and liquidations of the exchanges on the page. Each runs on its own, apart from the page, and can read nothing else. Their language is the indicator-script language other charting pages use: JavaScript with plots and functions such as sma and ema."))),t.message&&r.append(l("p",{class:t.message.error?"panel-note layout-message error":"panel-note layout-message",textContent:t.message.text})),r.append(L(e("Your scripts")));const s=n.records;s.length||r.append(T(e("No scripts yet.")));for(const o of s){const g=V(n,o),c=l("input",{type:"checkbox",checked:o.on,ariaLabel:e("On")});c.onchange=()=>{c.checked&&n.showScripts(),d(s.map(v=>v.id===o.id?{...v,on:c.checked}:v),c.checked?e("“{name}” is on.",{name:o.name}):e("“{name}” is off.",{name:o.name}))};const x=t.armed===o.id,k=O(x?e("Sure?"):e("Delete"),()=>{if(!x){t.armed=o.id,i();return}t.armed=null,d(s.filter(v=>v.id!==o.id),e("Deleted “{name}”.",{name:o.name}))},e("Delete this script (press twice)"));x&&k.classList.add("armed");const C=O("↑",()=>{const v=s.indexOf(o);if(v>0){const A=[...s];[A[v-1],A[v]]=[A[v],A[v-1]],d(A,e("Moved “{name}”.",{name:o.name}))}},e("Move this script up (its row goes higher in the pane)"));C.disabled=s.indexOf(o)===0;const N=l("span",{class:`layout-date${g.error?" error":""}`,textContent:g.text});N.dataset.scriptStatus=o.id,r.append(l("div",{class:"layout-row script-row"},l("label",{class:"script-on"},c),O(o.name,()=>{t.editing=o.id,t.draft={name:o.name,source:o.source,options:{...o.options},place:o.place},t.message=null,i()},e("Open this script to change it")),N,C,k))}r.append(L(e("Add")));const p=s.length>=E;for(const o of re()){const g=o.place??"pane",c=O(e("Add"),()=>{n.showScripts(),d([...s,{id:j(o.name),name:o.name,source:o.source,options:{},on:!0,api:W,height:le(o.source)??F,place:g}],e("Added “{name}”.",{name:o.name}))},e("Add a ready-made script to start from"));c.disabled=p,r.append(l("div",{class:"layout-row script-example"},l("span",{class:"script-example-name",textContent:o.name}),l("span",{class:"layout-date",textContent:g==="map"?e("On the map"):e("In its own row")}),c))}const S=O(e("New script"),()=>{t.editing=G,t.draft={name:"",source:"",options:{},place:"pane"},t.message=null,i()},e("Write a script, or paste one (an indicator file or a workspace works too)"));S.disabled=p,r.append(l("div",{class:"layout-tools"},S)),p&&r.append(T(e("At most {n} scripts: delete one first.",{n:E})));const f=l("input",{type:"file",accept:".json,.txt,.js,application/json,text/plain",hidden:!0});f.onchange=()=>{const o=f.files?.[0];o&&o.text().then(g=>{const c=$(g,q(o.name.replace(/\.[a-z0-9]+$/i,""))??e("Imported script"));if("error"in c){h(c.error==="too-large"?e("The file is too large to be scripts."):c.error==="newer"?e("The file was written by a newer version of the page: update this page to read it."):e("The file holds no script this page can read."),!0);return}const x=Z(s,c.scripts.map(N=>({...N,on:!1}))),k=x.added+x.replaced,C=U(k,"Read {n} script: switch it on to run it.","Read {n} scripts: switch them on to run them.")+(x.skipped?` ${e("{n} did not fit: at most {max}.",{n:x.skipped,max:E})}`:"");k?d(x.list,C):h(C,!0)},()=>h(e("The file holds no script this page can read."),!0))};const w=O(e("Export"),()=>{const o=URL.createObjectURL(new Blob([Y(s)],{type:"application/json"}));l("a",{href:o,download:"liquiditymapperfast-scripts.json"}).click(),setTimeout(()=>URL.revokeObjectURL(o),1e4)},e("Write the scripts to a file, to keep them or use them in another browser"));w.disabled=!s.length,r.append(L(e("More")),l("div",{class:"layout-tools"},O(e("Import"),()=>f.click(),e("Read scripts from a file: one written by Export, an indicator file or a workspace from another charting page, or a script as text")),w,f)),r.append(L(e("Language")),...ie().map(o=>T(o))),r.append(l("p",{class:"panel-note"},l("a",{href:"./script-reference.md",target:"_blank",rel:"noopener",textContent:e("The full language reference")})))}function ie(){return[e("Each candle runs the script once. A name set without var (x = ...) keeps its value from candle to candle and starts at 0; x[1] is its value one candle back. A var starts again each candle."),e("Inputs: time (seconds), vbuy, vsell (dollars bought and sold at market), lbuy, lsell (dollars of shorts and longs liquidated), $price.open, .high, .low, .close (the chart's candle), renderer.length (candles so far), options.name."),e("source(vbuy, type=spot, exchange=BINANCE, quote=USDT) reads over those markets only (the flow column's markets are the rest). Options: name = option(default=14, type=number|color|checkbox|text, label=...)."),e("Functions: sma, ema, rma, sum, cum, cma, highest, lowest, last, linreg, stoch, pivot_high, pivot_low, avg, avg_ohlc, heikinashi, ohlc, cum_ohlc, interpolate; Math and Number as in JavaScript."),e("Plots: line, histogram, area, baseline, candlestick, plotbar, cloudarea, brokenarea, each with title=, color=, lineWidth=, priceScaleId=, scaleMargins=. A point can be an object: {time: time, value: x, color: c}."),e("Not here: trade counts (cbuy, csell read NaN), single markets by name (EXCHANGE:pair), the chart library's series objects, try, switch. A candle that was not recorded reads NaN and draws nothing; the functions skip it.")]}function ce(n,r,i,t,h,d){const s=t.draft??={name:"",source:"",options:{},place:"pane"},p=n.records.find(a=>a.id===t.editing)??null,S=l("input",{type:"text",class:"layout-name",maxLength:40,placeholder:e("Name"),ariaLabel:e("Name"),value:s.name});S.oninput=()=>{s.name=S.value};const f=l("textarea",{class:"script-source",spellcheck:!1,rows:16,ariaLabel:e("Script"),placeholder:e("line(cum(vbuy - vsell), title=CVD)"),value:s.source});f.maxLength=ee,f.wrap="off",f.oninput=()=>{s.source=f.value},f.onkeydown=a=>{if(a.key!=="Tab"||a.shiftKey)return;a.preventDefault();const u=f.selectionStart,m=f.selectionEnd;f.setRangeText("  ",u,m,"end"),s.source=f.value};const w=l("select",{ariaLabel:e("Where")});w.append(new Option(e("In its own row"),"pane"),new Option(e("On the map"),"map")),w.value=s.place,w.onchange=()=>{s.place=w.value==="map"?"map":"pane"};const o=l("label",{class:"row script-option",tip:e("A row of its own in this pane, or on the map: the plots on the price scale (the default) at their prices, the others each on a scale of their own.")},l("span",{textContent:e("Draw")}),w);r.append(l("div",{class:"layout-save"},S),o,f);const g=a=>a?"panel-note layout-message error":"panel-note layout-message";let c=t.message?l("p",{class:g(t.message.error),textContent:t.message.text}):null;c&&r.append(c);const x=(a,u)=>{f.isConnected&&(t.message={text:a,error:u},c||(c=l("p"),f.after(c)),c.className=g(u),c.textContent=a)};if(p){const a=n.resultOf(p.id);a&&!a.ok&&r.append(l("p",{class:"panel-note layout-message error",textContent:_(a.error)}));const u=[...n.warningsOf(p.id),...a?.ok?a.warnings:[]];for(const m of u)r.append(T(te(m)))}const k={id:p?.id??G,name:s.name||"x",source:s.source,options:s.options,on:!0,api:W,height:F,place:s.place},C=z(n.analysisOf(k),s.options);if(C.length){r.append(L(e("Options")));for(const a of C){const u=a.name in s.options?s.options[a.name]:a.value;let m;a.type==="boolean"?(m=l("input",{type:"checkbox",checked:u===!0||u===1}),m.onchange=()=>{s.options[a.name]=m.checked}):a.type==="number"||a.type==="range"?(m=l("input",{type:"number",value:typeof u=="number"?String(u):"",step:a.step!==void 0?String(a.step):"any"}),m.oninput=()=>{const y=Number(m.value);m.value.trim()===""?delete s.options[a.name]:Number.isFinite(y)&&(s.options[a.name]=y)}):(m=l("input",{type:"text",value:typeof u=="string"?u:u==null?"":JSON.stringify(u)}),m.oninput=()=>{const y=m.value.trim();s.options[a.name]=a.type==="text"&&!a.declared&&y!==""&&Number.isFinite(Number(y))?Number(y):m.value}),m.ariaLabel=a.label,r.append(l("label",{class:"row script-option"},l("span",{textContent:a.label}),m))}}const N=()=>{t.editing=null,t.draft=null,i()},v=()=>{const a=s.source;if(a.trim().startsWith("{")){const b=$(a,q(s.name)??e("Pasted script"));if("scripts"in b&&b.scripts.length&&b.scripts[0].source!==a.replace(/\r\n?/g,`
`)){const K=n.records.filter(I=>I.id!==p?.id),D=Z(K,b.scripts.map(I=>({...I,on:!1})));t.editing=null,t.draft=null,h(D.list,U(D.added+D.replaced,"Read {n} script: switch it on to run it.","Read {n} scripts: switch them on to run them."));return}}const u=q(s.name)??q(a.split(`
`).find(b=>b.trim())?.replace(/^\/\/\s*/,"").slice(0,30))??e("Script"),m=n.analysisOf({...k,source:a});if(B(m)){d(_(m),!0);return}const y={...s.options};for(const b of z(m,y))!(b.name in y)&&b.value!==""&&(y[b.name]=b.value);const R=p?n.records.find(b=>b.id===p.id)??p:null,M={id:R?.id??j(u),name:u,source:a.replace(/\r\n?/g,`
`),options:y,on:R?.on??!0,api:R?.api??W,height:R?.height??F,place:s.place},X=p?n.records.map(b=>b.id===p.id?M:b):[...n.records,M];if(!p&&n.records.length>=E){d(e("At most {n} scripts: delete one first.",{n:E}),!0);return}t.editing=M.id,t.draft={name:M.name,source:M.source,options:{...M.options},place:M.place},p||n.showScripts(),h(X,e("Saved “{name}”: it runs with the next update.",{name:M.name}))},A=()=>{const a=n.analysisOf({...k,source:s.source});d(B(a)?_(a):e("The script reads."),B(a))},J=()=>{const a=ne(pe(n,s,p,k));ue(a).then(u=>x(u?e("Copied. Paste it into your AI assistant, then paste its answer back here and press Check."):e("This browser did not let the page copy."),!u))},P=(a,u,m,y)=>{const R=O(a,u,m);return R.dataset.focus=`script-${y}`,R};r.append(l("div",{class:"layout-tools"},P(e("Save"),v,e("Keep the script and run it"),"save"),P(e("Copy for AI"),J,e("Copy the script, its errors and what it drew, with the language's rules, to paste into an AI assistant"),"ai"),P(e("Check"),A,e("Read the script without saving it, to see whether it reads"),"check"),P(e("Back"),N,e("Back to the list (what is not saved is dropped)"),"back")))}function pe(n,r,i,t){const h=n.analysisOf({...t,source:r.source}),d=i?n.records.find(c=>c.id===i.id)??null:null,s=d&&d.source===r.source&&se(d.options,r.options)?d:null,p=s?n.resultOf(s.id):null,S=s&&p?.ok?n.ranOn(s.id):null,f=B(h)?[h]:p&&!p.ok?[p.error]:[],w=s?n.warningsOf(s.id):[],o=B(h)?[]:p?.ok?[...w,...p.warnings]:[...h.warnings,...w],g=p?.ok&&S?p.plots.map(c=>({title:c.title,kind:c.kind,last:oe(c,S.candles)})):[];return{name:r.name,source:r.source,place:r.place,options:r.options,errors:f,warnings:o,plots:g,chart:S}}async function ue(n){try{return await navigator.clipboard.writeText(n),!0}catch{}const r=document.activeElement,i=l("textarea",{value:n});i.readOnly=!0,i.style.position="fixed",i.style.left="-10000px",i.style.top="0",i.style.opacity="0",document.body.append(i),i.select();try{return document.execCommand("copy")}catch{return!1}finally{i.remove(),r instanceof HTMLElement&&r.isConnected&&r.focus({preventScroll:!0})}}export{ge as buildScriptsPanel,ye as panelClosed,fe as refreshStatuses};
