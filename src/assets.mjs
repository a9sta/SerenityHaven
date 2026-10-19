import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 * 이 사이트의 장치는 **접은 선**이다. 가운데 축을 기준으로 좌우가 똑같이 뻗는다 —
 * 칸 제목 양옆의 줄, 지역 고르기의 마주 보는 막대, 접수 흐름의 엇갈린 등뼈, 발의 세 칸이 같은 문법이다.
 */
export const THEME = {
  paper: '#13241B', card: '#1B3226', soft: '#234032',
  ink: '#EAF0E4', dim: '#A5B8A6',
  acc: '#E8D6A8', accDk: '#F3E6C0', accSoft: '#2F4A3A',
  line: '#34523F', onAcc: '#13241B',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--onAcc:${t.onAcc};
  --w:980px;
  --serif:"Noto Serif KR","Nanum Myeongjo","Apple SD Gothic Neo","Malgun Gothic",Georgia,serif;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;color-scheme:dark;background:var(--paper)}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.82;font-size:16.5px;letter-spacing:-.005em;padding-bottom:84px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--acc);text-decoration:none}
a:hover{text-decoration:underline;text-underline-offset:3px}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{font-weight:800}
.hop{position:absolute;left:-9999px}
.hop:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--acc);color:var(--onAcc);padding:10px 16px}

/* ── 머리 = 가운데 이름 + 가운데 메뉴 ─────────────── */
.sr-top{position:sticky;top:0;z-index:30;background:var(--card);border-bottom:1px solid var(--line)}
.sr-top-in{max-width:var(--w);margin:0 auto;padding:8px 20px 6px;display:flex;flex-direction:column;align-items:center;gap:2px;position:relative}
.sr-brand{display:inline-flex;align-items:center;gap:12px;color:var(--ink)}
.sr-brand:hover{text-decoration:none}
.sr-mk{width:26px;height:26px;flex:none}
.sr-mk-r{transform:scaleX(-1)}
.sr-brand b{font-family:var(--serif);font-size:20px;font-weight:700;letter-spacing:.02em}
.sr-nav{margin:0;padding:0;list-style:none;display:flex;justify-content:center;gap:4px 22px;flex-wrap:wrap}
.sr-nav a{display:block;padding:3px 0;font-size:14px;font-weight:600;color:var(--dim);white-space:nowrap;border-bottom:2px solid transparent}
.sr-nav a:hover{text-decoration:none;color:var(--ink);border-bottom-color:var(--line)}
.sr-nav a[aria-current]{color:var(--acc);border-bottom-color:var(--acc)}
.sr-top-c{display:none}
@media (min-width:900px){.sr-top-c{display:block;position:absolute;right:20px;top:50%;transform:translateY(-50%)}}

/* ── 예약 문의 버튼 ────────────────────────────────── */
.callbox{display:inline-flex;align-items:center;gap:10px;background:var(--acc);color:var(--onAcc);
  padding:8px 18px 8px 14px;border-radius:999px;border:1px solid var(--accDk);line-height:1.15}
.callbox:hover{text-decoration:none;background:var(--accDk)}
.callbox-i{width:14px;height:14px;flex:none;border:2px solid var(--onAcc);border-radius:50% 50% 50% 0;transform:rotate(-45deg)}
.callbox-t{display:flex;flex-direction:column}
.callbox-k{font-size:10.5px;letter-spacing:.08em;opacity:.85}
.callbox-v{font-family:var(--mono);font-weight:800;font-size:15px;letter-spacing:.01em}
.callbox-s{padding:5px 14px 5px 10px}
.callbox-s .callbox-v{font-size:13px}
.callbox-s .callbox-k{display:none}
.callbox-l{padding:11px 24px 11px 18px}
.callbox-l .callbox-v{font-size:19px}

