"use strict";
const { useState, useMemo, useEffect, useRef, useCallback, useContext, createContext, Fragment } = React;
const html = htm.bind(React.createElement);
const NOW0 = Date.now();
const Ctx = createContext(null);

/* ---------- icons (24px grid, stroke) ---------- */
const ICONS = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
  incidents: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 10v4M12 17.2v.1"/>',
  teams: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9" r="2.4"/><path d="M17 14.2c2.4.3 4 2.1 4 4.8"/>',
  box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  city: '<path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Z"/><path d="M9 4v13.5M15 6.5V20"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12.5 16V8M17 16v-6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  bell: '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15L6 16.5Z"/><path d="M10 21h4"/>',
  menu: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  target: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>',
  car: '<path d="M5 17v-5l1.7-4.4A2 2 0 0 1 8.6 6.3h6.8a2 2 0 0 1 1.9 1.3L19 12v5"/><path d="M3.5 12h17M7 17v2M17 17v2"/><circle cx="8" cy="14.5" r=".7"/><circle cx="16" cy="14.5" r=".7"/>',
  flame: '<path d="M12 21c3.9 0 6.5-2.6 6.5-6.1 0-3-1.8-4.8-3.2-6.4-.5 1.2-1.3 2-2.3 2.3.3-3.3-1.2-6-3.6-7.8.2 3.1-1.4 4.9-2.6 6.3C5.6 11 5.5 12.7 5.5 14.9 5.5 18.4 8.1 21 12 21Z"/>',
  cross: '<path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5V4Z"/>',
  wrench: '<path d="M15 4.5a4.5 4.5 0 0 0-4.2 6.1L4 17.4V20h2.6l6.8-6.8A4.5 4.5 0 0 0 19.5 9l-3 3-2.5-.6-.6-2.5 3-3A4.5 4.5 0 0 0 15 4.5Z"/>',
  cone: '<path d="M12 4 7.5 18h9L12 4Z"/><path d="M9.2 12h5.6M4 20h16"/>',
  shield: '<path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6L12 3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  pin: '<path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.1"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3L19.5 9M19.5 4.5V9H15"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pulse: '<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>',
  landmark: '<path d="M3.5 20h17M5.5 20V10M10 20V10M14 20V10M18.5 20V10M3.5 10 12 4l8.5 6"/>',
  send: '<path d="m21 3-9.5 18-2.2-7.8L2 11 21 3Z"/>',
};
function Icon({ n, size }) {
  return html`<svg viewBox="0 0 24 24" width=${size} height=${size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML=${{ __html: ICONS[n] || '' }} />`;
}
function Logo() {
  return html`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25L16 2.5Z" fill="none" stroke="var(--cyan)" strokeWidth="1.7" strokeLinejoin="round"/><path d="M16 9v7M16 16l-6 3.5M16 16l6 3.5" stroke="var(--cyan)" strokeWidth="1.4" opacity=".6" fill="none" strokeLinecap="round"/><circle cx="16" cy="16" r="3.2" fill="var(--cyan)"/><circle cx="16" cy="8.6" r="1.8" fill="var(--blue)"/><circle cx="9.6" cy="19.8" r="1.8" fill="var(--blue)"/><circle cx="22.4" cy="19.8" r="1.8" fill="var(--blue)"/></svg>`;
}

/* ---------- domain constants ---------- */
const CATS = {
  traffic: { label: 'Traffic Accident', icon: 'car', color: 'var(--blue)', team: 'traffic' },
  fire: { label: 'Fire', icon: 'flame', color: 'var(--violet)', team: 'fire' },
  medical: { label: 'Medical Emergency', icon: 'cross', color: 'var(--cyan)', team: 'medical' },
  infra: { label: 'Infrastructure Hazard', icon: 'wrench', color: 'var(--green)', team: 'infra' },
  road: { label: 'Road Obstruction', icon: 'cone', color: 'var(--slate)', team: 'traffic' },
};
const TEAMCATS = {
  medical: { label: 'Medical Response', icon: 'cross', color: 'var(--cyan)' },
  fire: { label: 'Fire Response', icon: 'flame', color: 'var(--violet)' },
  traffic: { label: 'Traffic Support', icon: 'car', color: 'var(--blue)' },
  infra: { label: 'Infrastructure Support', icon: 'wrench', color: 'var(--green)' },
};
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const PRANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const STATUSES = ['Reported', 'Dispatched', 'On Scene', 'Resolved'];
const sClass = (s) => 's-' + s.split(' ')[0];
const tClass = (s) => 't-' + s.split(' ')[0];
const pColor = (p) => (p === 'Critical' ? 'var(--red)' : p === 'High' ? 'var(--amber)' : 'var(--cyan)');

