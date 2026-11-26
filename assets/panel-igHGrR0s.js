import{e as d,t as e,c as Y}from"./lazy-BPnoRbtf.js";import{V as ie,o as le,H as Q,p as de,q as he,t as ce,v as ue,w as pe,x as E,y as me,A as we,B as ee,D as L,E as te,F as N,G as P,R as G,S as Z,N as ae,I as oe,J as F,K as ne,L as be,M as fe,O as z,Q as ge,U as K,W as ve,X as ye,Y as ke,Z as xe,_ as Se,$ as Ce,n as Te}from"./main-CKomExoT.js";import{a0 as je}from"./main-CKomExoT.js";import{a as Ae}from"./reference-TeRFjyvI.js";async function Ne(n){try{return await navigator.clipboard.writeText(n),!0}catch{}const t=document.activeElement,r=d("textarea",{value:n});r.readOnly=!0,r.style.position="fixed",r.style.left="-10000px",r.style.top="0",r.style.opacity="0",document.body.append(r),r.select();try{return document.execCommand("copy")}catch{return!1}finally{r.remove(),t instanceof HTMLElement&&t.isConnected&&t.focus({preventScroll:!0})}}let U=null;function j(){U&&(window.clearTimeout(U.timer),U.root.remove(),U=null)}function Oe(n,t={}){j();const r=(t.actions?.length??0)>1,a=d("div",{class:`toast${r?" toast-many":""}`,role:"status"},d("span",{class:"toast-text",textContent:n}));for(const{label:u,run:c}of t.actions??(t.action?[t.action]:[]))a.append(d("button",{type:"button",class:"toast-action",textContent:u,onclick:()=>{j(),c()}}));document.body.append(a),U={root:a,timer:window.setTimeout(j,t.ms??9e3)}}function $(){return[{key:le,name:e("VWAP with bands"),source:ie,place:"map"},{key:de,name:e("Stochastic heat map"),source:Q},{key:ce,name:e("Spot and perpetual CVD"),source:he},{key:pe,name:e("Strong and weak highs and lows"),source:ue,place:"map"},{key:"depth-bands",name:e("Depth bands"),place:"map",source:`// Depth bands: how far a given number of dollars of the order book reaches from the close, on the books the page recorded.
// Above the close, the price at which that many dollars of the book are passed going up; below it, going down. It shows
// the liquidity typically recorded near the price, not what a market order of that size would pay.
// A wide band is a thin book: the same money moves the price further. Each candle's book is the one recorded at its close
// (its last minute), on every exchange the heat map shows, added up as one book.

// The size: a number of dollars, or a share of what an average candle traded at market (the band then means the same
// on a quiet day and a busy one, and on any coin; it widens with the timeframe, as candles trade more). On Bitcoin's
// books added up, $250M reached about 0.2 % from the close on 2026-10-30 at every timeframe.
size = option(type=number, default=250000000, min=100000, step=1000000, label="Size ($)")
byVolume = option(type=checkbox, default=false, label="Size from the volume")
share = option(type=number, default=0.1, min=0.01, step=0.01, label="Share of a candle's volume")
len = option(type=number, default=20, min=1, step=1, label="Volume window (candles)")
fill = option(type=color, default="rgba(128,128,128,0.08)", label="Fill")

// askdepth(x) and biddepth(x) are prices: the asks above the close, the bids below it; NaN where the book was not
// recorded for the candle, or holds less than x. depthatclose() is false where the books are averages over the candle (a
// server from before): there a move within the candle reads the side the price came from as thin, so depthabove(x) and
// depthbelow(x), which count every dollar recorded at each price, stand in.
var usd = byVolume ? share * sma(vbuy + vsell, len) : size
var atclose = depthatclose()
var upper = atclose ? askdepth(usd) : depthabove(usd)
var lower = atclose ? biddepth(usd) : depthbelow(usd)
// The lines in the theme's ink: the heat map under them is drawn in the page's own two colours, which would hide lines of either.
var ink = theme.dark ? "#f2f2f2" : "#1c1c1c"
cloudarea(lower, upper, positiveColor=fill, negativeColor=fill, higherLineColor=ink, lowerLineColor=ink, higherLineWidth=2, lowerLineWidth=2, title="Depth bands")
`},{key:"bar-patterns",name:e("Bar patterns"),source:`// Bar patterns: what each candle did to the range of the candle before it, and the few patterns that follow from that,
// marked where they happen, with what the order flow did there.
//
// A candle can do four things to the range before it: stay inside it (in), go past both ends (out), or go past one
// end, the high (up) or the low (down). A candle is compared only with the one just before it in time. From that:
//   Breakout       a candle stayed inside the one before, and the next broke out of it and closed outside it: a quiet
//                  range gave way.
//   Failed break   a candle broke out of the one before, and the next went back past the far end of that breakout candle
//                  and closed beyond it: whoever followed the break is now on the wrong side of it.
//   Rejection      a candle went past the end before, closed back inside, and its wick on that side is at least twice
//                  the rest of the candle: the prices beyond were refused.
//   Outside        a candle went past both ends of the one before and closed beyond one of them.
// A breakout and a failed break each have a break level (the price they went through) and a next level: the far side of
// the range before. Point at a mark to read them, whether the next level was reached in that candle, what was bought
// and sold at market, the liquidations, the change in open interest, and where the day's, week's and month's opens
// stood (UTC, the week from Monday; the hour's too on charts shorter than an hour). These describe what candles did. No
// test has shown that they say where price goes next. The candle under way is marked as it stands and can change; an
// alert waits for the close.

showRange = option(type=checkbox, default=true, label="Mark inside and outside candles")
showAll = option(type=checkbox, default=false, label="Mark up and down candles too")
showPatterns = option(type=checkbox, default=true, label="Mark patterns")
showEveryFail = option(type=checkbox, default=false, label="Every failed break (frequent), not only after an inside or outside candle")
showLevels = option(type=checkbox, default=true, label="Draw the break and next levels")
showWaiting = option(type=checkbox, default=true, label="After an inside candle, show its break levels until the candle under way goes past them")
paint = option(type=checkbox, default=false, label="Colour inside and outside candles")
sound = option(type=checkbox, default=false, label="Alert when a breakout or failed break closes")

hi = $price.high
lo = $price.low
op = $price.open
cl = $price.close
stamp = time

// The colours follow the page's theme: up and down as its candles are, and the words in and out in its text colour, dimmer for in.
var upColor = theme.up
var downColor = theme.down
var quiet = interpolate(0.7, theme.background, theme.text)
var loud = theme.text

// A candle is compared with the one just before it in time, both with prices: the first candle, and the one after a gap in
// the chart's candles, have nothing to compare with.
var follows = stamp - stamp[1] == renderer.timeframe && hi >= lo && hi[1] >= lo[1]
// What it did to the range before: 1 inside, 3 outside, 2 up, -2 down; 0 with nothing to compare with.
var tookHigh = follows && hi > hi[1]
var tookLow = follows && lo < lo[1]
move = !follows ? 0 : tookHigh && tookLow ? 3 : tookHigh ? 2 : tookLow ? -2 : 1
var IN = 1, OUT = 3, UP = 2, DOWN = -2

function group(s) {
  var parts = s.split(".")
  var w = parts[0], out = ""
  while (w.length > 3) { out = "," + w.slice(w.length - 3) + out; w = w.slice(0, w.length - 3) }
  return w + out + (parts.length > 1 ? "." + parts[1] : "")
}
function px(x) { return group(x.toFixed(x >= 1000 ? 0 : x >= 100 ? 1 : x >= 1 ? 2 : x >= 0.01 ? 4 : 6)) }
function usd(x) {
  var a = Math.abs(x)
  var s = a >= 1e9 ? (a / 1e9).toFixed(2) + "B" : a >= 1e6 ? (a / 1e6).toFixed(1) + "M" : a >= 1e3 ? (a / 1e3).toFixed(0) + "K" : a.toFixed(0)
  return (x < 0 ? "-$" : "$") + s
}
function list(words) { return words.length < 2 ? words.join("") : words.slice(0, words.length - 1).join(", ") + " and " + words[words.length - 1] }

// The opens of the hour, day, week (from Monday) and month under way, in UTC, from the chart's own candles: known only once
// the chart reaches back to the candle where that period began.
var days = Math.floor(time / 86400)
var dayStart = days * 86400
var weekStart = (days - (days + 3) % 7) * 86400
var hourStart = Math.floor(time / 3600) * 3600
if (time == hourStart) { hOpen = op; hAt = hourStart }
if (time == dayStart) {
  dOpen = op; dAt = dayStart
  if (new Date(time * 1000).getUTCDate() == 1) { mOpen = op; mAt = dayStart }
}
if (time == weekStart) { wOpen = op; wAt = weekStart }

// Where a price stands against those opens, as one or two short sentences beginning with \`what\`.
function opens(price, what) {
  var over = [], under = [], at = [], unknown = []
  function one(name, open, since, start) {
    if (since != start) unknown.push(name)
    else if (price > open) over.push(name)
    else if (price < open) under.push(name)
    else at.push(name)
  }
  var date = new Date(time * 1000)
  if (renderer.timeframe < 3600) one("hour", hOpen, hAt, hourStart)
  one("day", dOpen, dAt, dayStart)
  one("week", wOpen, wAt, weekStart)
  one("month", mOpen, mAt, Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1) / 1000)
  var where = []
  if (over.length) where.push("above the " + list(over) + " open" + (over.length > 1 ? "s" : ""))
  if (under.length) where.push("below the " + list(under) + " open" + (under.length > 1 ? "s" : ""))
  if (at.length) where.push("at the " + list(at) + " open" + (at.length > 1 ? "s" : ""))
  var lines = []
  if (where.length) lines.push(what + " " + where.join(", ") + ".")
  if (unknown.length) lines.push("The " + list(unknown) + " open" + (unknown.length > 1 ? "s are" : " is") + " not on the chart.")
  return lines.join("\\n")
}

// What was traded at market and liquidated in this candle, over the venues the flow column adds up (where this page did not
// record them, Binance's markets alone, from their own candles: bar.recorded is 0 there), and the change in open interest over
// the venues the OI pane adds up.
function flow() {
  var out = []
  var lead = " led by " + usd(Math.abs(vbuy - vsell)) + " (bought at market " + usd(vbuy) + ", sold " + usd(vsell) + ")"
  if (isNaN(vbuy) || isNaN(vsell)) out.push("Market orders were not recorded in this candle")
  else if (bar.recorded == 0) out.push("On Binance alone, " + (vbuy >= vsell ? "buyers" : "sellers") + lead)
  else out.push((vbuy >= vsell ? "Buyers" : "Sellers") + lead)
  if (!isNaN(lbuy) && !isNaN(lsell)) out.push(lbuy > 0 || lsell > 0 ? "Liquidated: shorts " + usd(lbuy) + ", longs " + usd(lsell) : "No liquidations recorded")
  if (!isNaN(oichg)) out.push("Open interest " + (oichg >= 0 ? "rose by " + usd(oichg) + " (positions opened)" : "fell by " + usd(-oichg) + " (positions closed)"))
  return out.join("\\n")
}

// The pattern this candle completes upward (rising = 1) or downward (rising = 0), or null: its name, what happened, the level it
// broke and the next level (NaN where it has none). At most one of the two directions fits a candle.
var m1 = move[1], m2 = move[2]
function pattern(rising) {
  var dir = rising ? UP : DOWN, against = rising ? DOWN : UP
  var closedBeyond = rising ? cl > hi[1] : cl < lo[1]
  // Past both ends of the candle before, and closed beyond one of them.
  if (move == OUT && closedBeyond) return { name: "Outside", what: "It went past both ends of the candle before and closed " + (rising ? "above its high (" + px(hi[1]) : "below its low (" + px(lo[1])) + ").", level: NaN, next: NaN }
  // Past one end of the candle before, closed back inside, and a wick on that side at least twice the rest of the candle.
  var range = hi - lo, wick = rising ? Math.min(op, cl) - lo : hi - Math.max(op, cl)
  if (range > 0 && wick * 3 >= range * 2 && (rising ? tookLow && cl > lo[1] : tookHigh && cl < hi[1]))
    return { name: "Rejection", what: "It went " + (rising ? "below the low (" + px(lo[1]) : "above the high (" + px(hi[1])) + ") of the candle before and closed back inside, with " + (rising ? "a lower" : "an upper") + " wick " + Math.round(100 * wick / range) + "% of the candle: the prices " + (rising ? "below" : "above") + " were refused.", level: NaN, next: NaN }
  // One end only, and a close beyond it.
  if (move != dir || !closedBeyond) return null
  var next = rising ? hi[2] : lo[2]
  // The candle before stayed inside the one before it.
  if (m1 == IN) return { name: "Breakout", what: "The candle before stayed inside the one before it. This one broke " + (rising ? "above" : "below") + " the inside candle's " + (rising ? "high" : "low") + " and closed " + (rising ? "above" : "below") + " it.", level: rising ? hi[1] : lo[1], next: next }
  // The candle before broke out of the one before it, and this one went back past its far end.
  if (m1 == against && (showEveryFail || m2 == IN || m2 == OUT)) return { name: "Failed break", what: "The candle before broke " + (rising ? "below" : "above") + (m2 == IN ? " an inside candle (a pause)" : m2 == OUT ? " an outside candle" : " the one before it") + ". This one went back " + (rising ? "above the high" : "below the low") + " of the candle before and closed " + (rising ? "above" : "below") + " it: the break failed.", level: rising ? hi[1] : lo[1], next: next }
  return null
}

var found = null, rising = 1
if (showPatterns) { found = pattern(1); if (!found) { found = pattern(0); rising = 0 } }

if (found) {
  var tint = rising ? upColor : downColor
  var levelled = !isNaN(found.level)
  var more = levelled && !isNaN(found.next) && found.next != found.level
  var lines = [found.what]
  if (renderer.forming) lines.push("Still under way: this can change.")
  if (levelled) {
    lines.push("Break level " + px(found.level) + (more ? "; next level " + px(found.next) + " (the " + (rising ? "high" : "low") + " two candles back), " + ((rising ? hi >= found.next : lo <= found.next) ? "reached" : "not reached: the furthest " + px(rising ? hi : lo)) + (renderer.forming ? " so far" : "") : ""))
  }
  lines.push(flow())
  lines.push(opens(levelled ? found.level : cl, levelled ? "Break level" : "Close"))
  var sign = found.name + (rising ? " ↑" : " ↓")
  // Below the candle for a pattern up, above it for one down.
  if (rising) mark({value: lo, text: sign, tip: lines.join("\\n"), color: tint}, title="Pattern up", position=below, offset=2, shape=label)
  else mark({value: hi, text: sign, tip: lines.join("\\n"), color: tint}, title="Pattern down", position=above, offset=2, shape=label)
  if (levelled && showLevels) {
    line({value: found.level, color: tint}, title="Break level", lineType=1, lineStyle=2, lineWidth=1)
    if (more) line({value: found.next, color: tint}, title="Next level", lineType=1, lineStyle=1, lineWidth=1)
  }
  if (sound && levelled) alert(sign + " closed " + (rising ? "above " : "below ") + px(found.level), sound=rising ? "rise" : "fall", when=close)
}

// The candle under way, right after an inside candle and not yet past either end of it: the two levels it would break out at.
if (showWaiting && renderer.forming && m1 == IN && move == IN) {
  line(hi[1], title="Breakout up at", lineType=1, lineStyle=2, color=upColor)
  line(lo[1], title="Breakout down at", lineType=1, lineStyle=2, color=downColor)
  mark({value: hi[1], text: "waiting", tip: "The candle before stayed inside the one before it, and this one is still within it. A breakout needs a close above " + px(hi[1]) + " or below " + px(lo[1]) + ", without going past the other end.\\n" + flow(), color: quiet}, title="Waiting", position=above, shape=text, size=0.9)
}

// Each candle's word under it: inside and outside, and up and down when asked for. A candle with a pattern says it there.
if (!found && ((showRange && (move == IN || move == OUT)) || (showAll && move != 0))) {
  var what = move == IN ? "Inside: it stayed within the high (" + px(hi[1]) + ") and the low (" + px(lo[1]) + ") of the candle before."
    : move == OUT ? "Outside: it went past both the high (" + px(hi[1]) + ") and the low (" + px(lo[1]) + ") of the candle before, and " + (cl > hi[1] ? "closed above that high." : cl < lo[1] ? "closed below that low." : "closed between them.")
    : move == UP ? "Up: it went above the high of the candle before (" + px(hi[1]) + ") and held its low, and " + (cl > hi[1] ? "closed above that high." : "did not close above it.")
    : "Down: it went below the low of the candle before (" + px(lo[1]) + ") and held its high, and " + (cl < lo[1] ? "closed below that low." : "did not close below it.")
  mark({value: lo, text: move == IN ? "in" : move == OUT ? "out" : move == UP ? "up" : "down", tip: what + (renderer.forming ? "\\nStill under way: this can change." : ""), color: move == IN ? quiet : move == OUT ? loud : move == UP ? upColor : downColor}, title="Candle", position=below, shape=text, size=0.85)
}

if (paint && move == IN) $price.color = quiet
if (paint && move == OUT) $price.color = loud
`,place:"map"},{key:"buyer-and-seller-vwaps",name:e("Buyer and seller VWAPs"),source:`// Buyer and seller VWAPs: the average price aggressive buyers paid (what was bought at market, weighted by its dollars)
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
`,place:"map"},{key:"liquidations",name:e("Liquidations"),source:`// Liquidations: shorts liquidated (forced buys) up in violet, longs liquidated (forced sells) down in amber. Heights are
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
`},{key:"volume-anomalies",name:e("Volume anomalies"),source:`// Volume anomalies: each candle's volume, in teal where more was bought at market and pink where more
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
`},{key:"cumulative-delta",name:e("Cumulative delta"),source:`// What was bought at market less what was sold, added up candle after candle.
line(cum(vbuy - vsell), title=CVD)
`},{key:"delta-histogram",name:e("Delta histogram"),source:`// Each candle's delta, in green where buyers led and red where sellers did.
up = option(type=color, default=rgb(38,166,154), label=Buys)
down = option(type=color, default=rgb(239,83,80), label=Sells)
var delta = vbuy - vsell
histogram({ time: time, value: delta, color: delta > 0 ? up : down }, title=Delta)
`},{key:"buy-share",name:e("Buy share"),source:`// The share of the volume bought at market over the last candles, in percent.
length = option(default=20, min=1, label=Candles)
line(100 * sum(vbuy, length) / sum(vbuy + vsell, length), title="Buy share %")
line(50, color=rgba(128,128,128,0.6), title=Even)
`}]}const Me=n=>n===Q?160:void 0,Ie=()=>({"vwap-with-bands":{tip:e("The average price of the last 48 candles, weighted by how much traded in each, with a band on either side."),body:[e("The middle line is where money changed hands on average over that window: price above it trades above the recent average deal, below it under. The bands sit 1.8 deviations away (the usual distance of prices from that average), so a price at a band is stretched by the standard of the last candles."),e("Unlike a session VWAP, which starts again each day, it rolls with the candles on any timeframe, and it weighs each candle by what was bought and sold at market (by orders that trade at once) on every exchange the flow column adds up."),e("It needs the trades the page has recorded, so older candles leave a gap. As an average of the past it lags, and a price beyond a band is not by itself a sign that it will turn. The window and the band width are settings.")]},"stochastic-heat-map":{tip:e("Where the close stands in its recent range, over sixteen lookbacks at once: a row of colour each, from 4 candles at the bottom to 210 at the top."),body:[e("Each row is a stochastic: 0 when the close is at its window's lowest low, 100 at its highest high. Blue is near the top, red-orange near the bottom, grey the middle; the line is the average of all sixteen."),e("One look shows whether a move is short or broad: when only the bottom rows turn, the move is recent and the longer windows have not followed; a column of one colour means every window agrees, which a stochastic with a single window cannot show."),e("Its colours follow the page's theme and stay apart for colour-blind eyes, and an option colours the map's candles by the average. It says where price sits in its ranges, not where it goes next: a market can stay blue for a long time while it climbs.")]},"depth-bands":{tip:e("How far a given dollar size of the order book the page recorded reaches from the close, up and down."),body:[e("The upper line is how far up from the close that many dollars of asks reach, on every exchange the map shows added up as one, the lower how far down that many dollars of bids reach. Each candle's book is the one recorded in its last minute, as the candle closed."),e("The size is a number of dollars, or a share of what an average candle traded at market. A wide band is a thin book. Unlike Bollinger bands, which measure how far prices moved, it measures how much stands in the way."),e("Candles from before the page's recording have no band. Books change all the time, and an order this large would meet orders that are hidden or that move away: it shows the liquidity typically recorded there, not what such an order would pay.")]},"bar-patterns":{tip:e("Labels what each candle did to the range of the one before it, and marks the patterns that follow from that."),body:[e("“in” marks an inside candle (within the range of the one before), “out” an outside one (past both its ends). Arrows mark patterns: a breakout of an inside candle, a failed break (one the next candle took back), a rejection (a long wick past the candle before, closing back inside: hammers and shooting stars) and an engulfing candle."),e("For a breakout or failed break, the dashed line is the break level it went through and the dotted one the next level, the far side of the range it moves into. Point at a mark for its levels, its candle's order flow, liquidations and open interest, and where it stood against the day's, week's and month's opens (and the hour's, on charts of an hour or less)."),e("These describe what candles did: no test has shown that they say where price goes next. A mark on the candle under way can still change; an alert, off by default, sounds when a breakout or failed break forms.")]},"buyer-and-seller-vwaps":{tip:e("Two averages over the last 48 candles: the price aggressive buyers paid and the price aggressive sellers got, each with a band."),body:[e("Aggressive buyers and sellers are market orders, which trade at once against the orders waiting in the book. The buyers' line weighs each candle's typical price by what was bought that way, the sellers' line by what was sold. Where the buyers' line is above the sellers', buying was done at higher prices than selling over the window; where it is below, selling was."),e("A single VWAP blends both sides into one line. Keeping them apart shows which side has been dealing higher up, how far apart the two are, and when they cross. Each band is one deviation of that side's prices, a setting."),e("It needs the trades the page has recorded, so older candles leave a gap. A cross describes the window behind it; it has not been tested as a signal.")]},liquidations:{tip:e("Positions the exchanges closed by force, candle by candle: shorts as violet bars up, longs as amber bars down, brighter when unusual."),body:[e("A liquidation happens when a trader's margin runs out and the exchange closes the position with a market order: a short is bought back, a long is sold. Heights are compressed, so one cascade does not flatten every other bar."),e("A bar stays dim while the candle's liquidations are ordinary and burns to full colour as they reach two deviations above their average of the last 72 candles, so a cascade stands out before you read the axis. The grey line is the net pressure, shorts less longs, smoothed; it brightens when that is unusual too."),e("Only some exchanges publish their liquidations, and Binance only its largest each second, so the bars show fewer than happened. They say which side was forced out, not what comes next.")]},"volume-anomalies":{tip:e("Each candle's volume, coloured by whether more was bought or sold at market, and bright where the volume is unusual."),body:[e("Teal where more was bought by market orders (the ones that trade at once), pink where more was sold. A bar is dim while its volume is ordinary and bright when it is far above its usual level: more than two deviations above its average of the last 72 candles. A grey bar marks a candle whose delta, bought less sold, is unusual in the same way."),e("Unusual is judged against the market's own recent candles, so the same rule finds the outliers of a quiet night and of a busy session. It is a quick way to find where activity really stepped up and which side drove it; an option colours those candles on the map too."),e("It needs the trades the page has recorded, so older candles have no bars. A burst of volume says that something happened, not which way price goes next.")]},"cumulative-delta":{tip:e("What was bought at market less what was sold, added up candle after candle across the chart: the cumulative volume delta, or CVD."),body:[e("A rising line means more was bought than sold by market orders (the ones that trade at once); a falling one, the opposite. Read its shape against the price: a price that climbs while the line sinks is rising without buying at market behind it, a divergence that has not been tested as a signal."),e("It is the shortest script here, a single line, and a good one to start writing your own from. The Delta pane draws the same sum as candles, with restarts each day or week and its divergences marked."),e("It starts at zero on the chart's first candle, so its shape matters, not its level. Candles from before the page recorded trades add nothing.")]},"spot-and-perpetual-cvd":{tip:e("Two cumulative deltas kept apart: one over the spot markets, in blue, and one over the perpetual futures, in amber."),body:[e("Spot is coins bought and sold outright; perpetuals are futures with no expiry, traded with leverage. Each line adds up what was bought less what was sold at market in its own kind of market, on a scale of its own, since perpetuals usually trade far more: compare shapes and directions, not heights."),e("When the two move together, both kinds of market agree. When the perpetual line climbs while spot falls, the buying is in leveraged futures rather than in coins changing hands, or the other way round: it shows which kind of market carries a move."),e("Only the markets of the exchanges switched on count, from when the page recorded their trades; as with any CVD, its level depends on where the chart starts."),e("A label at each line's newest value gives its move over the lookback (20 candles) and calls it rising, falling or flat: flat when the move is under a quarter of the line's path, candle by candle.")]},"strong-and-weak-highs-and-lows":{tip:e("The swing highs and lows as levels on the map, named strong or weak as traders of market structure read them."),body:[e("A swing high is a candle whose high is above those of the five candles each side of it; a swing low, likewise below. Each one's level is drawn from its own candle once the five after it have closed, so it appears five candles late and never moves."),e("A low is strong once the rise away from it breaks the swing high it fell from (buyers took over there), and weak until then; a high, likewise, once the fall from it breaks the low it rose from. A level runs on to the right edge with its name and price until the price trades at it again; a tested one ends there, hidden unless Tested levels shows it, with a cross."),e("The swing size, whether a break counts by the close or the wick, the colours and the names are settings. It maps where the structure stands, not where price goes: whether a weak level draws price back or a strong one holds has not been tested here.")]},"delta-histogram":{tip:e("Each candle's delta, what was bought at market less what was sold, as a bar: up in green where buyers led, down in red where sellers did."),body:[e("Unlike the cumulative delta, each bar stands on its own, so it shows the moments rather than the running total: a tall bar is a candle where one side's market orders, the ones that trade at once, clearly outweighed the other's."),e("Set it against what the price did in the same candle: a large buying delta with little rise means the buying met plenty of sellers waiting in the book; a large delta with a big move means it went through them."),e("It needs the trades the page has recorded, so older candles have no bars. It is in dollars, so the bars grow with the price and with activity.")]},"buy-share":{tip:e("The share of the volume bought at market over the last 20 candles, in percent, with a line at 50 where both sides are even."),body:[e("Above 50, market orders (the ones that trade at once) bought more than they sold over the window; below 50, they sold more. Because it is a share, it reads the same on a quiet day as on a busy one, and on any coin."),e("It is a steady gauge of which side has been the more aggressive; the number of candles is a setting, and a longer window moves more slowly."),e("It counts dollars, not orders, and leaves out how much traded: 55% over a thin hour counts as much as over a frantic one. It needs the trades the page has recorded.")]}});function se(n){return{title:$().find(r=>r.key===n)?.name??n,...Ie()[n]}}function Be(n,t=Math.random){return`${n}--${Math.floor(t()*36**6).toString(36).padStart(6,"0")}`}let V=null;function Ee(n){V??={keys:$().map(t=>t.key),bySource:new Map($().map(t=>[t.source,t.key]))};for(const t of V.keys)if(n.id===t||n.id.startsWith(`${t}--`))return t;return V.bySource.get(n.source)??null}function Re(n){const t=Ee(n);return t?se(t):null}const R=n=>!("program"in n),H="script-reference.md";function Fe(n,t){for(const r of t.querySelectorAll("[data-script-bars]")){const a=re(n);r.textContent!==a&&(r.textContent=a)}for(const r of t.querySelectorAll("[data-script-status]")){const a=n.records.find(c=>c.id===r.dataset.scriptStatus);if(!a)continue;const u=te(n,a);r.textContent!==u.text&&(r.textContent=u.text),r.classList.toggle("error",u.error)}}function J(n,t,r,a){const u=n.about===r,c=ye(a.title);if(c.classList.toggle("open",u),c.setAttribute("aria-expanded",String(u)),c.dataset.focus=`about-${r}`,c.onclick=()=>{n.about=u?null:r,t(),u||document.querySelector(".panel .script-about")?.scrollIntoView({block:"nearest"})},!u)return{button:c,box:null};const i=d("div",{class:"help-inline script-about"});return ke(i,a),{button:c,box:i}}function X(n,t={}){if(R(n))return[];const r=n.declared.map(a=>({name:a.name,label:a.label??a.name,type:a.type,value:a.value,declared:!0,...a.min!==void 0?{min:a.min}:{},...a.max!==void 0?{max:a.max}:{},...a.step!==void 0?{step:a.step}:{},...a.choices?.length?{choices:a.choices}:{}}));for(const a of n.read){const u=Object.prototype.hasOwnProperty.call(t,a)?t[a]:void 0,c=u!==void 0?u:xe(a),i=typeof c=="boolean"?"boolean":typeof c=="number"?"number":typeof c=="string"&&/^(#|rgb|hsl)/i.test(c)?"color":"text";r.push({name:a,label:a,type:i,value:c??"",declared:!1})}return r}function $e(n,t,r,a){const u=(s,m=!1)=>{a.message={text:s,error:m},r()},c=(s,m)=>{n.setRecords(s)?u(m):u(e("This browser did not let the page keep it."),!0)};if(a.editing){Le(n,t,r,a,c,u);return}t.append(E(e("Scripts draw your own indicators from the candles and the taker flow and liquidations of the exchanges on the page. Each runs on its own, apart from the page, and can read nothing else. Their language is the indicator-script language other charting pages use: JavaScript with plots and functions such as sma and ema."))),a.message&&t.append(d("p",{class:a.message.error?"panel-note layout-message error":"panel-note layout-message",textContent:a.message.text})),t.append(me(e("Candles per script"),e("How many past candles each script can use, read from the exchange. More candles take longer to load and to run."),we.map(s=>[String(s),ee(s,1)]),String(n.bars),s=>{n.setBars(Number(s)),r()}));const i=E(re(n));i.dataset.scriptBars="",t.append(i),t.append(L(e("Your scripts")));const l=n.records;l.length||t.append(E(e("No scripts yet.")));for(const s of l){const m=te(n,s),v=d("input",{type:"checkbox",checked:s.on,ariaLabel:e("On")});v.onchange=()=>{v.checked&&n.showScripts(),c(l.map(o=>o.id===s.id?{...o,on:v.checked}:o),v.checked?e("“{name}” is on.",{name:s.name}):e("“{name}” is off.",{name:s.name}))};const g=a.armed===s.id,x=N(g?e("Sure?"):e("Delete"),()=>{if(!g){a.armed=s.id,r();return}a.armed=null,c(l.filter(o=>o.id!==s.id),e("Deleted “{name}”.",{name:s.name}))},e("Delete this script (press twice)"));g&&x.classList.add("armed");const A=N("↑",()=>{const o=l.indexOf(s);if(o>0){const h=[...l];[h[o-1],h[o]]=[h[o],h[o-1]],c(h,e("Moved “{name}”.",{name:s.name}))}},e("Move this script up (its row goes higher in the pane)"));A.disabled=l.indexOf(s)===0;const I=d("span",{class:`layout-date${m.error?" error":""}`,textContent:m.text});I.dataset.scriptStatus=s.id;const W=Re(s),B=W?J(a,r,`list:${s.id}`,W):null,O=d("div",{class:"layout-row script-row"},d("label",{class:"script-on"},v),N(s.name,()=>{a.editing=s.id,a.draft={name:s.name,source:s.source,options:{...s.options},place:s.place},a.message=null,r()},e("Open this script to change it")),...B?[B.button]:[],I,A,x);O.dataset.preview=`rec:${s.id}`,t.append(O),B?.box&&t.append(B.box)}t.append(L(e("Add")));const S=l.length>=P;for(const s of $()){const m=s.place??"pane",v=N(e("Add"),()=>{n.showScripts(),c([...l,{id:Be(s.key),name:s.name,source:s.source,options:{},on:!0,api:Z,height:Me(s.source)??G,place:m}],e("Added “{name}”.",{name:s.name}))},e("Add a ready-made script to start from"));v.disabled=S;const g=se(s.key),x=J(a,r,`add:${s.key}`,g),A=d("div",{class:"layout-row script-example"},d("span",{class:"script-example-name",textContent:s.name,tip:g.tip}),x.button,d("span",{class:"layout-date",textContent:m==="map"?e("On the map"):e("In its own row")}),v);A.dataset.preview=`ex:${s.key}`,t.append(A),x.box&&t.append(x.box)}const f=N(e("New script"),()=>{a.editing=ae,a.draft={name:"",source:"",options:{},place:"pane"},a.message=null,r()},e("Write a script, or paste one (an indicator file or a workspace works too)"));f.disabled=S,t.append(d("div",{class:"layout-tools"},f)),S&&t.append(E(e("At most {n} scripts: delete one first.",{n:P})));const k=d("input",{type:"file",accept:".json,.txt,.js,application/json,text/plain",hidden:!0});k.onchange=()=>{const s=k.files?.[0];s&&s.text().then(m=>{const v=oe(m,F(s.name.replace(/\.[a-z0-9]+$/i,""))??e("Imported script"));if("error"in v){u(v.error==="too-large"?e("The file is too large to be scripts."):v.error==="newer"?e("The file was written by a newer version of the page: update this page to read it."):e("The file holds no script this page can read."),!0);return}const g=ne(l,v.scripts.map(I=>({...I,on:!1}))),x=g.added+g.replaced,A=Y(x,"Read {n} script: switch it on to run it.","Read {n} scripts: switch them on to run them.")+(g.skipped?` ${e("{n} did not fit: at most {max}.",{n:g.skipped,max:P})}`:"");x?c(g.list,A):u(A,!0)},()=>u(e("The file holds no script this page can read."),!0))};const M=N(e("Export"),()=>{const s=URL.createObjectURL(new Blob([be(l)],{type:"application/json"}));d("a",{href:s,download:"liquiditymapperfast-scripts.json"}).click(),setTimeout(()=>URL.revokeObjectURL(s),1e4)},e("Write the scripts to a file, to keep them or use them in another browser"));M.disabled=!l.length,t.append(L(e("More")),d("div",{class:"layout-tools"},N(e("Import"),()=>k.click(),e("Read scripts from a file: one written by Export, an indicator file or a workspace from another charting page, or a script as text")),M,k)),t.append(L(e("Language")),...qe().map(s=>E(s))),t.append(d("p",{class:"panel-note"},d("a",{href:`./${H}`,download:H,rel:"noopener",textContent:e("The full language reference"),onclick:()=>Oe(e("The language reference is downloading as {name}. Look in your browser's downloads.",{name:H}))})))}function qe(){return[e("Each candle runs the script once. A name set without var (x = ...) keeps its value from candle to candle and starts at 0; x[1] is its value one candle back. A var starts again each candle."),e("Inputs: time (seconds), vbuy, vsell (dollars bought and sold at market), lbuy, lsell (dollars of shorts and longs liquidated), $price.open, .high, .low, .close (the chart's candle), renderer.length (candles so far), options.name."),e("source(vbuy, type=spot, exchange=BINANCE, quote=USDT) reads over those markets only (the flow column's markets are the rest). Options: name = option(default=14, type=number|color|checkbox|text, label=...)."),e("Functions: sma, ema, rma, sum, cum, cma, highest, lowest, last, linreg, stoch, pivot_high, pivot_low, avg, avg_ohlc, heikinashi, ohlc, cum_ohlc, interpolate; Math and Number as in JavaScript."),e("Plots: line, histogram, area, baseline, candlestick, plotbar, cloudarea, brokenarea, mark, level, each with title=, color=, lineWidth=, priceScaleId=, scaleMargins=. A point can be an object: {time: time, value: x, color: c}."),e("Not here: trade counts (cbuy, csell read NaN), single markets by name (EXCHANGE:pair), the chart library's series objects, try, switch. A candle that was not recorded reads NaN and draws nothing; the functions skip it.")]}function Le(n,t,r,a,u,c){const i=a.draft??={name:"",source:"",options:{},place:"pane"},l=n.records.find(o=>o.id===a.editing)??null,S=d("input",{type:"text",class:"layout-name",maxLength:40,placeholder:e("Name"),ariaLabel:e("Name"),value:i.name});S.oninput=()=>{i.name=S.value};const f=d("textarea",{class:"script-source",spellcheck:!1,rows:16,ariaLabel:e("Script"),placeholder:e("line(cum(vbuy - vsell), title=CVD)"),value:i.source});f.maxLength=fe,f.wrap="off",f.dataset.fill="",f.oninput=()=>{i.source=f.value},f.onkeydown=o=>{if(o.key!=="Tab"||o.shiftKey)return;o.preventDefault();const h=f.selectionStart,w=f.selectionEnd;f.setRangeText("  ",h,w,"end"),i.source=f.value};const k=d("select",{ariaLabel:e("Where")});k.append(new Option(e("In its own row"),"pane"),new Option(e("On the map"),"map")),k.value=i.place,k.onchange=()=>{i.place=k.value==="map"?"map":"pane"};const M=d("label",{class:"row script-option",tip:e("A row of its own in this pane, or on the map: the plots on the price scale (the default) at their prices, the others each on a scale of their own.")},d("span",{textContent:e("Draw")}),k);t.append(d("div",{class:"layout-save"},S),M,f);const s=o=>o?"panel-note layout-message error":"panel-note layout-message";let m=a.message?d("p",{class:s(a.message.error),textContent:a.message.text}):null;m&&t.append(m);const v=(o,h)=>{f.isConnected&&(a.message={text:o,error:h},m||(m=d("p"),f.after(m)),m.className=s(h),m.textContent=o)};if(l){const o=n.resultOf(l.id);o&&!o.ok&&t.append(d("p",{class:"panel-note layout-message error",textContent:z(o.error)}));const h=[...n.warningsOf(l.id),...o?.ok?o.warnings:[]];for(const w of h)t.append(E(ge(w,n.bars)))}const g={id:l?.id??ae,name:i.name||"x",source:i.source,options:i.options,on:!0,api:Z,height:G,place:i.place},x=X(n.analysisOf(g),i.options);if(x.length){t.append(L(e("Options")));for(const o of x){const h=o.name in i.options?i.options[o.name]:o.value;let w;const y=o.type==="list"&&o.choices?.length?o.choices:null;if(y){const p=d("select",{}),C=y.some(T=>typeof T=="string")&&y.some(T=>typeof T!="string");y.forEach((T,q)=>p.append(new Option(K(T,C),String(q))));const D=ve(y,h),b=D<0&&h!==void 0&&h!==null?h:void 0;b!==void 0?(p.append(new Option(K(b,C),"kept")),p.value="kept"):p.value=String(Math.max(0,D)),p.onchange=()=>{if(p.value==="kept"){b!==void 0&&(i.options[o.name]=b);return}const T=Number(p.value);Number.isInteger(T)&&y[T]!==void 0&&(i.options[o.name]=y[T])},w=p}else if(o.type==="boolean"){const p=d("input",{type:"checkbox",checked:h===!0||h===1});p.onchange=()=>{i.options[o.name]=p.checked},w=p}else o.type==="number"||o.type==="range"?(w=d("input",{type:"number",value:typeof h=="number"?String(h):"",step:o.step!==void 0?String(o.step):"any"}),w.oninput=()=>{const p=Number(w.value);w.value.trim()===""?delete i.options[o.name]:Number.isFinite(p)&&(i.options[o.name]=p)}):(w=d("input",{type:"text",value:typeof h=="string"?h:h==null?"":JSON.stringify(h)}),w.oninput=()=>{const p=w.value.trim();i.options[o.name]=o.type==="text"&&!o.declared&&p!==""&&Number.isFinite(Number(p))?Number(p):w.value});w.ariaLabel=o.label,t.append(d("label",{class:"row script-option"},d("span",{textContent:o.label}),w))}}const A=()=>{a.editing=null,a.draft=null,r()},I=()=>{const o=i.source;if(o.trim().startsWith("{")){const b=oe(o,F(i.name)??e("Pasted script"));if("scripts"in b&&b.scripts.length&&b.scripts[0].source!==o.replace(/\r\n?/g,`
`)){const T=n.records.filter(_=>_.id!==l?.id),q=ne(T,b.scripts.map(_=>({..._,on:!1})));a.editing=null,a.draft=null,u(q.list,Y(q.added+q.replaced,"Read {n} script: switch it on to run it.","Read {n} scripts: switch them on to run them."));return}}const h=F(i.name)??F(o.split(`
`).find(b=>b.trim())?.replace(/^\/\/\s*/,"").slice(0,30))??e("Script"),w=n.analysisOf({...g,source:o});if(R(w)){c(z(w),!0);return}const y={...i.options};for(const b of X(w,y))!(b.name in y)&&b.value!==""&&(y[b.name]=b.value);const p=l?n.records.find(b=>b.id===l.id)??l:null,C={id:p?.id??Se(h),name:h,source:o.replace(/\r\n?/g,`
`),options:y,on:p?.on??!0,api:p?.api??Z,height:p?.height??G,place:i.place},D=l?n.records.map(b=>b.id===l.id?C:b):[...n.records,C];if(!l&&n.records.length>=P){c(e("At most {n} scripts: delete one first.",{n:P}),!0);return}a.editing=C.id,a.draft={name:C.name,source:C.source,options:{...C.options},place:C.place},l||n.showScripts(),u(D,e("Saved “{name}”: it runs with the next update.",{name:C.name}))},W=()=>{const o=n.analysisOf({...g,source:i.source});c(R(o)?z(o):e("The script reads."),R(o))},B=()=>{const o=Ae(Ue(n,i,l,g));Ne(o).then(h=>v(h?e("Copied. Paste it into your AI assistant, then paste its answer back here and press Check."):e("This browser did not let the page copy."),!h))},O=(o,h,w,y)=>{const p=N(o,h,w);return p.dataset.focus=`script-${y}`,p};t.append(d("div",{class:"layout-tools"},O(e("Save"),I,e("Keep the script and run it"),"save"),O(e("Copy for AI"),B,e("Copy the script, its errors and what it drew, with the language's rules, to paste into an AI assistant"),"ai"),O(e("Check"),W,e("Read the script without saving it, to see whether it reads"),"check"),O(e("Back"),A,e("Back to the list (what is not saved is dropped)"),"back")))}function Ue(n,t,r,a){const u=n.analysisOf({...a,source:t.source}),c=r?n.records.find(m=>m.id===r.id)??null:null,i=c&&c.source===t.source&&Ce(c.options,t.options)?c:null,l=i?n.resultOf(i.id):null,S=i&&l?.ok?n.ranOn(i.id):null,f=R(u)?[u]:l&&!l.ok?[l.error]:[],k=i?n.warningsOf(i.id):[],M=R(u)?[]:l?.ok?[...k,...l.warnings]:[...u.warnings,...k],s=l?.ok&&S?l.plots.map(m=>({title:m.title,kind:m.kind,last:Te(m,S.candles)})):[];return{name:t.name,source:t.source,place:t.place,options:t.options,errors:f,warnings:M,plots:s,chart:S}}function re(n){const t=n.barsState(),r=a=>ee(a,1);switch(t.state){case"loading":return e("Reading {have} of {want} candles of {market} from the exchange…",{have:r(t.have),want:r(t.want),market:t.market});case"short":return e("{market} gives {have} candles of this timeframe, fewer than {want}: the scripts read those.",{have:r(t.have),want:r(t.want),market:t.market});case"failed":return e("The candles of {market} could not be read just now; trying again in a minute. Until then the scripts read the chart's own.",{market:t.market});case"none":return e("This market's history cannot be read from the exchange here: the scripts read the chart's own candles.");default:return e("The scripts read {want} candles of {market}.",{want:r(t.want),market:t.market})}}export{$e as buildScriptsPanel,je as panelClosed,Fe as refreshStatuses};
