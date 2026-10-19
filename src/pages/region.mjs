import { layout, frame } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseRoll, stepCards, stepSet, statTiles, faqBlock, noticeBlock, foldBars,
  shapeKin, spotIndex, ruralList, dongNameList, guIndex, kinList, hailStrip,
  topicLinks, courseTopic, themeCards, spotPool, guPool,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC,
  clsName, clsTalk, cmpWord, symWord, weakWord, longWord, foldName, fp, fr,
  ANCHOR, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const top = (v) => v.indexOf(Math.max(...v));
const low = (v) => v.indexOf(Math.min(...v));

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 땅을 접어 포개 얻은 숫자다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, area: km2(s.area),
    u: fp(s.v[0]), w: fp(s.v[1]), t: fp(s.v[2]),
    a: fp(s.a), b: fp(s.b), clsN: clsName(s.cls), clsT: clsTalk(s.cls),
    best: foldName(top(s.v)), worst: foldName(low(s.v)),
    sym: symWord(s.a), weak: weakWord(s.b),
    rank: s.rank, gRank: s.gRank, bRank: s.bRank,
    allSpots: counts.spot, guN: g.spotCount,
    hi: g.hi, hiV: fp(g.hiV), lo: g.lo, loV: fp(g.loV),
    bHi: g.bHi, bHiV: fp(g.bHiV), bLo: g.bLo, bLoV: fp(g.bLoV),
    guA: fp(g.a), cmpGu: cmpWord(s.a, g.a), gBest: foldName(top(g.v)),
    clsSame: g.clsCount[s.cls] || 1, gcls: clsName(g.cls),
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: `${won(Math.min(...courses.map((c) => c.price)))}원`,
  };
}

