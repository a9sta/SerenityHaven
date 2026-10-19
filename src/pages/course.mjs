import { layout, frame } from '../lib/html.mjs';
import { esc, hash, won, josa, km2, shuffle } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { statTiles, faqBlock, stepCards, stepSet, noticeBlock, hailStrip, courseRoll, topicLinks, guIndex, themeCards, spotPool, guPool } from '../lib/blocks.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS, fp } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동 × 코스는 만들지 않습니다. 1,232 × 9 이면 만 쪽을 넘는데 구역이 바뀌어도
   코스 설명이 같아 전부 얇은 조합 안내문이 됩니다(도어웨이로 읽힙니다).
   코스는 전국 한 장 + 시도별 한 장까지만 냅니다. */

const OIL_NOTE = {
  true: '오일이 들어가는 코스라 끝난 뒤 닦아 낼 시간이 필요합니다. 곧바로 나가셔야 한다면 그 점부터 따져 보십시오.',
  false: '오일을 쓰지 않으므로 입으신 옷 그대로 받으실 수 있습니다. 끝나자마자 일어나 움직이셔도 번거롭지 않습니다.',
};
const PRESSURE_NOTE = [
  '표에 적힌 압은 시작점일 뿐입니다. 몇 분 지나면 서로 감이 잡힙니다.',
  '아픈 쪽으로 넘어가면 곧바로 말씀해 주십시오. 그 한 마디를 기다립니다.',
  '같은 압이라도 받는 날마다 달리 느껴집니다. 그날의 몸 상태부터 알려 주십시오.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '은/는')} ${c.for} 고르시는 코스입니다.`,
  (c) => `${c.for} 이 코스를 찾는 문의가 많습니다. 사정이 다르면 통화 중에 다른 코스로 옮겨 드립니다.`,
  (c) => `${c.for}에 맞춘 구성입니다. 중간에 바꾸고 싶어지셔도 괜찮으며 값은 처음 고른 코스로 셈합니다.`,
];

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');

  const fc = {
    place: '계신 곳', hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: `${won(Math.min(...courses.map((x) => x.price)))}원`,
  };

  const open = `<div class="sr-lead">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = frame('fact', 'course', `${esc(c.ko)} 요약`,
    statTiles([
      ['길이', `${c.min}분`],
      ['값', `${won(c.price)}원<small>어느 지역에서 부르셔도 같습니다</small>`],
      ['압', esc(c.pressure)],
      ['손의 속도', esc(c.tempo)],
      ['오래 쓰는 부위', esc(c.focus)],
      ['오일', c.oil ? '사용' : '사용하지 않음'],
      ['미리 마련할 것', c.oil ? '수건 두 장과 누울 자리' : '누울 자리와 수건 한 장'],
      ['접수와 도착', `${esc(cfg.hours)}<small>${esc(cfg.pay)}, 현관 앞까지 ${esc(cfg.arrive)}</small>`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const others = courses.filter((x) => x.slug !== c.slug);
  const line = (x, me) => `<li${me ? ' class="sr-me"' : ''}><div class="sr-menu-l">${me ? `<span>${esc(x.ko)}</span>` : `<a href="/course/${x.slug}/">${esc(x.ko)}</a>`}<i></i><b>${won(x.price)}원</b></div><p class="sr-menu-m">${x.min}분 · 압 ${esc(x.pressure)} · 오일 ${x.oil ? '사용' : '미사용'}</p></li>`;
  const compare = frame('cmp', 'compare', '나머지 여덟 코스와 나란히 놓으면',
    `<ul class="sr-menu">${line(c, true)}${others.map((x) => line(x, false)).join('\n')}</ul>`,
    '오래 받는 것과 세게 받는 것은 서로 다른 칸입니다. 길이와 압을 따로 읽어 주십시오.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '04');

  const bySido = regions.map((r) => ({ label: `${r.name}의 ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const others2 = courses.filter((x) => x.slug !== c.slug).map((x) => ({ label: x.ko, href: `/course/${x.slug}/` }));
  const steps = stepSet(seed);
  const deepAll = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const x of g.spots) deepAll.push({ label: `${g.name} ${x.name}`, href: `/${r.slug}/${g.slug}/${x.slug}/` });
  const topics = topicLinks([
    { label: `${c.ko} 지역별 안내`, items: bySido, anchor: COURSE_ANCHOR },
    { label: '옆 코스', items: others2, anchor: COURSE_ANCHOR },
    { label: '시군구 안내문', items: guList, pick: 18, anchor: ANCHOR },
    { label: '동 안내문', items: deepAll, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '07', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));
  const theme = themeCards({
    pool: spotPool(regions, { sidoLabel: true }), noun: '동', seedKey: seed, num: '06',
    heading: esc(at(h, SEC.themeHead, 4)), sub: esc(at(h, SEC.themeSub, 5)), cards: 3, per: 4,
  });

  const body = [
    open,
    facts,
    compare,
    hailStrip(cfg, c.ko, seed),
    stepCards(seed, '03'),
    faqHtml,
    noticeBlock(seed, '05'),
    theme.html,
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="sr-h1-s">${c.min}분 ${won(c.price)}원 · 압 ${esc(c.pressure)}</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.itemList(`${url}#sidolist`, `${c.ko}${josa(c.ko, '이/가')} 닿는 시도`, regions.map((r) => ({ name: `${r.name} ${c.ko}`, url: `${siteUrl}/${r.slug}/course/${c.slug}/` }))),
        S.itemList(`${url}#themes`, `${c.ko} 고르기 전에 둘러볼 동네`, theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${c.ko} 접수에서 도착까지 다섯 단계`, steps, cfg),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');

  const fc = {
    place: sd.name, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: `${won(Math.min(...courses.map((x) => x.price)))}원`,
  };

  const openLines = [
    `${sd.name} 어디에서 부르셔도 ${c.ko}의 값은 ${c.min}분 ${won(c.price)}원 하나입니다.`,
    `${sd.name}에서 ${c.ko}를 찾으시면 시군구나 동을 가리지 않고 같은 길이와 같은 값을 말씀드립니다.`,
    `${sd.name} 문의라고 코스 구성이 달라지지는 않습니다. ${c.ko}는 ${c.min}분에 ${won(c.price)}원입니다.`,
  ];
  const secondMain = [
    `${sd.name}의 동 ${sd.spotCount}곳은 저마다 접어 포갠 값을 가지고 있습니다. 평균 최고 겹침은 ${fp(sd.avgA)}입니다.`,
    `${sd.name}에서 겹침이 가장 높은 동은 ${sd.hiName}, 가장 낮은 동은 ${sd.loName}입니다. 동마다 안내문이 따로 있습니다.`,
    `${sd.name} 전체를 양 끝 맞대기로 접으면 ${fp(sd.v[0])}, 양 옆 맞대기로 접으면 ${fp(sd.v[1])}가 겹칩니다.`,
  ];
  const secondSub = [
    `${sd.name}에서는 시군구 ${sd.gu.length}곳 단위로 안내문을 냈고 동 이름은 그 안의 목록에 올렸습니다.`,
    `${sd.name} 시군구 ${sd.gu.length}곳의 평균 최고 겹침은 ${fp(sd.avgA)}이고 행정동은 모두 ${sd.dongCount}곳입니다.`,
    `${sd.name}${josa(sd.name, '은/는')} 시군구를 가장 작은 단위로 삼았습니다. 읍·면·동 이름은 전화로 한 번만 불러 주십시오.`,
  ];
  const second = at(h, sd.main ? secondMain : secondSub, 6);

  const open = `<div class="sr-lead">
  <p>${esc(at(h, openLines, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = frame('fact', 'course', `${esc(sd.name)} ${esc(c.ko)} 요약`,
    statTiles([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['안내문 깊이', sd.main ? `동 ${sd.spotCount}곳을 시군구 ${sd.gu.length}곳으로 나눔` : `시군구 ${sd.gu.length}곳까지`],
      ['길이', `${c.min}분`],
      ['값', `${won(c.price)}원<small>${esc(sd.name)} 어디서나 같습니다</small>`],
      ['압과 속도', `${esc(c.pressure)}<small>${esc(c.tempo)}</small>`],
      ['오래 쓰는 부위', esc(c.focus)],
      ['오일', c.oil ? '사용' : '사용하지 않음'],
      ['이 지역 평균 최고 겹침', `${fp(sd.avgA)}<small>${esc(sd.main ? `동 ${sd.spotCount}곳 평균` : `시군구 ${sd.gu.length}곳 평균`)}</small>`],
      ['땅 넓이', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '05');

  /* ★시군구가 한두 곳뿐인 서브 시도는 이것만으로 링크가 스무 개가 안 됩니다.
     다른 시도의 같은 코스 안내문을 함께 걸어 얇은 안내문이 생기지 않게 합니다. */
  const guHere = sd.gu.map((g) => ({ label: `${g.name}`, href: `/${sd.slug}/${g.slug}/` }));
  const deepHere = [];
  for (const g of sd.gu) for (const x of g.spots) deepHere.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const otherCourse = courses.filter((x) => x.slug !== c.slug)
    .map((x) => ({ label: `${sd.name}의 ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` }));
  const sameCourse = regions.filter((r) => r.slug !== sd.slug)
    .map((r) => ({ label: `${r.name}의 ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` }));
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name} 옆 코스`, items: otherCourse, anchor: COURSE_ANCHOR },
    { label: `${c.ko} 이웃 시도`, items: sameCourse, anchor: COURSE_ANCHOR },
    { label: '코스별 안내문', items: courses.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: COURSE_ANCHOR },
    { label: `${sd.name} 안 시군구 쪽 목록`, items: guHere, pick: 16, anchor: ANCHOR },
    ...(deepHere.length ? [{ label: `${sd.name} 동 안내문`, items: deepHere, pick: 14, anchor: ANCHOR }] : []),
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '08', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));
  const theme = themeCards({
    pool: sd.main ? spotPool([sd]) : guPool(regions.filter((r) => r.slug !== sd.slug), { sidoLabel: true }),
    noun: sd.main ? '동' : '시군구', seedKey: seed, num: '07',
    heading: esc(at(h, SEC.themeHead, 4)), sub: esc(at(h, SEC.themeSub, 5)), cards: 4, per: 4,
  });

  /* ★서브 시도의 시도×코스는 지역 고유 내용이 적어 얇아집니다. 그 시도에 든
     행정동 이름을 그대로 깔아 쪽마다 다른 살을 붙입니다(시군구 쪽에도 있는 목록입니다). */
  const subNames = [];
  if (!sd.main) for (const g of sd.gu) {
    for (const d of (g.dongNames || [])) subNames.push(`${g.name} ${d}`);
    for (const m of (g.rural || [])) subNames.push(`${g.name} ${m.name}`);
  }
  /* ★한 시도의 코스 쪽 7~9장이 같은 이름 목록을 통째로 이고 있으면 쪽끼리 겹침이 크게 올라갑니다.
     쪽마다 시드로 다른 묶음을 보이고 전부는 시도 쪽에 둡니다. */
  const nameShow = subNames.length
    ? shuffle(subNames, hash(seed, 'sn')).slice(0, Math.max(10, Math.round(subNames.length * 0.42)))
    : [];
  const namesBlock = nameShow.length
    ? frame('sidodong', 'dong', `${esc(sd.name)}에 든 행정동 가운데 ${nameShow.length}곳`,
        `<ul class="sr-pills sr-pills-n">${nameShow.map((n) => `<li><span>${esc(n)}</span></li>`).join('')}</ul>`
        + `<p class="sr-sec-x">${esc(sd.name)}의 행정동은 모두 ${subNames.length}곳입니다. 나머지는 <a href="/${sd.slug}/">${esc(sd.name)} 안내문</a>에서 시군구별로 이어집니다.</p>`,
        '부르실 이름은 어느 쪽이든 좋습니다. 전화로 한 번만 말씀해 주십시오.', '03')
    : '';

  const body = [
    open,
    facts,
    courseRoll(courses, seed, sd.name, '02', { full: false }),
    hailStrip(cfg, `${sd.name} ${c.ko}`, seed),
    namesBlock,
    guIndex(sd, seed, null, '04', { pick: 14 }),
    stepCards(seed, '06'),
    faqHtml,
    theme.html,
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="sr-h1-s">값 ${won(c.price)}원에 ${c.min}분, ${esc(sd.name)} 어디서나 같음</span>`,
      body,
      pageKind: 'sidocourse',
      about: `${siteUrl}/${sd.slug}/`,
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 출장 방문 관리`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.itemList(`${url}#gulist`, `${sd.name} ${c.ko} 시군구별 안내`, sd.gu.map((x) => ({ name: x.name, url: `${siteUrl}/${sd.slug}/${x.slug}/` }))),
        S.itemList(`${url}#themes`, `${sd.name} ${c.ko} 고르기 전 둘러볼 곳`, theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name} ${c.ko} 접수에서 도착까지`, steps, cfg),
      ],
    }),
  };
}
