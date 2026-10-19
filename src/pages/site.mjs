import { layout, frame, callBox } from '../lib/html.mjs';
import { esc, hash, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseRoll, stepCards, stepSet, statTiles, faqBlock, noticeBlock,
  longtail, hailStrip, siteLinks, topicLinks, docTopics, themeCards, spotPool,
} from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS, CLS_ORDER, clsName, fp } from '../content/copy.mjs';
import { POSTS, METHOD_SLUG } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: `${won(Math.min(...courses.map((c) => c.price)))}원`,
});
const dt = (ctx, key) => docTopics(ctx, key, '11', esc(at(hash(key, 'dt'), SEC.topicHead, 8)), esc(at(hash(key, 'dt'), SEC.topicSub, 3)));
const notes = (list) => `<ul class="sr-notes">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><span>${esc(p.summary)}</span><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`;
const bw = (v) => Math.max(3, Math.min(100, Math.round(v)));

/* ── 첫 화면 ──────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="sr-door" aria-label="첫 안내">
  <p class="sr-door-sl">${esc(cfg.brand.slogan)}</p>
  <p class="sr-door-p">가게 문을 열고 기다리는 곳이 아닙니다. 걸려 온 전화에 적힌 주소로 관리사가 직접 찾아갑니다. 서울·인천·경기·부산은 동마다, 대전·대구·울산과 고른 시·군은 시군구마다 안내문을 한 장씩 두었습니다.</p>
  ${callBox(cfg, { size: 'l' })}
  <dl class="sr-door-f">
    <div><dt>접수</dt><dd>${esc(cfg.hours)}</dd></div>
    <div><dt>셈</dt><dd>${esc(cfg.pay)}</dd></div>
    <div><dt>현관까지</dt><dd>${esc(cfg.arrive)}</dd></div>
    <div><dt>안내문</dt><dd>동 ${counts.spot}곳 · 시군구 ${counts.gu}곳</dd></div>
  </dl>
</section>`;

  const row = (r) => {
    const meta = r.main ? `동 ${r.spotCount}곳` : `시군구 ${r.gu.length}곳`;
    return `<li class="${r.main ? 'main' : 'sub'}"><a href="/${r.slug}/"><span class="sr-dv-n">${esc(r.name)}<small>${esc(meta)} · 돌려 얹음 ${fp(r.v[2])}</small></span><span class="sr-dv-l"><span><i style="width:${bw(r.v[0])}%"></i></span><em>${fp(r.v[0])}</em></span><span class="sr-dv-r"><span><i style="width:${bw(r.v[1])}%"></i></span><em>${fp(r.v[1])}</em></span></a></li>`;
  };
  const areaBlock = frame('area', 'where', '어느 지역에서 부르십니까',
    `<div class="sr-dv-t" aria-hidden="true"><span>◀ 끝 맞댐</span><span>지역</span><span>옆 맞댐 ▶</span></div>
     <ul class="sr-div">${[...main, ...sub].map(row).join('\n')}</ul>
     <p class="sr-key">지역 이름을 가운데에 두고 왼쪽 막대는 땅을 양 끝에서 접었을 때, 오른쪽 막대는 긴 쪽을 따라 접었을 때 포개지는 비율입니다. 막대가 길수록 두 쪽이 잘 맞습니다.
       바탕이 한 겹 짙은 줄은 동까지 안내문이 있는 곳이고 옅은 줄은 시군구에서 끝나는 곳입니다. 어느 쪽이든 전화번호는 하나입니다.
       <a href="/area/">방문 지역 전체</a>는 따로 한 쪽에 펼쳐 두었습니다.</p>`,
    '깊이가 다를 뿐 찾아가는 데 차이는 없습니다.', '01');

  const whyBlock = frame('why', 'method', '안내문에 접힌 숫자를 싣는 까닭',
    `<div class="sr-lead">
      <p>지역 안내문 맨 위에는 막대가 세 줄 있습니다. 같은 땅을 <strong>양 끝으로, 양 옆으로, 반 바퀴 돌려</strong> 겹쳐 본 결과이며 100%에 가까울수록 두 쪽이 닮았다는 뜻입니다. 동 ${counts.spot}곳 가운데 가장 잘 포개지는 곳은 ${counts.hiName}(${fp(counts.aq.max)}), 가장 덜 포개지는 곳은 ${counts.loName}(${fp(counts.aq.min)})입니다.</p>
      <p>땅이 한쪽으로 기울면 길 이름이 반쪽에만 몰려 있어서 현관 앞까지 이르는 설명이 길어집니다. 그래서 접수 때 건물 이름과 호수를 끝까지 여쭙니다. 거의 대칭인 동네는 큰길 하나만 알려 주셔도 한 번에 찾는 경우가 많습니다.</p>
      <p>전국 행정동 ${counts.featAll}곳을 같은 순서로 접었고 다시 돌려도 숫자는 달라지지 않습니다. 접는 순서는 <a href="/magazine/${METHOD_SLUG}/">이 노트</a>에 차례로 적어 두었습니다.</p>
    </div>`, null, '02');

  const postBlock = frame('note', 'notes', '전화하시기 전에 읽어 두실 글',
    `${notes(latestPosts)}
     <p class="sr-sec-x"><a href="/magazine/">접기 노트 전체</a></p>`,
    '이용 후기가 아닙니다. 읽고 나면 통화가 한 마디 줄어드는 내용만 올렸습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 곳'), 6, '06');

  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name}의 ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 14, anchor: COURSE_ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 18, anchor: ANCHOR },
    { label: '시군구로', items: guList, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '09', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));
  const theme = themeCards({
    pool: spotPool(regions, { sidoLabel: true }), noun: '동', seedKey: seed, num: '08',
    heading: esc(at(h, SEC.themeHead, 4)), sub: esc(at(h, SEC.themeSub, 5)), cards: 6, per: 3,
  });

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseRoll(courses, seed, '부르시는 곳', '03'),
    stepCards(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    theme.html,
    topics,
    hailStrip(cfg, '지금 계신 곳', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(counts),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="sr-h1-s">서울·인천·경기·부산 동 ${counts.spot}곳 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '찾아가는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.itemList(`${siteUrl}/#themes`, '접힘이 닮은 동 모음', theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(`${siteUrl}/`, qa),
        S.howTo(`${siteUrl}/`, '전화 한 통으로 부르는 다섯 단계', steps, cfg),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const open = `<div class="sr-lead">
  <p>찾아가는 곳을 한 쪽에 모두 펼쳤습니다. 시군구는 ${counts.gu}곳이고 그 안에 안내문을 단 동이 ${counts.spot}곳 있습니다. 읍 ${counts.eup}곳과 면 ${counts.myeon}곳은 안내문 없이 이름만 올렸으나 방문은 똑같이 합니다.</p>
  <p>서울·인천·경기·부산은 시군구를 누르면 동 목록이 이어집니다. 그 밖의 시도는 시군구 한 쪽에 동 이름을 적어 두었습니다. 깊이를 둘로 가른 이유는 문의가 몰리는 쪽에만 한 겹 더 접어 보았기 때문입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => frame(`sd-${r.slug}`, r.main ? 'to dong' : 'to district',
    `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동 ${r.spotCount}곳` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="sr-pills">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/">${esc(g.name)}<b>${fp(g.a)}</b></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}${josa(r.name, '은/는')} 시군구를 먼저 고르셔야 동 목록이 나옵니다. 이름 옆 숫자는 시군구 땅 전체를 가장 잘 접었을 때의 겹침입니다.`
      : `${r.name}${josa(r.name, '은/는')} 시군구까지만 내려갑니다. 행정동 ${r.dongCount}곳의 이름은 시군구 쪽마다 적어 두었습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 곳'), 4, '90');

  const body = [open, hailStrip(cfg, '계신 곳', seed), blocks, faqHtml, stepCards(seed, '91')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `방문 지역 <span class="sr-h1-s">시군구 ${counts.gu}곳과 동 ${counts.spot}곳을 한 쪽에</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '방문 지역', url: `${siteUrl}/area/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/area/`, siteUrl, title: title.areaHub(counts), desc: clampDesc(desc.areaHub(counts)), listId: `${siteUrl}/area/#list` }),
        S.itemList(`${siteUrl}/area/#list`, '찾아가는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.service({ siteUrl, url: `${siteUrl}/area/`, cfg, name: `${cfg.brand.ko} 찾아가는 지역`, desc: clampDesc(desc.areaHub(counts)), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/area/`, qa),
        S.howTo(`${siteUrl}/area/`, '계신 곳에서 부르는 다섯 단계', stepSet(seed), cfg),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const open = `<div class="sr-lead">
  <p>코스는 아홉 가지이며 고르실 것은 시간, 압, 오일 사용 여부 세 가지입니다. 나머지 취향은 통화하시면서 말씀해 주시면 됩니다.</p>
  <p>가장 짧은 것은 ${esc(shortest.ko)}의 ${shortest.min}분이고 가장 긴 것은 ${esc(longest.ko)}의 ${longest.min}분입니다. 길다고 깊게 풀리는 것도 아니고 비싸다고 더 잘 맞는 것도 아닙니다.</p>
</div>`;

  const table = frame('all', 'table', '아홉 코스를 한 장의 표로',
    `<div class="sr-tw"><table class="sr-t"><thead><tr><th scope="col">코스</th><th scope="col">시간</th><th scope="col">압</th><th scope="col">손놀림</th><th scope="col">오일</th><th scope="col">값</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '사용' : '미사용'}</td><td>${won(c.price)}원</td></tr>`).join('\n')}</tbody></table></div>`,
    '값이 낮은 코스부터 세웠습니다. 지역이 달라져도 같은 표입니다.', '01');

  const pickBy = frame('bycase', 'choose', '이런 날에는 이 코스입니다',
    `<ul class="sr-notes">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><span>${esc(c.for)}</span></a></li>`).join('\n')}</ul>`,
    '정한 뒤에 바꾸셔도 됩니다. 값은 마지막으로 정하신 코스로 셈합니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 곳'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name}의 ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [open, table, pickBy, hailStrip(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역별로 코스 찾기', null, '04')].join('\n');
  const t = title.page(`코스 ${courses.length}가지 출장마사지 홈타이`);
  const d = clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지의 시간·압·오일 여부를 표 한 장에 모았습니다. ${won(sorted[0].price)}원부터이며 지역이 달라도 값은 같습니다.`);

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: t,
      desc: d,
      h1: `코스 ${courses.length}가지 <span class="sr-h1-s">시간 · 압 · 오일 여부를 표 한 장에</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/course/`, siteUrl, title: t, desc: d, listId: `${siteUrl}/course/#list` }),
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.aggregateOffer(`${siteUrl}/course/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/course/`, cfg, name: `${cfg.brand.ko} 코스 ${courses.length}가지`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 비용 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const open = `<div class="sr-lead">
  <p>청구하는 금액은 아래 표가 전부입니다. 표에 적히지 않은 항목으로 값이 붙는 일은 없습니다.</p>
  <p>걸어서 오 분 거리이든 차로 한 시간 걸리는 마을이든 같은 코스에는 같은 값이 매겨집니다. 이동에 드는 수고는 저희 쪽 몫입니다.</p>
</div>`;

  const table = frame('tbl', 'prices', '코스별 시간과 값',
    `<div class="sr-tw"><table class="sr-t"><thead><tr><th scope="col">코스</th><th scope="col">값</th><th scope="col">시간</th><th scope="col">분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td><b>${won(c.price)}원</b></td><td>${c.min}분</td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table></div>`,
    '분당 금액은 코스끼리 견주시라고 넣었을 뿐이며 시간을 쪼개어 팔지는 않습니다.', '01');

  const noExtra = frame('nox', 'never', '값에 더하지 않는 것',
    `<ul class="sr-heed">
      <li>이동 경비는 얼마나 멀어도 셈에 넣지 않습니다.</li>
      <li>한밤중 가산은 없습니다. 새벽 두 시에도 같은 값입니다.</li>
      <li>명절이나 연휴라고 값을 올리지 않습니다.</li>
      <li>예약금, 보증금처럼 먼저 내는 돈은 어떤 이름으로도 받지 않습니다.</li>
      <li>약속을 미루거나 접으셔도 위약금은 없습니다.</li>
      <li>건물 주차에 드는 돈은 저희가 부담합니다.</li>
    </ul>`,
    '먼저 입금하라는 문자나 전화를 받으셨다면 저희가 보낸 것이 아닙니다.', '02');

  const pay = frame('how', 'payment', '치르시는 방법',
    statTiles([
      ['치르는 때', '관리를 마친 직후 현관에서'],
      ['쓰실 수 있는 것', '현금, 카드 모두 가능합니다'],
      ['영수증', '원하시면 그 자리에서 드립니다'],
      ['시간을 늘리고 싶을 때', '접수나 관리 중에 말씀하시면 늘어난 만큼만 더합니다'],
      ['두 분이 받으실 때', '받는 사람 수만큼 셈하며 함께 받아도 깎아 드리지는 않습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '계신 곳'), 4, '04');
  const d = clampDesc(`코스별 시간과 값을 표로 적었습니다. ${won(sorted[0].price)}원부터이며 이동비·야간 가산·예약금은 없고 관리를 마친 뒤 현금이나 카드로 셈합니다.`);

  const body = [open, table, noExtra, pay, hailStrip(cfg, '비용 확인', seed), faqHtml, dt(ctx, seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`비용 ${won(sorted[0].price)}원부터`),
      desc: d,
      h1: `비용 <span class="sr-h1-s">${won(sorted[0].price)}원부터 · 표 밖의 돈은 받지 않습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '비용', url: `${siteUrl}/price/` }],
      jsonld: [
        S.aggregateOffer(`${siteUrl}/price/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/price/`, cfg, name: `${cfg.brand.ko} 코스별 비용`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/price/`, qa),
      ],
    }),
  };
}

/* ── 시작 전에 ──────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const open = `<div class="sr-lead">
  <p>처음 전화하시는 분이 가장 궁금해하실 것만 추렸습니다. 통화 한 번이 곧 접수이므로 오래 읽으실 필요는 없습니다.</p>
</div>`;

  const what = frame('need', 'ready', '미리 마련하실 것',
    `<ul class="sr-heed">
      <li>몸을 눕힐 자리 하나 — 침대든 바닥이든 상관없습니다.</li>
      <li>수건 두 장 — 오일을 쓰지 않는 코스라면 한 장으로도 충분합니다.</li>
      <li>문이 닫히는 방 하나 — 가족이 같은 집에 있어도 괜찮습니다.</li>
    </ul>
    <p class="sr-sec-x">매트와 오일, 향초는 관리사가 가방에 챙겨 옵니다. 따로 장만하실 것은 없습니다.</p>`,
    null, '01');

  const timing = frame('when', 'hours', '언제 전화해도 됩니까',
    statTiles([
      ['접수', `${esc(cfg.hours)}<small>시각을 가리지 않습니다</small>`],
      ['현관 앞까지', `보통 ${esc(cfg.arrive)}<small>골목 깊숙한 곳은 조금 더 걸립니다</small>`],
      ['시각 바꾸기', '언제든 가능하며 비용이 붙지 않습니다'],
      ['접으실 때', '관리사가 이미 현관 앞에 와 있다면 그 사실만 알려 주십시오'],
      ['붐비는 때', '주말 앞뒤 저녁, 특히 금요일과 토요일'],
      ['한가한 때', '평일 낮에는 거의 곧바로 출발합니다'],
    ]), null, '02');

  const refuse = frame('no', 'declined', '받을 수 없는 경우',
    `<ul class="sr-heed">
      <li>성적인 말이 섞인 통화는 그 자리에서 끊습니다.</li>
      <li>열이 있거나 상처가 붓고 아물지 않은 몸이면 날짜를 다시 잡습니다.</li>
      <li>번지 끝자리까지 알려 주지 않으시면 누구를 어디로 보낼지 정할 수 없습니다.</li>
      <li>관리사의 개인 연락처를 요구하시는 경우.</li>
      <li>병원 진료가 먼저일 듯한 증상.</li>
      <li>만 19세에 이르지 않은 분.</li>
    </ul>`,
    '받지 못한 접수에는 비용을 매기지 않습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 곳'), 6, '05');
  const d = clampDesc('처음 전화하시는 분을 위해 준비물, 접수 가능 시각, 받을 수 없는 경우, 값 치르는 방법을 순서대로 적었습니다.');

  const body = [open, what, timing, stepCards(seed, '04'), refuse, hailStrip(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), dt(ctx, seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('시작 전에 — 부르는 법과 치르는 법'),
      desc: d,
      h1: `시작 전에 <span class="sr-h1-s">통화가 곧 접수입니다</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '시작 전에', url: `${siteUrl}/guide/` }],
      jsonld: [
        S.howTo(`${siteUrl}/guide/`, '처음 부를 때 거치는 다섯 단계', stepSet(seed), cfg),
        S.service({ siteUrl, url: `${siteUrl}/guide/`, cfg, name: `${cfg.brand.ko} 이용 안내`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/guide/`, qa),
      ],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';
  const cells = data.params && data.params.cells ? data.params.cells : 128;
  const classLine = CLS_ORDER.map((k, i) => `${clsName(k)} ${counts.clsCount[i]}곳`).join(' · ');

  const open = `<div class="sr-lead">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 가게 없이 방문으로만 일합니다. 업소를 줄 세워 소개하는 곳이 아니라 저희가 전화를 받고 저희 사람이 찾아갑니다.</p>
  <p>이름의 '헤이븐'은 쉬어 가는 자리를 뜻합니다. 땅 모양은 한눈에 읽히지 않으므로 지역마다 종이를 접듯 겹쳐 보고 그 숫자를 안내문 맨 위에 적습니다.</p>
</div>`;

  const line = frame('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="sr-heed">
      <li>합니다 — 굳은 근육을 손으로 풀어 드리는 관리.</li>
      <li>하지 않습니다 — 성적 접대와 그에 가까운 모든 요구. 어떤 형태로도 응하지 않습니다.</li>
      <li>하지 않습니다 — 병을 진단하거나 치료하는 일. 그것은 병원의 몫입니다.</li>
      <li>받지 않습니다 — 만 19세 미만인 분.</li>
      <li>싣지 않습니다 — 이용 후기와 별점. 진짜인지 가릴 길이 없습니다.</li>
      <li>싣지 않습니다 — 사람 사진. 사진 속 사람과 다른 사람이 가는 일이 생길 수 있습니다.</li>
      <li>받지 않습니다 — 미리 내는 돈.</li>
    </ul>`, null, '01');

  const how = frame('data', 'sources', '땅은 어떻게 접었습니까',
    `<div class="sr-lead">
      <p>공개된 행정동 경계 ${counts.featAll}곳을 시도마다 하나의 평면에 옮기고, 땅 전체의 긴 방향을 찾아 그 방향으로 <strong>${cells}칸</strong>을 놓았습니다. 칸 한가운데가 땅 안이면 채우고 밖이면 비워 칸 그림을 만듭니다.</p>
      <p>그 그림을 <strong>양 끝 맞대기, 양 옆 맞대기, 반 바퀴 돌려 얹기</strong> 세 방식으로 겹칩니다. 두 쪽이 함께 채운 칸을 어느 한쪽이라도 채운 칸으로 나눈 값이 겹침이며, 세 값 중 가장 큰 것이 최고 겹침, 가장 작은 것이 최저 겹침입니다.</p>
      <p>최고가 90 이상이고 최저도 80 이상이면 온거울, 최고가 80 이상이면 어느 접기에서 나왔는지에 따라 끝거울·옆거울·돌림짝입니다. 그 아래로는 74 이상 닮은짝, 66 이상 성근짝, 54 이상 기운짝, 나머지는 엇갈림으로 부릅니다. 동 ${counts.spot}곳의 분포는 ${esc(classLine)}입니다.</p>
      <p>동 ${counts.spot}곳의 최고 겹침은 ${fp(counts.aq.min)}에서 ${fp(counts.aq.max)}까지 퍼져 있고 가운데 값은 ${fp(counts.aq.mid)}입니다. 최저 겹침이 가장 높은 곳은 ${counts.bHiName}(${fp(counts.bq.max)}), 가장 낮은 곳은 ${counts.bLoName}(${fp(counts.bq.min)})입니다.</p>
      <p>이 숫자는 행정 경계가 어떤 모양인지만 말해 줍니다. 집이 어디에 몰려 있는지, 길이 얼마나 막히는지와는 관계가 없으니 그 점을 감안하고 읽어 주십시오.</p>
    </div>
    ${statTiles([
      ['밑자료', esc(data.source)],
      ['쓴 경계 판', esc(data.version)],
      ['구하는 값', esc(data.axis)],
      ['셈하는 절차', esc(data.method)],
      ['안내문을 두는 기준', esc(data.coverageFrom)],
      ['안내문이 있는 곳', `동 ${counts.spot}곳 · 시군구 ${counts.gu}곳 · 시도 ${counts.sido}곳`],
      ['안내문이 없는 단위', `읍 ${counts.eup}곳 · 면 ${counts.myeon}곳<small>목록에 이름 한 줄로 올립니다</small>`],
      ['최고 겹침이 가장 높은 동', esc(counts.hiName)],
      ['최고 겹침이 가장 낮은 동', esc(counts.loName)],
    ])}`, null, '02');

  const d = clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 안내문의 접기 숫자를 어떤 자료와 순서로 얻었는지 적었습니다.`);
  const body = [open, line, how, hailStrip(cfg, '문의', seed), dt(ctx, seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko} 소개`),
      desc: d,
      h1: `${esc(cfg.brand.ko)} 소개 <span class="sr-h1-s">지키는 선과 접는 순서</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
      jsonld: [S.aboutPage({ url: `${siteUrl}/company/`, siteUrl, title: title.page(`${cfg.brand.ko} 소개`), desc: d })],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (목적)', '이 약관은 세레니티헤이븐(이하 "회사")이 이용자가 지정한 장소에 관리사를 보내 드리는 방문 관리를 제공함에 있어 필요한 조건과 진행 순서, 회사와 이용자 각각의 책임을 정하는 것을 목적으로 합니다.'],
  ['제2조 (접수)', '접수는 화면에 표시된 전화번호로 거는 통화로만 이루어집니다. 게시판, 채팅, 전자우편으로는 접수하지 않습니다. 통화로 코스와 주소와 시각이 정해지면 접수가 끝난 것으로 봅니다.'],
  ['제3조 (관리의 내용)', '회사는 이용자가 정한 장소에서 관리사가 뭉친 근육을 손으로 풀어 주는 관리를 합니다. 질병을 진단하거나 치료하는 행위, 성적인 행위는 하지 않습니다.'],
  ['제4조 (연령)', '만 19세 이상인 분만 이용하실 수 있습니다. 보호자가 함께 계시더라도 나이가 모자라면 접수하지 않습니다.'],
  ['제5조 (접은 숫자의 성격)', '화면에 적힌 겹침, 최고 겹침, 최저 겹침, 접힘의 이름은 공개된 행정동 경계를 칸 그림으로 바꾸어 세 방식으로 겹쳐 계산한 값입니다. 실제 도로 사정이나 이동 시간을 약속하는 숫자가 아니며 그 지역의 경계가 어떤 모양인지 알려 드리는 참고 자료입니다.'],
  ['제6조 (값과 셈)', '값은 비용표에 적힌 대로이며 지역에 따라 달라지지 않습니다. 대금은 관리를 마친 자리에서 현금이나 카드 중 편한 쪽으로 치르시면 됩니다. 예약금이나 보증금처럼 먼저 받는 돈은 이름을 바꾸어도 받지 않습니다.'],
  ['제7조 (일정 변경과 취소)', '관리사가 출발하기 전까지는 시각을 바꾸거나 접으셔도 위약금이 없습니다. 이미 현관 앞에 도착한 뒤라면 그 사실을 곧바로 알려 주십시오.'],
  ['제8조 (거절과 중단)', '다음 사유가 있으면 회사는 접수를 거절하거나 진행 중인 관리를 멈출 수 있습니다. 1. 성적인 행위를 요구하는 경우. 2. 관리사에게 폭언이나 폭력을 쓰거나 개인 연락처를 요구하는 경우. 3. 방문할 주소를 끝자리까지 알려 주지 않는 경우. 4. 발열이나 아물지 않은 상처 때문에 관리가 맞지 않는 경우.'],
  ['제9조 (이용자의 준비)', '이용자는 관리를 받을 공간과 수건을 준비하고, 진행에 영향을 줄 수 있는 건강 상태를 통화 중에 밝혀야 합니다. 멍이 잘 드는 체질이라면 경락 코스를 정하시기 전에 알려 주십시오.'],
  ['제10조 (후기와 평점)', '회사는 후기와 평점을 받지도 싣지도 않습니다. 화면의 문장은 어느 이용자의 경험을 옮겨 적은 것이 아닙니다.'],
  ['제11조 (중간에 멈춘 경우의 값)', '이용자의 요청이나 몸 상태 때문에 멈춘 때에는 지나간 시간만큼만 셈합니다. 시작한 지 10분이 안 되었다면 값을 받지 않습니다. 제8조 제1호에 따라 멈춘 때에는 그 시점까지의 시간을 값에 넣습니다.'],
  ['제12조 (책임)', '관리 중 회사의 잘못으로 손해가 생기면 회사가 배상합니다. 이용자가 알리지 않은 건강 상태로 생긴 손해와, 천재지변이나 통신 장애로 늦어진 일은 책임지지 않습니다.'],
  ['제13조 (약관의 개정)', '약관을 고칠 때에는 화면에 먼저 알리고 알린 날부터 적용합니다. 개정 후에 접수하시면 바뀐 내용에 동의하신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="sr-lead"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문입니다. 접수 전화를 거신 순간부터 이 내용을 따르시는 것으로 봅니다.</p></div>`,
    frame('terms', 'terms', '약관 전문', `<div class="sr-doc">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    hailStrip(cfg, '약관 문의', 'terms'),
    dt(ctx, 'terms'),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문입니다. 접수, 관리 내용, 값과 셈, 일정 변경과 취소를 ${TERMS.length}개 조문으로 적었습니다.`),
      h1: `이용약관 <span class="sr-h1-s">${TERMS.length}개 조문</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 적어 두는 항목', '접수 통화에서 적어 두는 것은 방문할 주소, 연락이 닿는 번호, 정하신 코스, 원하시는 시각 네 가지입니다. 이름, 생년월일, 주민등록번호는 묻지 않습니다.'],
  ['2. 쓰이는 곳', '적어 둔 내용은 관리사를 정하고 출발과 도착을 알려 드리는 데에만 씁니다. 그 뒤에 광고 문자를 보내거나 먼저 전화를 드리는 일은 없습니다.'],
  ['3. 번호의 관리', '접수 통화로 알게 된 번호는 방문이 끝날 때까지 접수 담당자와 배정된 관리사만 볼 수 있습니다.'],
  ['4. 보관 기간', '방문이 별 탈 없이 마무리되면 당일 중에 삭제합니다. 다툼이 생긴 건만 해결될 때까지 따로 보관합니다.'],
  ['5. 제3자 제공', '다른 업체에 넘기거나 처리를 맡기지 않습니다. 법령에 따라 수사기관이 정당하게 요청한 경우에만 예외입니다.'],
  ['6. 자동으로 수집되는 것', '이 사이트는 미리 만들어 둔 파일을 보여 줄 뿐입니다. 로그인, 장바구니, 댓글이 없고 광고 추적이나 방문 분석 스크립트도 넣지 않았으며 쿠키도 쓰지 않습니다.'],
  ['7. 이용자의 권리', '회사가 가진 내 정보를 보여 달라거나 지워 달라고 요청하실 수 있습니다. 화면의 번호로 전화하시면 그 통화에서 바로 처리합니다.'],
  ['8. 담당자', '운영자 표기가 정해지면 이 항목과 화면 맨 아래에 함께 올립니다. 그 전까지는 화면의 번호가 문의 창구입니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="sr-lead"><p>짧습니다. 받아 적는 항목이 네 개뿐이기 때문입니다.</p></div>`,
    frame('pp', 'privacy', '방침 전문', `<div class="sr-doc">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    hailStrip(cfg, '개인정보 문의', 'privacy'),
    dt(ctx, 'privacy'),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 적어 두는 항목과 쓰임, 보관 기간을 정리했습니다. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="sr-h1-s">적어 두는 항목은 네 개입니다</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 노트 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="sr-lead"><p>전화하시기 전에 알아 두시면 통화가 짧아지는 내용만 적었습니다. 소감과 별점은 올리지 않습니다.</p></div>`,
    frame('list', 'notes', `접기 노트 ${list.length}편`, notes(list), '새 글은 RSS로도 나갑니다.', '01'),
    hailStrip(cfg, '접수', 'magazine'),
    dt(ctx, 'magazine'),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  const d = clampDesc(`전화하시기 전에 정해 두시면 편한 것들을 ${list.length}편으로 적었습니다. 후기와 체험담은 두지 않습니다.`);
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('접기 노트'),
      desc: d,
      h1: `접기 노트 <span class="sr-h1-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '접기 노트', url: `${siteUrl}/magazine/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/magazine/`, siteUrl, title: title.page('접기 노트'), desc: d, listId: `${siteUrl}/magazine/#list` }),
        S.itemList(`${siteUrl}/magazine/#list`, '접기 노트', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` }))),
      ],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="sr-dated"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 접기 노트</p>`,
    `<article class="sr-piece">${html}</article>`,
    hailStrip(cfg, '접수', p.slug),
    frame('more', 'next', '이어서 읽을 글', notes(others), null, '01'),
    dt(ctx, p.slug),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '접기 노트', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, regions } = ctx;
  const body = [
    `<div class="sr-lead"><p>찾으시는 주소에 해당하는 안내문이 없습니다. 주소가 바뀌었거나 처음부터 만든 적이 없는 곳입니다. 아래에서 다시 고르십시오.</p></div>`,
    frame('back', 'back', '다시 고르기',
      `<p class="sr-slash"><a href="/">첫 화면</a><a href="/area/">지역 전체</a><a href="/price/">값</a><a href="/course/">코스</a><a href="/guide/">시작 전에</a>${regions.map((r) => `<a href="/${r.slug}/">${esc(r.name)}</a>`).join('')}</p>`, null, '01'),
    hailStrip(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소입니다'),
      desc: '찾으시는 주소로 만든 안내문이 없습니다. 아래에서 다시 고르십시오.',
      h1: '없는 주소입니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
