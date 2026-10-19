/**
 * 타이틀·디스크립션 정본.
 * 토막은 마름모(◆)로 잇는다.
 *   세레니티헤이븐 `{동} 출장마사지 홈타이 ◆ {구} {코스어} ◆ {행동어} 세레니티헤이븐`
 * 설명문은 100자 안쪽이고 가운데 토막은 그 자리에서만 나오는 계산값(접어 겹친 비율)으로 채운다.
 */
import { hash, km2, withJosa as J } from './util.mjs';
import { fp, clsName, foldName } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '세레니티헤이븐';
const KEY = '출장마사지 홈타이';
const SEP = ' ◆ ';

const COURSE_WORD = ['스웨디시', '아로마', '딥티슈', '타이', '경락', '건식', '림프', '지압', '스포츠'];
const ACT = ['전화로 바로 접수', '값은 마친 뒤에', '자정 넘어도 응대', '번호 하나로 접수', '도착 시각 안내'];
const j = (...p) => p.join(SEP);

export const title = {
  home: (c) => j(`${BRAND} ${KEY}`, '땅을 접어 겹쳐 본 지역 안내', `${c ? `동 ${c.spot}곳` : '동 단위'} 후불 접수`),
  areaHub: (c) => j(`${KEY} 가는 지역`, `동 ${c.spot}곳 시군구 ${c.gu}곳`, BRAND),
  sido: (sd) => j(`${sd.name} ${KEY}`, sd.main ? `동 ${sd.spotCount}곳 최고 겹침 ${fp(sd.a)}` : `시군구 ${sd.gu.length}곳 최고 겹침 ${fp(sd.a)}`, `${at(hash(sd.name, 'sdt'), ACT)} ${BRAND}`),
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.main && g.spotCount ? `동 ${g.spotCount}곳` : g.main ? `읍면 ${g.ruralCount}곳` : `행정동 ${g.dongCount}곳`;
    return j(`${g.name} ${KEY}`, `${sd.name} ${unit} 최고 겹침 ${fp(g.a)}`, `${at(h, ACT, 0)} ${BRAND}`);
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return j(`${s.name} ${KEY}`, `${g.name} ${at(h, COURSE_WORD, 0)}`, `${at(h, ACT, 1)} ${BRAND}`);
  },
  course: (c) => j(`${c.ko} ${KEY}`, `${c.min}분 ${c.price.toLocaleString('ko-KR')}원`, `압 ${c.pressure} ${BRAND}`),
  sidoCourse: (sd, c) => j(`${sd.name} ${c.ko} ${KEY}`, `${sd.name} 방문`, `${at(hash(sd.name, c.slug), ACT)} ${BRAND}`),
  page: (t) => j(t, `${BRAND} ${KEY}`),
  post: (p) => j(p.title, `${BRAND} 접기 노트`),
};

function spotMiddle(sd, g, s, h) {
  const [u, w, t] = s.v;
  const frames = [
    () => `끝 맞댐 ${fp(u)}, 옆 맞댐 ${fp(w)}로 겹칩니다`,
    () => `최고 겹침 ${fp(s.a)}, ${J(clsName(s.cls), '으로/로')} 읽힙니다`,
    () => `돌려 얹으면 ${fp(t)}가 겹칩니다`,
    () => `${g.name}에서 겹침이 ${s.gRank}번째로 높습니다`,
    () => `가장 안 맞는 접기는 ${fp(s.b)}입니다`,
    () => `땅 ${km2(s.area)}, 결은 ${clsName(s.cls)}입니다`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '후불로 계산합니다',
  '선입금은 받지 않습니다',
  '멀어도 값은 그대로입니다',
  '밤에도 같은 값입니다',
  '계산은 마친 뒤 한 번입니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 안내. 땅을 접어 겹친 비율을 적었습니다.',
  areaHub: (c) =>
    `출장마사지 홈타이가 가는 동 ${c.spot}곳과 시군구 ${c.gu}곳. 곳마다 세 가지 접기의 겹침을 적었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}곳을 적었고 평균 최고 겹침은 ${fp(sd.avgA)}입니다.`
      : `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳까지 적었고 동 이름은 그 안에 있습니다. 후불이며 밤에도 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main && g.spotCount
      ? [
        `동 ${g.spotCount}곳을 적었고 최고 겹침은 ${fp(g.a)}입니다`,
        `겹침이 가장 높은 곳은 ${g.hi}, 가장 낮은 곳은 ${g.lo}입니다`,
        `끝 맞댐 ${fp(g.v[0])}, 옆 맞댐 ${fp(g.v[1])}인 ${clsName(g.cls)} 땅입니다`,
        `가장 안 맞는 접기가 가장 높은 곳은 ${g.bHi}(${fp(g.bHiV)})입니다`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}곳이 모두 읍·면이라 이 한 장에서 받습니다`,
          `읍 ${g.eupCount}곳과 면 ${g.myeonCount}곳은 이름으로 올렸습니다`,
          `땅 ${km2(g.area)}에 최고 겹침 ${fp(g.a)}, ${J(clsName(g.cls), '으로/로')} 읽힙니다`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
          `행정동 ${g.dongCount}곳이 들어 있고 결은 ${clsName(g.cls)}입니다`,
          `최고 겹침 ${fp(g.a)}, 넓이 ${km2(g.area)}짜리 땅입니다`,
          g.ruralCount ? `동과 읍·면 ${g.ruralCount}곳 모두 찾아갑니다` : `동 ${g.dongNames.length}곳 어디나 한 번호로 받습니다`,
        ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문. ${c.focus}에 시간을 몰아 쓰고 압은 ${c.pressure}입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역에 따라 달라지지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY}. ${J(c.focus, '을/를')} 오래 다룹니다. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
