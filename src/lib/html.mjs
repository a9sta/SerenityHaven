import { esc } from './util.mjs';
import * as S from './schema.mjs';
import { FOLDMARK } from '../assets.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   머리 — 가운데 이름표(접힌 표식 한 쌍) + 가운데 정렬 메뉴
 *   발   — 좌우 대칭 세 칸(동까지 | 이름과 번호 | 시군구까지) + 가운데 고지
 * 전화번호는 callBox() 로만 찍는다. 라벨은 '예약 문의' 하나다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '', pageType = '', about = '', mainList = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null, pageType, about, mainList }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#13241B">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/sr.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="hop" href="#main">본문으로 가기</a>
${header(ctx, path)}
${crumbs.length > 1 ? wayHtml(crumbs) : ''}
<main id="main">
<h1 class="sr-h1">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${floatBar(cfg)}
<script src="/assets/sr.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/** 예약 문의 알약. size: s(머리) · m(본문) · l(아래 떠 있는 것) */
export function callBox(cfg, { size = 'm', bar = false } = {}) {
  return `<a class="callbox callbox-${size}${bar ? ' callbox-b' : ''}" href="tel:${cfg.telRaw}">
  <span class="callbox-i" aria-hidden="true"></span>
  <span class="callbox-t"><span class="callbox-k">${esc(cfg.telLabel)}</span><span class="callbox-v">${esc(cfg.tel)}</span></span>
</a>`;
}

function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '지역'], ['/course/', '코스'], ['/price/', '값'], ['/guide/', '시작 전에'], ['/magazine/', '접기 노트']];
  return `<header class="sr-top">
  <div class="sr-top-in">
    <a class="sr-brand" href="/" aria-label="${esc(cfg.brand.ko)} 첫 화면">${FOLDMARK('sr-mk')}<b>${esc(cfg.brand.ko)}</b>${FOLDMARK('sr-mk sr-mk-r')}</a>
    <nav aria-label="주요 메뉴"><ul class="sr-nav">${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ul></nav>
    <div class="sr-top-c">${callBox(cfg, { size: 's' })}</div>
  </div>
</header>`;
}

function wayHtml(crumbs) {
  return `<nav class="sr-way-b" aria-label="여기까지 온 길"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 발 — 가운데 이름과 번호를 축으로 좌우 목록이 마주 보고, 아래에 문서와 고지가 가운데 정렬로 */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business || {};
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 담당자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const byKo = (a, c) => (a.name < c.name ? -1 : 1);
  const main = regions.filter((r) => r.main).sort(byKo);
  const sub = regions.filter((r) => !r.main).sort(byKo);
  const col = (r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`;

  return `<footer class="sr-foot">
  <div class="sr-rule" aria-hidden="true"><i></i><em>◆</em><i></i></div>
  <div class="sr-foot-in">
    <nav class="sr-foot-l" aria-label="동까지 적은 지역">
      <h2 class="sr-foot-h">동까지 적은 곳</h2>
      <ul>${main.map(col).join('')}</ul>
    </nav>
    <section class="sr-foot-m" aria-label="${esc(cfg.brand.ko)} 소개">
      <p class="sr-foot-nm">${esc(cfg.brand.ko)}</p>
      <p class="sr-foot-say">매장은 없고, 걸려 온 전화의 주소로 관리사가 찾아갑니다. 시군구 ${counts.gu}곳과 동 ${counts.spot}구역 어디서든 접수 번호는 하나입니다.</p>
      ${callBox(cfg, { size: 'm' })}
      <p class="sr-foot-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 선입금 없음</p>
    </section>
    <nav class="sr-foot-r" aria-label="시군구까지 적은 지역">
      <h2 class="sr-foot-h">시군구까지 적은 곳</h2>
      <ul>${sub.map(col).join('')}</ul>
    </nav>
  </div>
  <div class="sr-foot-d">
    <p class="sr-dline"><a href="/area/">지역 전체</a><a href="/guide/">시작 전에</a><a href="/price/">값</a><a href="/course/">코스</a><a href="/company/">소개</a><a href="/terms/">이용약관</a><a href="/privacy/">개인정보처리방침</a></p>
    <p class="sr-dline sr-dline-s"><a href="/rss.xml">RSS</a><a href="/sitemap.xml">사이트맵</a><a href="/llms.txt">llms.txt</a></p>
    <h2 class="sr-foot-h">최근 접기 노트</h2>
    <ul class="sr-foot-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
    <p class="sr-foot-sm">읍·면 ${counts.rural}곳은 이름만 올렸습니다. 마지막 손질 <time datetime="@@LM@@">@@LM@@</time></p>
  </div>
  <div class="sr-foot-end">
    ${biz ? `<p class="sr-biz">${biz}</p>` : '<p class="sr-biz sr-pale">운영자 표기는 확정되는 대로 이 줄에 올리겠습니다.</p>'}
    <p class="sr-ai">지역마다 적힌 겹침 숫자는 공개된 행정동 경계를 컴퓨터가 반으로 접어 포개 보고 얻은 값입니다. 글은 <strong>AI 도구로 초안을 잡은 뒤</strong> 사람이 고쳐서 올렸습니다. 후기·체험담·별점은 받지도 싣지도 않으며 인물 사진도 쓰지 않습니다. 바탕 자료: ${esc(data.source)}</p>
    <p class="sr-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 치료를 하는 곳이 아니며 성적인 서비스는 하지 않습니다.</p>
  </div>
</footer>`;
}

/** 화면 아래에 붙어 다니는 띠 */
function floatBar(cfg) {
  return `<div class="sr-bar">
  <span class="sr-bar-s">현관까지 ${esc(cfg.arrive)}</span>
  ${callBox(cfg, { size: 'l' })}
</div>`;
}

/**
 * 칸 틀 — 가운데 정렬 제목 양옆에 ◆ 로 끝나는 가로줄이 마주 보고, 번호는 제목 위에 얹는다.
 */
export function frame(id, label, h2, inner, sub, n) {
  return `<section class="sr-blk" id="${id}" aria-labelledby="${id}-h">
  <header class="sr-blk-h">
    ${n ? `<span class="sr-no" aria-hidden="true">${esc(n)}</span>` : ''}
    <h2 id="${id}-h"><i aria-hidden="true"></i><span>${h2}</span><i aria-hidden="true"></i></h2>
  </header>
  ${sub ? `<p class="sr-blk-s">${sub}</p>` : ''}
  <div class="sr-blk-b">${inner}</div>
</section>`;
}