/* ── 동 안내문 — 메인 네 시도에서만 낸다 ─────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const open = `<div class="sr-lead">
  <p>${at(h, SPOT_LEAD_A, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const rows = [
    ['위치', `<a href="/${sd.slug}/">${esc(sd.full)}</a> / <a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
    ['가장 잘 맞는 접기', `${esc(c.best)} ${c.a}<small>${esc(c.sym)}</small>`],
    ['가장 안 맞는 접기', `${esc(c.worst)} ${c.b}<small>${esc(c.weak)}</small>`],
    ['읽은 결', `${esc(c.clsN)}<small>${esc(c.clsT)}</small>`],
  ];
  if (s.x && s.x.r) rows.push(['길쭉함', `${fr(s.x.r)}<small>${esc(longWord(s.x.r))}</small>`]);
  rows.push(
    ['땅 넓이', km2(s.area)],
    ['겹침 순위', `${esc(g.name)} 안 ${s.gRank}번째<small>안내문 ${ctx.counts.spot}구역 중 ${s.rank}번째</small>`],
    ['최저 겹침 순위', `${ctx.counts.spot}구역 중 ${s.bRank}번째`],
  );
  const facts = frame('fact', 'folded', `${esc(s.name)} 땅을 세 번 접어 보면`,
    foldBars(s.v, top(s.v)) + statTiles(rows),
    esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '05');

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) far.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const sameSido = [];
  for (const x of sd.gu) {
    if (x.slug === g.slug) continue;
    for (const y of x.spots) sameSido.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  }
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: `${sd.name} 안 다른 구역`, items: sameSido, pick: 18, anchor: ANCHOR },
    { label: '결이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    { label: '다른 시도', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '10', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));
  const theme = themeCards({
    pool: spotPool(regions, { sidoLabel: true, skipGu: `${sd.slug}/${g.slug}` }), noun: '동', seedKey: seed, num: '09',
    heading: esc(at(h, SEC.themeHead, 4)), sub: esc(at(h, SEC.themeSub, 5)), cards: 3, per: 4, prefer: [`c${s.cls}`],
  });

  const body = [
    open,
    facts,
    shapeKin(sd, g, s, seed, '02'),
    stepCards(seed, '03'),
    courseRoll(courses, seed, s.name, '04', { full: false }),
    hailStrip(cfg, `${g.name} ${s.name}`, seed),
    faqHtml,
    noticeBlock(seed, '06'),
    spotIndex(sd, g, seed, s.slug, '07'),
    guIndex(sd, seed, g.slug, '08', { pick: 12 }),
    theme.html,
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="sr-h1-s">출장마사지 홈타이 · 끝 맞댐 ${esc(c.u)} · 옆 맞댐 ${esc(c.w)}</span>`,
      body,
      pageKind: 'spot',
      about: `${url}#place`,
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 출장 방문 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#themes`, `${s.name}${josa(s.name, '과/와')} 접힌 결이 같은 곳`, theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${g.name} ${s.name}에서 접수하는 다섯 단계`, steps, cfg),
      ],
    }),
  };
}

/* ── 시군구 안내문 ────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  /* ★읍을 뺀 뒤로 '행정동이 전부 읍·면인 군'이 생겼다. 안내문을 낼 구역이 0이므로 갈래를 나눈다. */
  const mode = g.main ? (g.spotCount ? 'spot' : 'rural') : 'list';
  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main, mode,
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area),
    u: fp(g.v[0]), w: fp(g.v[1]), t: fp(g.v[2]),
    a: fp(g.a), b: fp(g.b), clsN: clsName(g.cls), clsT: clsTalk(g.cls),
    best: foldName(top(g.v)), worst: foldName(low(g.v)),
    hi: g.hi || '', hiV: g.hiV ? fp(g.hiV) : '', lo: g.lo || '', loV: g.loV ? fp(g.loV) : '',
    bHi: g.bHi || '', bHiV: g.bHiV ? fp(g.bHiV) : '',
    kinCount: g.kinCount,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: `${won(Math.min(...courses.map((x) => x.price)))}원`,
  };

  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const open = `<div class="sr-lead">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['위치', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}구역`],
    mode === 'spot' ? ['안내문을 낸 동', `${g.spotCount}구역`]
      : mode === 'rural' ? ['동 쪽', '해당 없음<small>이 군은 읍·면으로만 나뉩니다</small>']
        : ['쪽을 끊은 단계', '시군구<small>동 이름은 아래 목록에 있습니다</small>'],
    ['읍·면', g.ruralCount ? `${g.ruralCount}곳<small>이름만 올림 · 읍 ${g.eupCount}, 면 ${g.myeonCount}</small>` : '없음'],
    ['가장 잘 맞는 접기', `${esc(c.best)} ${c.a}<small>${esc(symWord(g.a))}</small>`],
    ['가장 안 맞는 접기', `${esc(c.worst)} ${c.b}<small>${esc(weakWord(g.b))}</small>`],
    ['읽은 결', `${esc(c.clsN)}<small>${esc(c.clsT)}</small>`],
    ['접힌 결이 비슷한 곳', g.kin.length > 1 ? `${esc(g.kin[0].gu)}, ${esc(g.kin[1].gu)} 등<small>모두 ${g.kinCount}곳</small>` : g.kin.length ? esc(g.kin[0].gu) : '없음'],
    ['땅 넓이', km2(g.area)],
  ];
  if (mode === 'spot' && g.hi) {
    rows.splice(7, 0,
      ['겹침이 가장 높은 구역', `<a href="/${sd.slug}/${g.slug}/${g.hiSlug}/">${esc(g.hi)}</a><small>최고 ${fp(g.hiV)}</small>`],
      ['겹침이 가장 낮은 구역', `<a href="/${sd.slug}/${g.slug}/${g.loSlug}/">${esc(g.lo)}</a><small>최고 ${fp(g.loV)}</small>`],
      ['최저 접기가 가장 높은 구역', `<a href="/${sd.slug}/${g.slug}/${g.bHiSlug}/">${esc(g.bHi)}</a><small>${fp(g.bHiV)}</small>`]);
  }
  if (g.x && g.x.r) rows.push(['길쭉함', `${fr(g.x.r)}<small>${esc(longWord(g.x.r))}</small>`]);
  const facts = frame('fact', 'folded', `${esc(g.name)} 땅을 세 번 접어 보면`, foldBars(g.v, top(g.v)) + statTiles(rows), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '07');

  const far = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const steps = stepSet(seed);
  const sidoDeep = [];
  for (const x of sd.gu) for (const y of x.spots) if (x.slug !== g.slug) sidoDeep.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '결이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    ...(sidoDeep.length ? [{ label: `${sd.name} 동으로 바로`, items: sidoDeep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시군구', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '11', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));
  const theme = themeCards({
    pool: mode === 'spot'
      ? spotPool(regions.filter((r) => r.slug === sd.slug), { skipGu: `${sd.slug}/${g.slug}` })
      : guPool(regions, { sidoLabel: true, skip: `${sd.slug}/${g.slug}` }),
    noun: mode === 'spot' ? '동' : '시군구', seedKey: seed, num: '10',
    heading: esc(at(h, SEC.themeHead, 4)), sub: esc(at(h, SEC.themeSub, 5)), cards: 3, per: 4, prefer: [`c${g.cls}`],
  });

  const body = [
    open,
    facts,
    mode === 'spot' ? spotIndex(sd, g, seed, null, '02') : mode === 'list' ? dongNameList(g, seed, '02') : '',
    ruralList(g, seed, '03'),
    kinList(sd, g, seed, '04'),
    courseRoll(courses, seed, g.name, '05', { full: false }),
    hailStrip(cfg, `${sd.name} ${g.name}`, seed),
    stepCards(seed, '06'),
    faqHtml,
    guIndex(sd, seed, g.slug, '08', { pick: 20 }),
    noticeBlock(seed, '09'),
    theme.html,
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="sr-h1-s">출장마사지 홈타이 · ${mode === 'spot' ? `동 ${g.spotCount}구역을 접어 포갰습니다` : mode === 'rural' ? `읍·면 ${g.ruralCount}구역도 찾아갑니다` : `행정동 ${g.dongCount}구역 전부 방문합니다`}</span>`,
      body,
      pageKind: 'gu',
      pageType: 'CollectionPage',
      about: `${url}#place`,
      mainList: g.spots.length ? `${url}#spotlist` : `${url}#sidogu`,
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 출장 방문 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : S.itemList(`${url}#sidogu`, `${sd.name} 소속 시군구`, sd.gu.map((x) => ({ name: x.name, url: `${siteUrl}/${sd.slug}/${x.slug}/` }))),
        S.itemList(`${url}#themes`, `${g.name}${josa(g.name, '과/와')} 접힌 결이 같은 곳`, theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name} ${g.name}에서 접수하는 다섯 단계`, steps, cfg),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 안내문 ──────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byB = sd.gu.slice().sort((a, b) => b.b - a.b || a.name.localeCompare(b.name, 'ko'));

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    u: fp(sd.v[0]), w: fp(sd.v[1]), t: fp(sd.v[2]),
    avgA: fp(sd.avgA), hiName: sd.hiName, loName: sd.loName,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: `${won(Math.min(...courses.map((x) => x.price)))}원`,
  };

  const open = `<div class="sr-lead"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const link = (nm, slug) => (sd.main ? esc(nm) : `<a href="/${sd.slug}/${slug}/">${esc(nm)}</a>`);
  const facts = frame('fact', 'folded', `${esc(sd.name)} 땅을 세 번 접어 보면`,
    foldBars(sd.v, top(sd.v)) + statTiles([
      ['행정 명칭', esc(sd.full)],
      ['쪽을 낸 단계', sd.main ? '시군구 다음에 동, 모두 두 단' : '시군구 한 겹'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}구역`],
      sd.main ? ['안내문을 낸 동', `${sd.spotCount}구역`] : ['동 이름', '시군구 쪽을 열면 나옵니다'],
      ['읍·면', sd.ruralCount ? `${sd.ruralCount}곳<small>각 시군구 쪽에 이름 목록이 있음</small>` : '없음'],
      ['가장 잘 맞는 접기', `${esc(foldName(top(sd.v)))} ${fp(sd.a)}<small>${esc(symWord(sd.a))}</small>`],
      ['가장 안 맞는 접기', `${esc(foldName(low(sd.v)))} ${fp(sd.b)}<small>${esc(weakWord(sd.b))}</small>`],
      ['읽은 결', `${esc(clsName(sd.cls))}<small>${esc(clsTalk(sd.cls))}</small>`],
      [sd.main ? '동 평균 최고 겹침' : '시군구 평균 최고 겹침', fp(sd.avgA)],
      [sd.main ? '겹침이 가장 높은 동' : '겹침이 가장 높은 시군구', `${link(sd.hiName, sd.hiSlug)}<small>${fp(sd.hiV)}</small>`],
      [sd.main ? '겹침이 가장 낮은 동' : '겹침이 가장 낮은 시군구', `${link(sd.loName, sd.loSlug)}<small>${fp(sd.loV)}</small>`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '07');

  const csLinks = frame('sidocourse', 'courses', `${esc(sd.name)}에서 고르는 코스`,
    `<p class="sr-links">${courses.map((x) => `<a href="/${sd.slug}/course/${x.slug}/">${esc(x.ko)}, ${esc(sd.name)} 안내</a>`).join('')}</p>`,
    `고르는 코스에 따라 손이 오래 머무는 자리가 달라집니다. ${esc(sd.name)} 어디서나 값표는 한 장을 씁니다.`, '04');

  let pickBlock = '';
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) all.push({ g, s });
    all.sort((a, b) => b.s.b - a.s.b || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = frame('steadiest', 'steadiest', `${esc(sd.name)}에서 어떻게 접어도 잘 겹치는 동`,
      `<ul class="sr-pills">\n${all.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}<b>${fp(x.s.b)}</b></a></li>`).join('\n')}\n</ul>`,
      '가장 안 맞는 접기에서조차 높게 겹친 구역만 추렸습니다. 판이 고르게 생겨 어느 쪽에서 들어오셔도 길 설명이 같습니다. 이 목록에 없는 구역은 시군구 쪽에서 찾으십시오.', '02');
  } else {
    pickBlock = frame('steadiest', 'steadiest', `${esc(sd.name)}에서 어떻게 접어도 잘 겹치는 시군구`,
      `<ul class="sr-pills">\n${byB.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)}<b>${fp(g.b)}</b></a></li>`).join('\n')}\n</ul>`,
      '가장 안 맞는 접기의 값이 높은 시군구부터 늘어놓았습니다. 값이 높을수록 판이 고르게 생긴 땅입니다.', '02');
  }

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const deep = [];
  for (const g of sd.gu) for (const x of g.spots) deep.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name} + 코스로`, items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '코스 한 장씩', items: courses.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: COURSE_ANCHOR },
    ...(deep.length ? [{ label: `${sd.name} 동으로 바로`, items: deep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시도', items: far, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '09', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));
  const theme = themeCards({
    pool: sd.main ? spotPool([sd]) : guPool(regions.filter((r) => r.slug !== sd.slug), { sidoLabel: true }),
    noun: sd.main ? '동' : '시군구', seedKey: seed, num: '08',
    heading: esc(at(h, SEC.themeHead, 4)), sub: esc(at(h, SEC.themeSub, 5)), cards: sd.main ? 6 : 5, per: 4,
  });

  const body = [
    open,
    facts,
    pickBlock,
    guIndex(sd, seed, null, '03'),
    csLinks,
    courseRoll(courses, seed, sd.name, '05', { full: false }),
    hailStrip(cfg, sd.name, seed),
    stepCards(seed, '06'),
    faqHtml,
    theme.html,
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="sr-h1-s">출장마사지 홈타이 · ${sd.main ? `동 ${sd.spotCount}구역 · 최고 겹침 ${fp(sd.a)}` : `시군구 ${sd.gu.length}곳 · 평균 최고 겹침 ${fp(sd.avgA)}`}</span>`,
      body,
      pageKind: 'sido',
      pageType: 'CollectionPage',
      about: `${url}#place`,
      mainList: `${url}#gulist`,
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 출장 방문 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.itemList(`${url}#courselist`, `${sd.name} 코스`, courses.map((cc) => ({ name: `${sd.name} ${cc.ko}`, url: `${siteUrl}/${sd.slug}/course/${cc.slug}/` }))),
        S.itemList(`${url}#themes`, `${sd.name}에서 접힌 결이 같은 곳`, theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 접수하는 다섯 단계`, steps, cfg),
      ],
    }),
  };
}
