import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ──────────────────────────────────────────────────── */
const rad = (d) => (d * Math.PI) / 180;
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

function signedArea(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** 볼록 다각형(반시계)에 대한 서덜랜드–호지먼 */
function clipConvex(pts, clip) {
  let out = pts;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length];
    const ex = b[0] - a[0], ey = b[1] - a[1];
    const side = (p) => ex * (p[1] - a[1]) - ey * (p[0] - a[0]);
    const next = [];
    for (let j = 0; j < out.length; j++) {
      const p = out[j], q = out[(j + 1) % out.length];
      const sp = side(p), sq = side(q);
      if (sp >= 0) next.push(p);
      if ((sp >= 0) !== (sq >= 0)) {
        const t = sp / (sp - sq);
        next.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    }
    out = next;
  }
  return out;
}
function ringsOf(geom, lat0) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;
  const rings = [];
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const pts = ring.slice(0, -1).map((c) => [c[0] * kx, c[1] * ky]);
      if (pts.length < 3) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const p of pts) {
        if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
      }
      rings.push({ pts, outer: idx === 0, minX, maxX, minY, maxY, area: Math.abs(signedArea(pts)) });
    });
  }
  return { rings, kx, ky };
}

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 시도별 투영 기준 위도 — 한 시도 안은 같은 평면을 쓴다 ──────
   ★동마다 기준 위도를 달리 두면 이웃 동의 가로 좌표가 수 km 어긋난다. */
const LAT0 = new Map();
{
  const acc = new Map();
  for (const ft of geo.features) {
    const p = ft.properties;
    const [sidoKey] = sidoOf(p);
    if (!sidoKey) continue;
    const g = ft.geometry;
    const first = g.type === 'Polygon' ? g.coordinates[0][0] : g.coordinates[0][0][0];
    const a = acc.get(sidoKey) || [0, 0];
    a[0] += first[1]; a[1] += 1;
    acc.set(sidoKey, a);
  }
  for (const [k, [s, n]] of acc) LAT0.set(k, s / n);
}


/* ── 무게 중심 둘레의 주축 ──────────────────────────────────
   2차 모멘트를 다각형 공식으로 구한다(구멍은 음수). 점을 뿌려 세지 않는다. */
function frameOf(rings, c) {
  let Ix = 0, Iy = 0, Ixy = 0;
  for (const r of rings) {
    const sa = signedArea(r.pts);
    if (!sa) continue;
    const w = (r.outer ? 1 : -1) * Math.sign(sa);
    const pts = r.pts;
    for (let i = 0, n = pts.length; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      const f = p[0] * q[1] - q[0] * p[1];
      Ix += w * f * (p[0] * p[0] + p[0] * q[0] + q[0] * q[0]) / 12;
      Iy += w * f * (p[1] * p[1] + p[1] * q[1] + q[1] * q[1]) / 12;
      Ixy += w * f * (p[0] * q[1] + 2 * p[0] * p[1] + 2 * q[0] * q[1] + q[0] * p[1]) / 24;
    }
  }
  const Sxx = Ix - c.A * c.gx * c.gx, Syy = Iy - c.A * c.gy * c.gy, Sxy = Ixy - c.A * c.gx * c.gy;
  const th = 0.5 * Math.atan2(2 * Sxy, Sxx - Syy);
  return { th, cos: Math.cos(th), sin: Math.sin(th) };
}
/** 중심을 원점으로, 주축을 u 로 놓은 고리 */
function toFrame(rings, c, f) {
  return rings.map((r) => ({
    outer: r.outer,
    pts: r.pts.map((p) => {
      const dx = p[0] - c.gx, dy = p[1] - c.gy;
      return [f.cos * dx + f.sin * dy, -f.sin * dx + f.cos * dy];
    }),
  }));
}

/* ── 이 사이트가 재는 값: 대칭 ──────────────────────────────── */
const NEED_ALL_UNITS = false;
const NU = 128;
const CLASSES = ['whole', 'twinU', 'twinV', 'turn', 'near', 'loose', 'lean', 'skew'];
const META = {
  axis: '대칭 — 같은 땅을 접거나 돌려 겹쳤을 때 얼마나 포개지는가',
  method: '행정동 경계를 시도마다 하나로 맞춘 미터 평면에 옮기고, 넓이로 가중한 무게 중심을 원점으로 2차 모멘트(다각형 공식, 구멍은 음수)에서 주축을 구했다. 주축 방향으로 128칸, 짧은 쪽으로 같은 칸 크기에 가깝게(짝수 칸, 최소 16) 나눈 격자에 칸 한가운데가 땅 안인지를 줄 긋기(짝홀 규칙)로 가려 채웠다. 이 격자를 ①긴 쪽 가운데를 접어 양 끝을 맞대기 ②긴 쪽을 따라 반으로 접어 양 옆을 맞대기 ③반 바퀴(180도) 돌려 얹기 세 가지로 겹쳐, 겹친 칸 수를 합친 칸 수로 나눈 값(%)을 적었다. 시군구와 시도는 그 안의 모든 동 경계를 한 장으로 합쳐 자기 주축에서 같은 방식으로 쟀다.',
  coverageFrom: '동마다 쪽을 두는 곳은 서울·인천·경기·부산이고, 대전·대구·울산과 광주 광산구, 고른 시·군은 시군구 쪽 하나로 받아요. 읍·면은 쪽 없이 시군구 목록에 이름만 올려 뒀어요.',
  params: { cells: NU },
};