/* ── 지나온 길 ─────────────────────────────────────── */
.sr-way-b{max-width:var(--w);margin:0 auto;padding:10px 20px 0}
.sr-way-b ol{list-style:none;display:flex;flex-wrap:wrap;justify-content:center;gap:4px 8px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.sr-way-b li+li::before{content:"◆";margin-right:8px;font-size:7px;vertical-align:2px;color:var(--line)}
.sr-way-b a{color:var(--dim)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:18px 20px 64px}
.sr-h1{margin:18px 0 20px;text-align:center;font-family:var(--serif);font-size:clamp(25px,4.6vw,38px);line-height:1.3;font-weight:700;letter-spacing:-.01em}
.sr-h1-s{display:block;margin-top:10px;font-family:var(--sans);font-size:13.5px;font-weight:500;letter-spacing:0;color:var(--dim)}
.sr-lead{max-width:44rem;margin:0 auto 26px;text-align:center}
.sr-lead p{margin:0 0 .9em}
.sr-sec-x{margin:14px 0 0;font-size:14px;color:var(--dim);text-align:center}

/* ── 칸 틀 = 가운데 제목 + 양옆 줄(◆) ──────────────── */
.sr-blk{margin:48px 0 0}
.sr-blk-h{text-align:center}
.sr-no{display:block;margin-bottom:2px;font-family:var(--mono);font-size:11.5px;letter-spacing:.3em;color:var(--dim)}
.sr-blk-h h2{margin:0;display:flex;align-items:center;gap:14px;font-family:var(--serif);font-size:21px;font-weight:700;line-height:1.4}
.sr-blk-h h2 span{flex:none;max-width:78%}
.sr-blk-h h2 i{flex:1;height:7px;position:relative;min-width:16px}
.sr-blk-h h2 i::before{content:"";position:absolute;left:0;right:7px;top:3px;height:1px;background:var(--line)}
.sr-blk-h h2 i:last-child::before{left:7px;right:0}
.sr-blk-h h2 i::after{content:"";position:absolute;top:0;width:7px;height:7px;background:var(--acc);transform:rotate(45deg) scale(.82);right:0}
.sr-blk-h h2 i:last-child::after{right:auto;left:0}
.sr-blk-s{margin:10px auto 0;max-width:40rem;text-align:center;font-size:14px;color:var(--dim)}
.sr-blk-b{margin-top:20px}

/* ── 첫 화면 ───────────────────────────────────────── */
.sr-door{background:var(--card);border:1px solid var(--line);padding:26px 22px 20px;margin:0 0 6px;text-align:center;position:relative}
.sr-door::before,.sr-door::after{content:"◆";position:absolute;top:50%;font-size:10px;color:var(--acc);transform:translateY(-50%)}
.sr-door::before{left:10px}.sr-door::after{right:10px}
.sr-door-sl{margin:0 0 10px;font-family:var(--serif);font-size:21px;font-weight:700;line-height:1.5;color:var(--accDk)}
.sr-door-p{margin:0 auto 16px;max-width:42rem;color:var(--dim);font-size:15.5px}
.sr-door-f{margin:20px 0 0;display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid var(--line)}
@media (min-width:720px){.sr-door-f{grid-template-columns:repeat(4,1fr)}}
.sr-door-f div{padding:12px 8px 2px}
.sr-door-f dt{font-size:12px;letter-spacing:.14em;color:var(--dim)}
.sr-door-f dd{margin:2px 0 0;font-weight:700;font-size:15px}

/* ── 지역 고르기 = 마주 보고 자라는 막대 ──────────── */
.sr-div{list-style:none;margin:0;padding:0}
.sr-div li{border-bottom:1px solid var(--line)}
.sr-div li.main{background:var(--card)}
.sr-div a{display:grid;grid-template-columns:1fr 1fr;grid-template-areas:"n n" "l r";gap:4px 2px;padding:10px 10px;color:var(--ink);align-items:center}
@media (min-width:720px){.sr-div a{grid-template-columns:1fr 11.5rem 1fr;grid-template-areas:"l n r";gap:0 10px}}
.sr-div a:hover{text-decoration:none;background:var(--accSoft)}
.sr-dv-n{grid-area:n;text-align:center;font-family:var(--serif);font-size:17px;font-weight:700;line-height:1.35}
.sr-dv-n small{display:block;font-family:var(--sans);font-size:12px;font-weight:400;color:var(--dim)}
.sr-dv-l,.sr-dv-r{display:flex;align-items:center;gap:8px;height:20px}
.sr-dv-l{grid-area:l;flex-direction:row-reverse;justify-content:flex-start}
.sr-dv-r{grid-area:r}
.sr-dv-l>i,.sr-dv-r>i{display:block;height:12px;background:var(--acc);min-width:3px}
.sr-dv-l>i{opacity:.92}
.sr-dv-r>i{opacity:.55}
.sr-dv-l>em,.sr-dv-r>em{font-style:normal;font-family:var(--mono);font-size:12px;color:var(--dim);white-space:nowrap}
.sr-dv-l>span,.sr-dv-r>span{display:block;flex:1;max-width:100%}
.sr-dv-l>span>i,.sr-dv-r>span>i{display:block;height:12px;background:var(--acc);min-width:3px}
.sr-dv-l>span>i{margin-left:auto;opacity:.92}
.sr-dv-r>span>i{opacity:.55}
.sr-dv-t{display:flex;justify-content:space-between;margin:0 0 6px;font-size:12px;color:var(--dim)}
.sr-dv-t b{font-weight:600}
@media (min-width:720px){.sr-dv-t{padding:0 0}.sr-dv-t span:nth-child(2){flex:0 0 11.5rem;text-align:center}.sr-dv-t span{flex:1}.sr-dv-t span:first-child{text-align:right;padding-right:10px}.sr-dv-t span:last-child{padding-left:10px}}
@media (max-width:719px){.sr-dv-t span:nth-child(2){display:none}}
.sr-key{margin:16px auto 0;max-width:44rem;font-size:14px;color:var(--dim);text-align:center}

/* ── 접은 막대 셋 = 가운데 축 기준 좌우 대칭 ──────── */
.sr-fb{border:1px solid var(--line);background:var(--card);padding:14px 16px;display:grid;gap:10px}
.sr-fb-r{margin:0;display:grid;grid-template-columns:5.6rem 1fr 4.6rem;gap:10px;align-items:center;font-size:14px}
.sr-fb-n{font-size:12.5px;color:var(--dim)}
.sr-fb-t{display:block;height:14px;position:relative;background:linear-gradient(var(--line),var(--line)) center/1px 100% no-repeat}
.sr-fb-t>i{display:block;position:absolute;top:2px;bottom:2px;left:50%;transform:translateX(-50%);background:var(--acc);opacity:.55}
.sr-fb-top .sr-fb-t>i{opacity:1}
.sr-fb-r b{text-align:right;font-family:var(--mono)}

/* ── 정보 한 줄 ────────────────────────────────────── */
.sr-kv{margin:0;display:grid;border:1px solid var(--line);background:var(--card)}
@media (min-width:720px){.sr-kv{grid-template-columns:1fr 1fr}}
.sr-kv div{display:grid;grid-template-columns:8.5rem 1fr;gap:10px;padding:11px 14px;border-bottom:1px solid var(--line)}
.sr-kv dt{font-size:13px;font-weight:600;color:var(--dim)}
.sr-kv dd{margin:0;font-weight:600}
.sr-kv small{display:block;margin-top:2px;font-weight:400;font-size:12.5px;color:var(--dim)}
.sr-kv dd a{font-weight:700}

/* ── 표 ────────────────────────────────────────────── */
.sr-tw{overflow-x:auto;border:1px solid var(--line);background:var(--card)}
.sr-t{width:100%;border-collapse:collapse;font-size:14.5px}
.sr-t th,.sr-t td{padding:10px 12px;border-bottom:1px solid var(--line);text-align:center;vertical-align:top}
.sr-t thead th{background:var(--soft);font-size:12.5px;letter-spacing:.06em;color:var(--dim);font-weight:600;white-space:nowrap}
.sr-t tbody th{font-weight:700}
.sr-t tr:last-child>*{border-bottom:0}

/* ── 코스 = 점선 차림표 ───────────────────────────── */
.sr-menu{list-style:none;margin:0 auto;padding:0;max-width:44rem}
.sr-menu li{padding:10px 0 9px;border-bottom:1px solid var(--line)}
.sr-menu li:last-child{border-bottom:0}
.sr-menu-l{display:flex;align-items:baseline;gap:8px;font-size:17px}
.sr-menu-l>a,.sr-menu-l>span{font-family:var(--serif);font-weight:700;color:var(--ink);white-space:nowrap}
.sr-menu-l>a:hover{color:var(--acc)}
.sr-menu-l>i{flex:1;border-bottom:2px dotted var(--line);transform:translateY(-4px);min-width:16px}
.sr-menu-l>b{font-family:var(--mono);font-size:15.5px;color:var(--acc);white-space:nowrap}
.sr-menu-m{margin:1px 0 0;font-size:13px;color:var(--dim)}
.sr-menu-t{margin:4px 0 0;font-size:14.5px;color:var(--ink);opacity:.9}
.sr-menu li.sr-me{background:var(--accSoft);padding-left:10px;padding-right:10px}

/* ── 접수 흐름 = 가운데 등뼈에서 엇갈리는 줄 ──────── */
.sr-spine{list-style:none;margin:0;padding:0;position:relative;counter-reset:s}
.sr-spine::before{content:"";position:absolute;left:11px;top:6px;bottom:6px;width:2px;background:var(--line)}
.sr-spine li{position:relative;padding:0 0 18px 38px;counter-increment:s}
.sr-spine li::before{content:counter(s);position:absolute;left:0;top:2px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;
  background:var(--paper);border:2px solid var(--acc);color:var(--acc);font-family:var(--mono);font-size:12px;font-weight:800;transform:rotate(0)}
.sr-spine b{display:block;font-size:16px;font-weight:700}
.sr-spine span{display:block;color:var(--dim);font-size:14.5px}
.sr-spine li:last-child{padding-bottom:0}
@media (min-width:760px){
  .sr-spine::before{left:50%;margin-left:-1px}
  .sr-spine li{width:50%;padding:0 34px 20px 0;text-align:right}
  .sr-spine li:nth-child(even){margin-left:50%;padding:0 0 20px 34px;text-align:left}
  .sr-spine li::before{left:auto;right:-12px}
  .sr-spine li:nth-child(even)::before{right:auto;left:-12px}
}

/* ── 자주 묻는 것 = 물음 칸 | 답 칸 ────────────────── */
.sr-qa{display:grid;gap:10px}
.sr-qa-i{display:grid;border:1px solid var(--line);background:var(--card)}
@media (min-width:760px){.sr-qa-i{grid-template-columns:2fr 3fr}}
.sr-q{margin:0;padding:12px 16px;background:var(--soft);font-size:15px;font-weight:700;line-height:1.6;color:var(--accDk)}
.sr-a{margin:0;padding:12px 16px;font-size:15px}
@media (min-width:760px){.sr-q{border-right:1px solid var(--line)}}

/* ── 알림 상자 ─────────────────────────────────────── */
.sr-note{max-width:40rem;margin:0 auto;border:1px solid var(--acc);padding:6px 20px;position:relative;background:var(--card)}
.sr-note::before,.sr-note::after{content:"◆";position:absolute;top:50%;margin-top:-8px;font-size:11px;line-height:1;color:var(--acc);background:var(--paper);padding:2px 0}
.sr-note::before{left:-6px}.sr-note::after{right:-6px}
.sr-note ul{list-style:none;margin:0;padding:0}
.sr-note li{padding:9px 0;border-bottom:1px solid var(--line);font-size:15px;text-align:center}
.sr-note li:last-child{border-bottom:0}
.sr-heed{list-style:none;margin:0 auto;padding:0;max-width:40rem;border:1px solid var(--line);background:var(--card)}
.sr-heed li{padding:10px 16px;border-bottom:1px solid var(--line);font-size:15px;text-align:center}
.sr-heed li:last-child{border-bottom:0}

/* ── 이어 붙인 링크 ────────────────────────────────── */
.sr-links{margin:0;line-height:2.05;font-size:14.5px;text-align:center}
.sr-links a{display:inline-block;white-space:nowrap}
.sr-links a+a::before{content:"◆";display:inline-block;margin:0 10px;font-size:6px;vertical-align:3px;color:var(--line)}
.sr-slash{margin:0;line-height:2.05;font-size:14.5px;text-align:center}
.sr-slash a{display:inline-block;white-space:nowrap}
.sr-slash a+a::before{content:"◆";display:inline-block;margin:0 10px;font-size:6px;vertical-align:3px;color:var(--line)}
.sr-ways{display:grid;gap:18px}
@media (min-width:760px){.sr-ways{grid-template-columns:1fr 1fr}}
.sr-way{border:1px solid var(--line);background:var(--card);padding:10px 14px 8px}
.sr-way-h{margin:0 0 4px;text-align:center;font-size:12.5px;letter-spacing:.14em;color:var(--dim);font-weight:700}

/* ── 이름표 ────────────────────────────────────────── */
.sr-pills{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.sr-pills li a,.sr-pills li span{display:inline-flex;align-items:stretch;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:14px;font-weight:600;line-height:2}
.sr-pills li a{padding:0 0 0 12px}
.sr-pills li a:hover{text-decoration:none;border-color:var(--acc)}
.sr-pills li a>b{margin-left:10px;padding:3px 10px;background:var(--soft);font-family:var(--mono);font-size:12px;font-weight:600;color:var(--accDk);display:inline-flex;align-items:center}
.sr-pills-n li span{padding:2px 12px;font-weight:500;color:var(--dim)}

/* ── 결로 묶은 동 목록 ─────────────────────────────── */
.sr-grps{display:grid;gap:22px}
.sr-grp h3{margin:0 0 8px;font-family:var(--serif);font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px}
.sr-grp h3 em{font-style:normal;font-family:var(--mono);font-size:12px;padding:1px 8px;background:var(--accSoft);color:var(--accDk)}
.sr-chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
.sr-chips a{display:inline-flex;align-items:baseline;gap:8px;padding:3px 11px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:14px;font-weight:600}
.sr-chips a:hover{text-decoration:none;border-color:var(--acc)}
.sr-chips a>b{font-family:var(--mono);font-size:11.5px;color:var(--dim);font-weight:500}
.sr-chips a[aria-current]{border-color:var(--acc);background:var(--accSoft)}

/* ── 결이 같은 동 카드 ─────────────────────────────── */
.sr-tcs{display:grid;gap:14px}
@media (min-width:760px){.sr-tcs{grid-template-columns:1fr 1fr}}
.sr-tc{background:var(--card);border:1px solid var(--line);padding:12px 14px}
.sr-tc h3{margin:0 0 6px;text-align:center;font-family:var(--serif);font-size:15px;font-weight:700;color:var(--accDk)}
.sr-tc ul{list-style:none;margin:0;padding:0}
.sr-tc li{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-top:1px solid var(--line);font-size:14.5px}
.sr-tc li:first-child{border-top:0}
.sr-tc li b{flex:none;font-family:var(--mono);font-size:12.5px;color:var(--dim);font-weight:500;text-align:right}

/* ── 글 목록·글 ────────────────────────────────────── */
.sr-notes{list-style:none;margin:0 auto;padding:0;max-width:44rem;border-top:1px solid var(--acc)}
.sr-notes li{border-bottom:1px solid var(--line)}
.sr-notes a{display:block;padding:12px 4px;color:var(--ink);text-align:center}
.sr-notes a:hover{text-decoration:none;background:var(--card)}
.sr-notes b{display:block;font-family:var(--serif);font-size:16.5px;font-weight:700}
.sr-notes a:hover b{color:var(--acc)}
.sr-notes span{display:block;font-size:13.5px;color:var(--dim)}
.sr-notes time{display:block;margin-top:2px;font-family:var(--mono);font-size:11.5px;color:var(--dim)}
.sr-piece{max-width:42rem;margin:0 auto;font-size:17px}
.sr-piece h2{margin:30px 0 10px;font-family:var(--serif);font-size:19px;font-weight:700;text-align:center;padding-bottom:6px;border-bottom:1px solid var(--line)}
.sr-piece p{margin:0 0 1.05em}
.sr-piece ul{margin:0 0 1.05em;padding-left:1.1em;color:var(--dim)}
.sr-doc{max-width:42rem;margin:0 auto}
.sr-doc h2{margin:22px 0 6px;font-family:var(--serif);font-size:16.5px;font-weight:700;color:var(--accDk);text-align:center}
.sr-doc p{margin:0;font-size:15px;color:var(--dim)}
.sr-dated{margin:0 0 16px;text-align:center;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 예약 문의 띠 ──────────────────────────────────── */
.sr-hail{margin:44px 0 0;border:1px solid var(--acc);background:var(--card);padding:20px 18px 18px;text-align:center;position:relative}
.sr-hail::before,.sr-hail::after{content:"";position:absolute;top:-1px;height:1px;width:30%;background:var(--paper)}
.sr-hail::before{left:0}.sr-hail::after{right:0}
.sr-hail-p{margin:0 auto 4px;max-width:36rem;font-weight:700;font-size:15.5px;line-height:1.7}
.sr-hail-x{margin:0 0 14px;font-size:13px;color:var(--dim)}

/* ── 발 ────────────────────────────────────────────── */
.sr-foot{margin-top:36px;background:var(--card);color:var(--ink)}
.sr-rule{max-width:var(--w);margin:0 auto;padding:16px 20px 0;display:flex;align-items:center;gap:10px}
.sr-rule i{flex:1;height:1px;background:var(--line)}
.sr-rule em{font-style:normal;color:var(--acc);font-size:11px}
.sr-foot-in{max-width:var(--w);margin:0 auto;padding:20px 20px 8px;display:grid;gap:22px;text-align:center}
@media (min-width:900px){.sr-foot-in{grid-template-columns:1fr 1.3fr 1fr}.sr-foot-l{text-align:right}.sr-foot-r{text-align:left}}
.sr-foot-nm{margin:0 0 6px;font-family:var(--serif);font-size:22px;font-weight:700}
.sr-foot-say{margin:0 0 12px;font-size:14px;color:var(--dim)}
.sr-foot-run{margin:10px 0 0;font-size:12px;color:var(--dim)}
.sr-foot-h{margin:0 0 6px;font-size:12px;letter-spacing:.16em;font-weight:700;color:var(--dim)}
.sr-foot-l ul,.sr-foot-r ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:2px 12px;font-size:14px}
@media (min-width:900px){.sr-foot-l ul{justify-content:flex-end}.sr-foot-r ul{justify-content:flex-start}}
.sr-foot-d{max-width:var(--w);margin:0 auto;padding:10px 20px 6px;text-align:center}
.sr-dline{margin:0 0 6px;font-size:14px;line-height:2}
.sr-dline a{display:inline-block;margin:0 9px}
.sr-dline-s{font-size:13px}
.sr-foot-d .sr-foot-h{margin-top:10px}
.sr-foot-ul{list-style:none;margin:0 0 10px;padding:0;display:grid;gap:5px;font-size:14px}
.sr-foot-ul time{display:block;font-family:var(--mono);font-size:11px;color:var(--dim)}
.sr-foot-sm{margin:6px 0 0;font-size:12px;color:var(--dim)}
.sr-foot-end{max-width:var(--w);margin:0 auto;padding:12px 20px 28px;border-top:1px solid var(--line);text-align:center}
.sr-biz{margin:0 0 8px;font-size:12px;color:var(--dim)}
.sr-pale{opacity:.8}
.sr-ai{margin:0 auto 8px;max-width:50rem;font-size:12px;color:var(--dim);line-height:1.74}
.sr-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 붙은 줄 ──────────────────────────────────── */
.sr-bar{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--soft);border-top:1px solid var(--acc);color:var(--ink);
  padding:8px 14px calc(8px + env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:space-between;gap:10px;
  transition:transform .2s}
.sr-bar.down{transform:translateY(110%)}
.sr-bar-s{font-size:12px;line-height:1.35;max-width:9rem;color:var(--dim)}
@media (min-width:900px){.sr-bar{display:none}}
@media print{.sr-bar,.sr-top,.sr-hail{display:none}}
`;

const JS = `(function(){
  /* 발이 화면에 들어오면 아래 붙은 줄을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위가 없어야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.sr-bar'),ft=document.querySelector('.sr-foot');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('down',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 접은 표식 — 가운데 접힌 선을 두고 마주 보는 두 쪽 */
const FOLD = (c, bg) => `<path d="M16 4L4 8v16l12 4z" fill="${bg}" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M16 4l12 4v16l-12 4z" fill="${c}" fill-opacity=".85" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M16 2v28" stroke="${c}" stroke-width="1" stroke-dasharray="2 2" fill="none"/>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${t.paper}"/>${FOLD(t.acc, t.accSoft)}</svg>`;
const LOGO = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 48"><rect width="270" height="48" fill="${t.paper}"/><g transform="translate(8,8)">${FOLD(t.acc, t.accSoft)}</g><text x="50" y="26" font-family="serif" font-size="18" font-weight="700" fill="${t.ink}">${cfg.brand.ko}</text><text x="50" y="38" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.dim}">${cfg.brand.en.toUpperCase()}</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<path d="M600 60v200" stroke="${t.line}" stroke-width="2"/>
<g fill="${t.acc}"><rect x="${600 - 440}" y="90" width="440" height="22" fill-opacity=".92"/><rect x="600" y="90" width="440" height="22" fill-opacity=".92"/>
<rect x="${600 - 300}" y="140" width="300" height="22" fill-opacity=".6"/><rect x="600" y="140" width="300" height="22" fill-opacity=".6"/>
<rect x="${600 - 180}" y="190" width="180" height="22" fill-opacity=".38"/><rect x="600" y="190" width="180" height="22" fill-opacity=".38"/></g>
<text x="600" y="330" text-anchor="middle" font-family="serif" font-size="52" font-weight="700" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="600" y="388" text-anchor="middle" font-family="serif" font-size="26" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="600" y="438" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" fill="${t.dim}">서울 · 인천 · 경기 · 부산 동까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="380" y="480" width="440" height="84" rx="42" fill="${t.acc}"/>
<text x="600" y="515" text-anchor="middle" font-family="system-ui,sans-serif" font-size="15" letter-spacing="4" fill="${t.onAcc}">${cfg.telLabel}</text>
<text x="600" y="548" text-anchor="middle" font-family="ui-monospace,monospace" font-size="28" font-weight="700" fill="${t.onAcc}">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'sr.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'sr.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME, cfg));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
export const FOLDMARK = (cls = 'sr-mk', t = THEME) => `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${FOLD(t.acc, t.accSoft)}</svg>`;