const DISTRICTS = [
  { id: 'jubeiha', en: 'Al-Jubeiha', ar: 'الجبيهة', x: 310, y: 105, lx: 300, ly: 98, about: 'Northern district adjoining the University of Jordan area.' },
  { id: 'uj', en: 'University of Jordan', ar: 'الجامعة الأردنية', x: 410, y: 165, lx: 425, ly: 190, about: 'Campus district in the north of the city.' },
  { id: 'tabarbour', en: 'Tabarbour', ar: 'طبربور', x: 620, y: 190, lx: 628, ly: 172, about: 'North-eastern residential and light-industrial neighborhood.' },
  { id: 'shmeisani', en: 'Shmeisani', ar: 'الشميساني', x: 350, y: 262, lx: 340, ly: 246, about: 'Commercial and residential district with offices and hotels.' },
  { id: 'abdali', en: 'Abdali', ar: 'العبدلي', x: 460, y: 285, lx: 446, ly: 262, about: 'Urban redevelopment district anchored by Abdali Boulevard.' },
  { id: 'khalda', en: 'Khalda', ar: 'خلدا', x: 165, y: 290, lx: 150, ly: 262, about: 'Residential and commercial area in western Amman.' },
  { id: 'marka', en: 'Marka', ar: 'ماركا', x: 740, y: 320, lx: 750, ly: 300, about: 'Eastern district known for Amman Civil Airport at Marka.' },
  { id: 'jabal', en: 'Jabal Amman', ar: 'جبل عمّان', x: 385, y: 395, lx: 372, ly: 366, about: 'Historic central hill known for its numbered circles and cultural venues.' },
  { id: 'downtown', en: 'Downtown', full: 'Downtown / Al-Balad', ar: 'وسط البلد', x: 520, y: 425, lx: 590, ly: 478, about: 'Historic core around the Roman Theatre and the Citadel hill.' },
  { id: 'sweifieh', en: 'Sweifieh', ar: 'الصويفية', x: 270, y: 445, lx: 270, ly: 462, about: 'Retail and residential neighborhood in western Amman.' },
];
const DMAP = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]));
const LANDMARKS = [
  { id: 'citadel', en: 'Amman Citadel', ar: 'جبل القلعة', x: 468, y: 350, dx: 12, dy: 4, a: 'start' },
  { id: 'theatre', en: 'Roman Theatre', ar: 'المدرج الروماني', x: 503, y: 398, dx: 12, dy: -6, a: 'start' },
  { id: 'blvd', en: 'Abdali Boulevard', ar: 'بوليفارد العبدلي', x: 478, y: 306, dx: 12, dy: 2, a: 'start' },
  { id: 'khbp', en: 'King Hussein Business Park', ar: 'مجمع الملك حسين للأعمال', x: 250, y: 318, dx: 12, dy: 2, a: 'start' },
  { id: 'ujl', en: 'University of Jordan', ar: 'الجامعة الأردنية', x: 410, y: 140, dx: 0, dy: -12, a: 'middle', noLabel: true },
];