function unitMeasure(rings, tier, c) {
  if (!c) return null;
  const f = frameOf(rings, c);
  const fr = toFrame(rings, c, f);
  let Eu = 0, Ev = 0;
  for (const r of fr) if (r.outer) for (const p of r.pts) { Eu = Math.max(Eu, Math.abs(p[0])); Ev = Math.max(Ev, Math.abs(p[1])); }
  if (Eu <= 0 || Ev <= 0) return null;
  const nu = NU, nv = Math.max(16, 2 * Math.ceil((nu / 2) * Ev / Eu));
  const cu = (2 * Eu) / nu, cv = (2 * Ev) / nv;
  const M = new Uint8Array(nu * nv);
  const edges = [];
  for (const r of fr) {
    const pts = r.pts;
    for (let i = 0, n = pts.length; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      if (p[1] === q[1]) continue;
      edges.push(p[1] < q[1] ? [p[0], p[1], q[0], q[1]] : [q[0], q[1], p[0], p[1]]);
    }
  }
  const xs = [];
  for (let j = 0; j < nv; j++) {
    const y = -Ev + (j + 0.5) * cv;
    xs.length = 0;
    for (const e of edges) {
      if (e[1] <= y && y < e[3]) xs.push(e[0] + ((y - e[1]) / (e[3] - e[1])) * (e[2] - e[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((xs[k] + Eu) / cu - 0.5));
      const i1 = Math.min(nu - 1, Math.ceil((xs[k + 1] + Eu) / cu - 0.5) - 1);
      for (let i = i0; i <= i1; i++) M[j * nu + i] = 1;
    }
  }
  const iou = (fn) => {
    let inter = 0, uni = 0;
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = M[j * nu + i], b = fn(i, j);
      if (a & b) inter++;
      if (a | b) uni++;
    }
    return uni ? (inter / uni) * 100 : 0;
  };
  const v = [
    iou((i, j) => M[j * nu + (nu - 1 - i)]),
    iou((i, j) => M[(nv - 1 - j) * nu + i]),
    iou((i, j) => M[(nv - 1 - j) * nu + (nu - 1 - i)]),
  ].map((x) => Math.round(x * 10) / 10);
  return {
    v, a: Math.max(...v), b: Math.min(...v),
    x: { w: v.indexOf(Math.max(...v)), r: Math.round((Eu / Ev) * 100) / 100 },
  };
}

const guMeasure = (list, allRings, c) => unitMeasure(allRings, 'gu', c);
function sidoMeasure(gus, allRings, isMain, c) {
  if (isMain) return unitMeasure(allRings, 'sido', c);
  const mean = (f) => gus.reduce((s, g) => s + f(g), 0) / gus.length;
  const v = [0, 1, 2].map((i) => Math.round(mean((g) => g.v[i]) * 10) / 10);
  return { v, a: Math.max(...v), b: Math.min(...v), x: { w: v.indexOf(Math.max(...v)) } };
}
const kinDist = (g, o) => Math.abs(g.v[0] - o.v[0]) + Math.abs(g.v[1] - o.v[1]) + Math.abs(g.v[2] - o.v[2]);

function classify(m) {
  const [u, v2, p] = m.v;
  const best = m.a;
  if (best >= 90 && m.b >= 80) return 'whole';
  if (best >= 80) return u === best ? 'twinU' : v2 === best ? 'twinV' : 'turn';
  if (best >= 74) return 'near';
  if (best >= 66) return 'loose';
  if (best >= 54) return 'lean';
  return 'skew';
}

/* ── 중심점·넓이(구멍은 음수) ───────────────────────────────── */
function centroidOf(rings) {
  let A = 0, X = 0, Y = 0;
  for (const r of rings) {
    const sgn = r.outer ? 1 : -1;
    const sa = signedArea(r.pts);
    const a = Math.abs(sa);
    if (!a) continue;
    let sx = 0, sy = 0;
    for (let i = 0, n = r.pts.length; i < n; i++) {
      const p = r.pts[i], o = r.pts[(i + 1) % n];
      const f = p[0] * o[1] - o[0] * p[1];
      sx += (p[0] + o[0]) * f; sy += (p[1] + o[1]) * f;
    }
    A += sgn * a; X += sgn * a * (sx / (6 * sa)); Y += sgn * a * (sy / (6 * sa));
  }
  if (A <= 0) return null;
  return { A, gx: X / A, gy: Y / A };
}
const avgOf = (arr, f) => arr.reduce((s, x) => s + f(x), 0) / (arr.length || 1);

/* ── 레코드 ────────────────────────────────────────────────── */
const buckets = new Map();
for (const ft of geo.features) {
  const p = ft.properties;
  const [sidoKey, m, isMain] = sidoOf(p);
  if (!sidoKey) continue;
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const lat0 = LAT0.get(sidoKey);
  const { rings, kx, ky } = ringsOf(ft.geometry, lat0);
  const kind = kindOf(name);
  const wantSpot = isMain && kind === '동';
  const rec = { code: String(p.adm_cd2), name, kind, sidoKey, isMain, sggnm: p.sggnm, rings, kx, ky, wantSpot };
  if (wantSpot || NEED_ALL_UNITS) {
    const c = centroidOf(rings);
    const t = unitMeasure(rings, 'spot', c);
    if (c && t) {
      rec.m = t;
      if (wantSpot) Object.assign(rec, { lat: r6(c.gy / ky), lng: r6(c.gx / kx), area: r2(c.A / 1e6), v: t.v, a: t.a, b: t.b, x: t.x, cls: classify(t, 'spot') });
    }
  }
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  const dongs = list.filter((d) => d.kind === '동');
  const rural = list.filter((d) => d.kind !== '동')
    .map((d) => ({ name: d.name, kind: d.kind }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const allRings = [];
  for (const d of list) for (const r of d.rings) allRings.push(r);
  const c = centroidOf(allRings);
  if (!c) continue;
  const gt = guMeasure(list, allRings, c);
  const ky = 110574, kx = list[0].kx;

  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(c.gy / ky), lng: r6(c.gx / kx),
    area: r1(c.A / 1e6),
    dongCount: list.length,
    plainCount: dongs.length,
    rural, ruralCount: rural.length,
    eupCount: rural.filter((x) => x.kind === '읍').length,
    myeonCount: rural.filter((x) => x.kind === '면').length,
    spots: [],
    dongNames: isMain ? [] : dongs.map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    v: gt.v, a: gt.a, b: gt.b, x: gt.x, cls: classify(gt, 'gu'),
  };
  if (isMain) {
    const used = new Set();
    for (const d of dongs) {
      if (!d.v) continue;
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        v: d.v, a: d.a, b: d.b, x: d.x, cls: d.cls,
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  g._list = list;
  guAll.push(g);
}

/* ── 시군구 안 차례 ───────────────────────────────────────── */
const byName = (a, b) => a.name.localeCompare(b.name, 'ko');
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byA = g.spots.slice().sort((x, y) => y.a - x.a || byName(x, y));
  byA.forEach((s, i) => { s.gRank = i + 1; });
  const lo = byA[byA.length - 1];
  g.hi = byA[0].name; g.hiSlug = byA[0].slug; g.hiV = byA[0].a;
  g.lo = lo.name; g.loSlug = lo.slug; g.loV = lo.a;
  const byB = g.spots.slice().sort((x, y) => y.b - x.b || byName(x, y));
  const lb = byB[byB.length - 1];
  g.bHi = byB[0].name; g.bHiSlug = byB[0].slug; g.bHiV = byB[0].b;
  g.bLo = lb.name; g.bLoSlug = lb.slug; g.bLoV = lb.b;
  const cnt = {};
  for (const s of g.spots) cnt[s.cls] = (cnt[s.cls] || 0) + 1;
  g.clsCount = cnt;
}

/* ── 읽는 값이 닮은 시군구 — 이 사이트의 '옆 동네' ──────── */
{
  const sidoSlug = (key) => (MAIN[key] || SUB[key]).slug;
  for (const g of guAll) {
    const pool = guAll.filter((o) => o !== g).map((o) => ({
      o, same: o.sidoKey === g.sidoKey, gap: Math.round(kinDist(g, o) * 10) / 10,
    }));
    pool.sort((x, y) => (x.same === y.same ? (x.gap - y.gap || x.o.name.localeCompare(y.o.name, 'ko')) : x.same ? -1 : 1));
    g.kin = pool.slice(0, 8).map(({ o, same, gap }) => ({
      sidoSlug: sidoSlug(o.sidoKey), gu: o.name, slug: o.slug, same, gap, cls: o.cls, a: o.a, b: o.b,
    }));
    g.kinCount = g.kin.length;
  }
}

/* ── 전국 차례 ────────────────────────────────────────────── */
spotAll.slice().sort((x, y) => y.a - x.a || byName(x, y)).forEach((s, i) => { s.rank = i + 1; });
spotAll.slice().sort((x, y) => y.b - x.b || byName(x, y)).forEach((s, i) => { s.bRank = i + 1; });

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  const isMain = !!MAIN[key];
  const kx = gus[0]._list[0].kx, ky = 110574;
  const allRings = [];
  for (const g of gus) for (const d of g._list) for (const r of d.rings) allRings.push(r);
  const c = centroidOf(allRings);
  const st = sidoMeasure(gus, allRings, isMain, c);
  gus.sort(byName);
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  for (const g of gus) {
    g.spots.sort(byName);
    delete g.sidoKey; delete g._list;
  }
  const units = isMain ? allSpots : gus;
  const cnt = {};
  for (const s of units) cnt[s.cls] = (cnt[s.cls] || 0) + 1;
  const byA = units.slice().sort((x, y) => y.a - x.a || byName(x, y));
  const hi = byA[0], lo = byA[byA.length - 1];
  const avg = (f) => Math.round((units.reduce((s, x) => s + f(x), 0) / units.length) * 100) / 100;
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: isMain,
    lat: isMain ? r6(c.gy / ky) : r6(gus.reduce((s, g) => s + g.lat, 0) / gus.length),
    lng: isMain ? r6(c.gx / kx) : r6(gus.reduce((s, g) => s + g.lng, 0) / gus.length),
    area: isMain ? r1(c.A / 1e6) : r1(gus.reduce((s, g) => s + g.area, 0)),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    ruralCount: gus.reduce((s, g) => s + g.ruralCount, 0),
    eupCount: gus.reduce((s, g) => s + g.eupCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    v: st.v, a: st.a, b: st.b, x: st.x, cls: classify(st, 'sido'),
    clsCount: cnt, avgA: avg((x) => x.a), avgB: avg((x) => x.b),
    hiName: hi.name, hiV: hi.a, loName: lo.name, loV: lo.a, hiSlug: hi.slug, loSlug: lo.slug,
    unitKind: isMain ? '동' : '시군구',
    gu: gus,
  });
}

const qs = (arr) => { const t = arr.slice().sort((x, y) => x - y); const at = (p) => t[Math.min(t.length - 1, Math.floor(t.length * p))]; return { min: t[0], p10: at(0.1), p25: at(0.25), mid: at(0.5), p75: at(0.75), p90: at(0.9), max: t[t.length - 1] }; };
const aq = qs(spotAll.map((s) => s.a)), bq = qs(spotAll.map((s) => s.b));
const cntAll = {};
for (const s of spotAll) cntAll[s.cls] = (cntAll[s.cls] || 0) + 1;
const topBy = (key, dir) => spotAll.slice().sort((x, y) => dir * (y[key] - x[key]) || byName(x, y))[0].name;
const out = {
  version: VERSION,
  source: '경계 자료는 admdongkor 행정동 경계(CC BY 4.0)를 썼어요. 국가공간정보포털 원본을 이 저장소에서 다듬어 둔 판이에요.',
  built: new Date().toISOString().slice(0, 10),
  axis: META.axis,
  method: META.method,
  coverageFrom: META.coverageFrom,
  params: META.params,
  classes: CLASSES,
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    rural: guAll.reduce((s, g) => s + g.ruralCount, 0),
    eup: guAll.reduce((s, g) => s + g.eupCount, 0),
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    aq, bq,
    hiName: topBy('a', 1), loName: topBy('a', -1), bHiName: topBy('b', 1), bLoName: topBy('b', -1),
    clsCount: CLASSES.map((q) => cntAll[q] || 0),
    featAll: geo.features.length,
    extra: typeof extraCounts === 'function' ? extraCounts(spotAll, guAll) : null,
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out, (k, v) => (k === 'rings' || k === 'm' ? undefined : v)));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점(동) ${C.spot} · 이름만 ${C.rural}(읍 ${C.eup}·면 ${C.myeon})`);
console.log('a 분포', JSON.stringify(aq), '\nb 분포', JSON.stringify(bq));
console.log(`a 최고 ${C.hiName} · 최저 ${C.loName} · b 최고 ${C.bHiName} · b 최저 ${C.bLoName}`);
console.log(`갈래 ${CLASSES.map((q, i) => `${q} ${C.clsCount[i]}`).join(' · ')}`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 동 ${String(s.spotCount).padStart(4)} · v ${s.v.join('/')} · a ${s.a} · b ${s.b} · ${s.cls}`);
if (C.extra) console.log('extra', JSON.stringify(C.extra));