/* ---------- geometry ---------- */
const MW = 1000, MH = 660;
const OUTLINE = [[110,250],[150,170],[250,110],[330,62],[430,70],[540,110],[640,120],[740,150],[850,200],[905,290],[885,380],[800,440],[700,480],[620,520],[540,552],[430,556],[330,540],[220,505],[130,440],[95,350]];
function clipHalf(poly, a, b, c) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const dp = a * p[0] + b * p[1] - c, dq = a * q[0] + b * q[1] - c;
    if (dp <= 0) out.push(p);
    if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) { const t = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  }
  return out;
}
function cellOf(d) {
  let poly = OUTLINE;
  DISTRICTS.forEach((o) => {
    if (o.id === d.id) return;
    poly = clipHalf(poly, o.x - d.x, o.y - d.y, (o.x * o.x + o.y * o.y - d.x * d.x - d.y * d.y) / 2);
  });
  return poly;
}
const polyD = (p) => 'M' + p.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join('L') + 'Z';
function smooth(pts, closed) {
  const n = pts.length;
  const P = (i) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const f = (v) => v.toFixed(1);
  let d = 'M' + f(pts[0][0]) + ',' + f(pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ',' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ',' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ',' + f(p2[1]);
  }
  return closed ? d + 'Z' : d;
}
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function inPoly(pt, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
function streets(d, n) {
  const r = rng(n * 977 + 13); let s = '';
  [30, 58, 88].forEach((R, ri) => {
    const pts = [], m = 9 + ri * 3;
    for (let k = 0; k < m; k++) { const a = (k / m) * Math.PI * 2 + r() * 0.3, rr = R * (0.85 + r() * 0.3); pts.push([d.x + Math.cos(a) * rr * 1.15, d.y + Math.sin(a) * rr * 0.9]); }
    s += smooth(pts, true);
  });
  for (let k = 0; k < 11; k++) {
    const a = r() * Math.PI * 2; const pts = [[d.x, d.y]]; let x = d.x, y = d.y;
    for (let m = 0; m < 5; m++) { const aa = a + (r() - 0.5) * 0.5; x += Math.cos(aa) * 28; y += Math.sin(aa) * 28; pts.push([x, y]); }
    s += smooth(pts);
  }
  return s;
}
function contour(cx, cy, R, seed) {
  const r = rng(seed), pts = [];
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2, rr = R * (0.8 + r() * 0.4); pts.push([cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr]); }
  return smooth(pts, true);
}
const CITY = DISTRICTS.map((d, i) => { const poly = cellOf(d); return { ...d, poly, path: polyD(poly), st: streets(d, i + 1), alt: i % 2 === 1 }; });
const CMAP = Object.fromEntries(CITY.map((d) => [d.id, d]));
const CONTOURS = (() => {
  let s = '';
  [[385,395,1],[470,350,2],[300,300,3],[560,300,4],[200,430,5],[150,120,6],[800,520,7],[860,110,8],[640,600,9],[120,560,10]].forEach(([x, y, k]) => { [34, 62, 92, 124].forEach((R, i) => { s += contour(x, y, R, k * 31 + i); }); });
  return s;
})();
const ROADS = {
  hwy: [
    [[400,150],[385,205],[362,262],[405,302],[452,332],[492,392],[522,442],[560,520],[585,600]],
    [[520,425],[590,410],[660,372],[735,330],[805,296],[890,262]],
    [[100,300],[170,290],[262,275],[350,262],[460,285],[560,250],[620,198]],
  ],
  major: [
    [[300,92],[350,130],[410,162],[500,182],[620,196],[720,212],[860,185]],
    [[470,405],[430,398],[385,392],[340,384],[300,378],[262,368],[225,356],[190,340],[140,318],[100,300]],
    [[270,445],[330,425],[385,395]],
    [[250,540],[275,480],[270,445],[240,380],[165,290],[150,200]],
    [[460,285],[480,330],[470,365],[504,402]],
    [[620,198],[680,260],[735,330],[760,420]],
    [[350,262],[300,200],[310,105]],
    [[520,425],[470,470],[430,556]],
  ],
  wadi: [[130,520],[260,500],[360,470],[460,438],[520,425],[600,448],[700,430],[820,392],[900,360]],
};
const ROAD_D = { hwy: ROADS.hwy.map((p) => smooth(p)).join(''), major: ROADS.major.map((p) => smooth(p)).join(''), wadi: smooth(ROADS.wadi) };
const CIRCLES = [[440,400],[400,394],[360,388],[320,381],[282,372],[248,362],[212,350],[176,335]];

/* ---------- seeded demo data (all fictional) ---------- */
const TEAM_DEF = [
  ['MED-01','Medic Falcon','medical','abdali'],['MED-02','Medic Orion','medical','shmeisani'],['MED-03','Medic Cedar','medical','khalda'],
  ['MED-04','Medic Olive','medical','marka'],['MED-05','Medic Atlas','medical','downtown'],['MED-06','Medic Jasmine','medical','sweifieh'],
  ['FIR-01','Fire Rapid One','fire','marka'],['FIR-02','Fire Rapid Two','fire','jabal'],['FIR-03','Fire Rapid Three','fire','tabarbour'],['FIR-04','Fire Rapid Four','fire','khalda'],
  ['TRF-01','Traffic Support One','traffic','khalda'],['TRF-02','Traffic Support Two','traffic','sweifieh'],['TRF-03','Traffic Support Three','traffic','abdali'],['TRF-04','Traffic Support Four','traffic','marka'],
  ['INF-01','Infrastructure Crew One','infra','jubeiha'],['INF-02','Infrastructure Crew Two','infra','sweifieh'],['INF-03','Infrastructure Crew Three','infra','jabal'],['INF-04','Infrastructure Crew Four','infra','downtown'],
];
const TEAMS = TEAM_DEF.map(([id, name, cat, home]) => ({ id, name, cat, home }));
const TMAP = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

const SEED = [
  [2401,'traffic','Traffic Collision','khalda','7th Circle','High','Dispatched',14,'TRF-01','Two-vehicle collision reported near the circle exit. One lane is blocked.',[212,350]],
  [2402,'medical','Medical Assistance','abdali','Abdali Boulevard','Critical','On Scene',9,'MED-01','Adult reported unresponsive in a public plaza. First responders are on scene.',[470,296]],
  [2403,'fire','Fire Alert','marka','Marka commercial strip','High','Dispatched',22,'FIR-01','Smoke reported from a ground-floor storage unit in a commercial block.'],
  [2404,'road','Road Obstruction','sweifieh','Sweifieh main road','Medium','Dispatched',31,'TRF-02','Fallen signage is partially blocking the right lane.'],
  [2405,'infra','Infrastructure Hazard','downtown','Near the Al-Balad market','Medium','Reported',6,'INF-04','Surface subsidence reported beside a pedestrian crossing.'],
  [2406,'medical','Medical Assistance','shmeisani','Shmeisani office district','High','On Scene',18,'MED-02','Elderly patient with breathing difficulty. Ambulance attending.'],
  [2407,'traffic','Minor Collision','tabarbour','Tabarbour junction','Medium','Reported',4,null,'Rear-end collision. Vehicles moved to the shoulder.'],
  [2408,'fire','Building Fire Alarm','jabal','Jabal Amman residential street','Critical','Dispatched',11,'FIR-02','Apartment fire alarm with reports of smoke in the stairwell.'],
  [2409,'infra','Water Main Leak','jubeiha','Al-Jubeiha side street','High','Dispatched',47,'INF-01','Leaking main is flooding a side street and reducing traffic flow.'],
  [2410,'road','Road Obstruction','uj','Campus access road','Low','Reported',52,null,'Event barriers left across the access lane.'],
  [2411,'medical','Fall Injury','khalda','Khalda residential block','Medium','Dispatched',25,'MED-03','Fall injury reported. Patient is conscious and responsive.'],
  [2412,'traffic','Traffic Collision','abdali','Abdali ring junction','High','On Scene',16,'TRF-03','Multi-vehicle slowdown following a collision. Lane control in place.'],
  [2413,'road','Stalled Heavy Vehicle','marka','Marka main road','Medium','On Scene',38,'TRF-04','Stalled heavy vehicle is blocking one lane.'],
  [2414,'infra','Signal Outage','sweifieh','Sweifieh traffic signals','Medium','Dispatched',29,'INF-02','Signal cluster is offline. Manual traffic control requested.'],
  [2415,'fire','Small Waste Fire','tabarbour','Tabarbour workshop area','Medium','Reported',8,null,'Small waste fire reported behind a workshop.'],
  [2416,'medical','Minor Injury','downtown','Downtown pedestrian zone','Low','Reported',12,null,'Visitor with a minor injury requesting assistance.'],
  [2417,'infra','Retaining Wall Cracks','jabal','Jabal Amman roadside wall','High','On Scene',63,'INF-03','Cracks observed on a roadside retaining wall. Area coned off.'],
  [2418,'traffic','Minor Collision','shmeisani','Shmeisani main street','Low','Reported',21,null,'Drivers exchanging details. No injuries reported.'],
  [2419,'road','Debris on Carriageway','jubeiha','Al-Jubeiha roundabout','Medium','Reported',33,null,'Debris on the carriageway after strong winds.'],
  [2420,'medical','Medical Assistance','marka','Marka residential area','High','Reported',5,'MED-04','Caller requests an ambulance and reports chest pain.'],
  [2421,'fire','Alarm Activation','khalda','Khalda villa district','Low','Reported',41,null,'Alarm activation with no smoke confirmed. Verification requested.'],
  [2422,'infra','Street Lighting Outage','uj','Campus pedestrian path','Low','Reported',75,null,'Street lighting outage along a pedestrian path.'],
  [2423,'traffic','Traffic Slowdown','sweifieh','Sweifieh commercial area','Medium','Reported',19,null,'Congestion building after a minor collision at a junction.'],
  [2424,'road','Service Lane Blocked','downtown','Downtown service road','Low','Reported',27,null,'Delivery vehicle blocking a service lane.'],
];
function placeIn(distId, n, forced) {
  if (forced) return forced;
  const d = CMAP[distId], r = rng(n * 131 + 7);
  for (let k = 0; k < 40; k++) {
    const a = r() * Math.PI * 2, rad = (k < 20 ? 48 : 26) * (0.6 + r() * 0.6);
    const pt = [d.x + Math.cos(a) * rad, d.y + Math.sin(a) * rad * 0.8];
    if (inPoly(pt, d.poly)) return [Math.round(pt[0]), Math.round(pt[1])];
  }
  return [d.x, d.y + 30];
}
function buildIncident(row) {
  const [num, cat, title, district, location, priority, status, mins, team, desc, forced] = row;
  const t0 = NOW0 - mins * 60000;
  const tl = [{ t: t0, text: 'Report received through demo intake' }];
  if (team) tl.push({ t: t0 + mins * 0.15 * 60000, text: team + ' assigned by coordinator' });
  if (status === 'Dispatched' || status === 'On Scene') tl.push({ t: t0 + mins * 0.3 * 60000, text: 'Team dispatched to location' });
  if (status === 'On Scene') tl.push({ t: t0 + mins * 0.55 * 60000, text: 'Team arrived on scene' });
  return { id: 'DEMO-' + num, num, cat, title, district, location, priority, status, t0, team, desc, pos: placeIn(district, num, forced), tl };
}
const seedIncidents = () => SEED.map(buildIncident);

const RES = [
  { id: 'veh', label: 'Emergency Vehicles', icon: 'car', color: 'var(--cyan)', items: [['Ambulances',40,31],['Fire Engines',24,20],['Traffic Patrol Units',36,30],['Utility Trucks',20,17]] },
  { id: 'med', label: 'Medical Equipment', icon: 'cross', color: 'var(--green)', items: [['Defibrillators',80,72],['Trauma Kits',120,108],['Oxygen Units',60,54],['Stretchers',40,36]] },
  { id: 'sup', label: 'Support Units', icon: 'teams', color: 'var(--blue)', items: [['Mobile Command Units',10,7],['Light Towers',30,24],['Generators',25,19],['Barrier Trailers',15,12]] },
  { id: 'saf', label: 'Safety Equipment', icon: 'shield', color: 'var(--violet)', items: [['Cones and Barriers',200,170],['Protective Gear Sets',120,102],['Hazard Signage',50,42],['Extinguisher Packs',30,26]] },
].map((c) => ({ ...c, total: c.items.reduce((s, i) => s + i[1], 0), avail: c.items.reduce((s, i) => s + i[2], 0) }));
const RES_TOTAL = RES.reduce((s, c) => s + c.total, 0);
const RES_AVAIL = RES.reduce((s, c) => s + c.avail, 0);

/* ---------- helpers ---------- */
const fmtTime = (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const rel = (ms, now) => {
  const m = Math.max(0, Math.round((now - ms) / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return m + ' min ago';
  const h = Math.floor(m / 60), r = m % 60;
  return h + ' h' + (r ? ' ' + r + ' min' : '') + ' ago';
};
const teamState = (team, incidents) => {
  const inc = incidents.find((i) => i.team === team.id && i.status !== 'Resolved');
  if (!inc) return { status: 'Available', inc: null, district: team.home };
  const status = inc.status === 'On Scene' ? 'Busy' : inc.status === 'Dispatched' ? 'En Route' : 'Assigned';
  return { status, inc, district: inc.district };
};
const AVAIL_BAR = { Available: 100, Assigned: 62, 'En Route': 34, Busy: 12 };
const AVAIL_TXT = { Available: 'Ready now', Assigned: 'Mobilizing', 'En Route': 'Free in ~25 min', Busy: 'Free in ~40 min' };
const countBy = (arr, fn) => arr.reduce((m, x) => { const k = fn(x); m[k] = (m[k] || 0) + 1; return m; }, {});
