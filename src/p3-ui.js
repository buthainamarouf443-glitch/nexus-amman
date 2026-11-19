/* ---------- small shared components ---------- */
const PriPill = ({ p }) => html`<span className=${'pill p-' + p}>${p}</span>`;
const StatPill = ({ s }) => html`<span className=${'pill ' + sClass(s)}>${s}</span>`;
const TeamPill = ({ s }) => html`<span className=${'pill ' + tClass(s)}>${s}</span>`;
const CatIcon = ({ cat, tc }) => {
  const c = tc ? TEAMCATS[cat] : CATS[cat];
  return html`<span className="ic" style=${{ '--c': c.color }}><${Icon} n=${c.icon} size=${15} /></span>`;
};
function Seg({ value, onChange, options, label }) {
  return html`<div className="seg" role="group" aria-label=${label}>${options.map((o) => html`<button key=${o.v} type="button" className=${value === o.v ? 'on' : ''} aria-pressed=${value === o.v} onClick=${() => onChange(o.v)}>${o.l}</button>`)}</div>`;
}
function Spark({ values, color }) {
  const w = 92, h = 34, mx = Math.max(...values), mn = Math.min(...values);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 6) + 3, h - 5 - ((v - mn) / (mx - mn || 1)) * (h - 12)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');
  const last = pts[pts.length - 1];
  return html`<svg className="spark" viewBox=${'0 0 ' + w + ' ' + h} aria-hidden="true"><path d=${line + 'L' + last[0] + ',' + h + 'L' + pts[0][0] + ',' + h + 'Z'} fill=${color} fillOpacity=".12"/><path d=${line} fill="none" stroke=${color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx=${last[0]} cy=${last[1]} r="2.6" fill=${color}/></svg>`;
}
function StatCard({ icon, color, label, value, sub, spark }) {
  return html`<div className="card stat" style=${{ '--c': color }}>
    <div className="stat-top"><span className="chip"><${Icon} n=${icon} size=${16} /></span>${label}</div>
    <div className="stat-val">${value}</div>
    <div className="stat-sub">${sub}</div>
    ${spark && html`<${Spark} values=${spark} color=${color} />`}
  </div>`;
}
function HBars({ rows, max, unit }) {
  const m = max || Math.max(1, ...rows.map((r) => r.value));
  return html`<div className="bars">${rows.map((r) => html`<div className="bar-row" key=${r.label}><span title=${r.label}>${r.label}</span><div className="track"><div className="fill" style=${{ width: (r.value / m) * 100 + '%', '--c': r.color || 'var(--cyan)' }}></div></div><b>${r.value}${unit || ''}</b></div>`)}</div>`;
}
function Donut({ parts, big, small }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  let off = 0;
  return html`<div className="donut-wrap">
    <svg className="donut" viewBox="0 0 42 42" role="img" aria-label=${small}>
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--elev)" strokeWidth="5.2"/>
      ${parts.map((p) => { const len = (p.value / total) * 100; const el = html`<circle key=${p.label} cx="21" cy="21" r="15.9155" fill="none" stroke=${p.color} strokeWidth="5.2" strokeDasharray=${Math.max(0, len - 0.8) + ' ' + (100 - Math.max(0, len - 0.8))} strokeDashoffset=${25 - off} />`; off += len; return el; })}
      <text className="big" x="21" y="22.5" textAnchor="middle" fontSize="8.6" fontWeight="700" style=${{ font: '700 8.6px Inter,sans-serif' }}>${big}</text>
      <text className="sm" x="21" y="27.6" textAnchor="middle" style=${{ font: '500 3.1px Inter,sans-serif' }}>${small}</text>
    </svg>
    <div className="d-leg">${parts.map((p) => html`<div key=${p.label} style=${{ '--c': p.color }}><i></i>${p.label}<b>${p.value}</b></div>`)}</div>
  </div>`;
}
function LineChart({ labels, series, height }) {
  const W = 620, H = height || 230, L = 34, R = 14, T = 14, B = 26;
  const all = series.flatMap((s) => s.values);
  const mx = Math.max(...all), step = mx > 60 ? 20 : mx > 30 ? 10 : 5, top = Math.ceil(mx / step) * step;
  const X = (i) => L + (i / (labels.length - 1)) * (W - L - R), Y = (v) => T + (1 - v / top) * (H - T - B);
  const ticks = []; for (let v = 0; v <= top; v += step) ticks.push(v);
  const every = Math.ceil(labels.length / 8);
  return html`<svg className="chart" viewBox=${'0 0 ' + W + ' ' + H} role="img" aria-label="Illustrative response activity trend">
    <defs>${series.map((s, i) => html`<linearGradient key=${i} id=${'lg' + i} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor=${s.color} stopOpacity=".28"/><stop offset="1" stopColor=${s.color} stopOpacity="0"/></linearGradient>`)}</defs>
    ${ticks.map((v) => html`<g key=${v}><line className="grid" x1=${L} x2=${W - R} y1=${Y(v)} y2=${Y(v)} strokeDasharray=${v === 0 ? '' : '3 4'} /><text x=${L - 8} y=${Y(v) + 3.5} textAnchor="end">${v}</text></g>`)}
    ${labels.map((l, i) => (i % every === 0 ? html`<text key=${i} x=${X(i)} y=${H - 7} textAnchor="middle">${l}</text>` : null))}
    ${series.map((s, si) => {
      const d = s.values.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join('');
      const n = s.values.length - 1;
      return html`<g key=${s.name}>${si === 0 && html`<path d=${d + 'L' + X(n) + ',' + Y(0) + 'L' + X(0) + ',' + Y(0) + 'Z'} fill=${'url(#lg0)'} />`}<path d=${d} fill="none" stroke=${s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/><circle cx=${X(n)} cy=${Y(s.values[n])} r="4" fill=${s.color} stroke="var(--bg2)" strokeWidth="2"/></g>`;
    })}
  </svg>`;
}

/* ---------- the Amman map ---------- */
function AmmanMap({ uid, incidents, selectedId, onSelect, onOpen, compact, heat, selDistrict, onDistrict }) {
  const [z, setZ] = useState(1);
  const [c, setC] = useState([MW / 2, MH / 2]);
  const [lv, setLv] = useState({ Critical: true, High: true, Normal: true });
  const ref = useRef(null), drag = useRef(null);
  const [asp, setAsp] = useState(1.5);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const f = () => { const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) setAsp(r.width / r.height); };
    f();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(f); ro.observe(el); return () => ro.disconnect();
  }, []);
  const bw = Math.max(900, Math.min(1000, 560 * asp)), bh = bw / asp;
  const w = bw / z, h = bh / z;
  const cx = Math.min(Math.max(MW - w / 2, MW / 2), Math.max(Math.min(w / 2, MW / 2), c[0])), cy = Math.min(Math.max(MH - h / 2, MH / 2), Math.max(Math.min(h / 2, MH / 2), c[1]));
  const vb = [cx - w / 2, cy - h / 2, w, h].map((v) => v.toFixed(1)).join(' ');
  const maxHeat = heat ? Math.max(1, ...Object.values(heat)) : 1;
  const sel = incidents && incidents.find((i) => i.id === selectedId);
  const level = (p) => (p === 'Critical' ? 'Critical' : p === 'High' ? 'High' : 'Normal');
  const zoom = (dz) => { const nz = Math.min(3, Math.max(1, z + dz)); setZ(nz); if (nz === 1) setC([MW / 2, MH / 2]); };
  const down = (e) => { if (compact) return; drag.current = { x: e.clientX, y: e.clientY, c: [cx, cy], moved: false, id: e.pointerId }; };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) { d.moved = true; try { ref.current.setPointerCapture(d.id); } catch (_) {} }
    const r = ref.current.getBoundingClientRect(), s = Math.min(r.width / w, r.height / h);
    setC([d.c[0] - dx / s, d.c[1] - dy / s]);
  };
  const up = () => { drag.current = null; };
  const pid = (s) => uid + '-' + s;
  return html`<div className=${'map-card' + (compact ? ' compact' : '')}>
    <svg ref=${ref} className=${'map-svg' + (compact ? ' nopan' : '')} viewBox=${vb} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Illustrative schematic map of Amman with demo data" onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${up}>
      <defs>${CITY.map((d) => html`<clipPath key=${d.id} id=${pid(d.id)}><path d=${d.path}/></clipPath>`)}</defs>
      <rect x="-300" y="-300" width=${MW + 600} height=${MH + 600} fill="var(--map-bg)"/>
      <path d=${CONTOURS} fill="none" stroke="var(--map-contour)" strokeWidth="1.1"/>
      <path d=${ROAD_D.wadi} fill="none" stroke="var(--map-wadi)" strokeWidth="13" strokeLinecap="round" opacity=".7"/>
      ${CITY.map((d) => {
        const hv = heat ? heat[d.id] || 0 : 0;
        const fill = heat ? 'color-mix(in srgb, var(--cyan) ' + (10 + (hv / maxHeat) * 42).toFixed(0) + '%, var(--map-land))' : d.alt ? 'var(--map-land2)' : 'var(--map-land)';
        return html`<g key=${d.id}>
          <path className=${'cell' + (onDistrict ? ' click' : '')} d=${d.path} fill=${fill} stroke=${selDistrict === d.id ? 'var(--cyan)' : 'var(--map-line)'} strokeWidth=${selDistrict === d.id ? 2.4 : 1.2} strokeLinejoin="round" onClick=${onDistrict ? () => onDistrict(d.id) : undefined} />
          <g clipPath=${'url(#' + pid(d.id) + ')'} style=${{ pointerEvents: 'none' }}><path d=${d.st} fill="none" stroke="var(--map-minor)" strokeWidth="1" strokeLinecap="round"/></g>
        </g>`;
      })}
      <path d=${polyD(OUTLINE)} fill="none" stroke="var(--map-major)" strokeWidth="1.4" strokeDasharray="2 6" strokeLinecap="round" style=${{ pointerEvents: 'none' }}/>
      <g style=${{ pointerEvents: 'none' }} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d=${ROAD_D.major} stroke="var(--map-major)" strokeWidth="2.2"/>
        <path d=${ROAD_D.hwy} stroke="var(--map-hwy)" strokeWidth="3.6"/>
      </g>
      <g style=${{ pointerEvents: 'none' }}>${CIRCLES.map((p, i) => html`<g key=${i}><circle cx=${p[0]} cy=${p[1]} r="8.5" fill="var(--map-bg)" stroke="var(--map-hwy)" strokeWidth="1.4"/><text className="cir" x=${p[0]} y=${p[1] + 0.5}>${i + 1}</text></g>`)}</g>
      ${CITY.map((d) => html`<g key=${d.id} style=${{ pointerEvents: 'none' }}><text className="dl-en" x=${d.lx} y=${d.ly} textAnchor="middle">${d.id === 'downtown' ? 'Downtown / Al-Balad' : d.en}</text><text className="dl-ar" x=${d.lx} y=${d.ly + 14} textAnchor="middle">${d.ar}</text>${heat && html`<g><circle cx=${d.lx} cy=${d.ly + 32} r="9" fill="var(--cyan)"/><text x=${d.lx} y=${d.ly + 32.5} textAnchor="middle" dominantBaseline="central" style=${{ font: '700 10px Inter,sans-serif', fill: 'var(--on-cyan)' }}>${heat[d.id] || 0}</text></g>`}</g>`)}
      ${LANDMARKS.map((m) => html`<g key=${m.id} style=${{ pointerEvents: 'none' }}>
        <rect x=${m.x - 5.5} y=${m.y - 5.5} width="11" height="11" rx="3" transform=${'rotate(45 ' + m.x + ' ' + m.y + ')'} fill="var(--map-bg)" stroke="var(--cyan)" strokeWidth="1.6"/>
        <circle cx=${m.x} cy=${m.y} r="1.8" fill="var(--cyan)"/>
        ${!m.noLabel && html`<text className="lm-en" x=${m.x + m.dx} y=${m.y + m.dy} textAnchor=${m.a}>${m.en}</text><text className="lm-ar" x=${m.x + m.dx} y=${m.y + m.dy + 12} textAnchor=${m.a}>${m.ar}</text>`}
      </g>`)}
      ${!compact && incidents && incidents.filter((i) => i.status !== 'Resolved' && lv[level(i.priority)]).map((i) => {
        const col = pColor(i.priority), isSel = i.id === selectedId;
        return html`<g key=${i.id} className="mk" tabIndex="0" role="button" aria-label=${i.id + ' ' + i.title + ', ' + i.priority + ' priority, ' + DMAP[i.district].en} transform=${'translate(' + i.pos[0] + ' ' + i.pos[1] + ')'} onPointerDown=${(e) => e.stopPropagation()} onClick=${(e) => { e.stopPropagation(); onSelect(i.id); }} onKeyDown=${(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(i.id); } }}>
          ${i.priority === 'Critical' && html`<circle className="pulse" r="11" fill=${col} opacity=".4"/>`}
          <circle className="selring" r="19" fill="none" stroke="var(--cyan)" strokeWidth="1.6" strokeDasharray="3 3" opacity=${isSel ? 1 : 0}/>
          <g className="dotc"><circle r="12" fill=${col} stroke="var(--map-bg)" strokeWidth="2.4"/><svg x="-7" y="-7" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke=${i.priority === 'High' ? '#2A1A00' : '#071218'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML=${{ __html: ICONS[CATS[i.cat].icon] }}/></g>
        </g>`;
      })}
    </svg>
    ${!compact && html`
      <div className="m-badge"><${Icon} n="info" /> Illustrative Amman City Map — Demo Data</div>
      <div className="m-ctrl">
        <button type="button" aria-label="Zoom in" title="Zoom in" onClick=${() => zoom(0.5)} disabled=${z >= 3}><${Icon} n="plus" /></button>
        <button type="button" aria-label="Zoom out" title="Zoom out" onClick=${() => zoom(-0.5)} disabled=${z <= 1}><${Icon} n="minus" /></button>
        <button type="button" aria-label="Recenter map" title="Recenter" onClick=${() => { setZ(1); setC([MW / 2, MH / 2]); }}><${Icon} n="target" /></button>
      </div>
      <div className="m-legend">
        <h4>LEGEND</h4>
        ${[['Critical', 'var(--red)'], ['High', 'var(--amber)'], ['Normal', 'var(--cyan)']].map(([k, col]) => html`<button type="button" key=${k} className=${'lg' + (lv[k] ? '' : ' off')} style=${{ '--c': col }} aria-pressed=${lv[k]} onClick=${() => setLv({ ...lv, [k]: !lv[k] })}><i></i>${k} incident</button>`)}
        <div className="lg"><span className="sq" style=${{ transform: 'rotate(45deg) scale(.8)' }}></span>Landmark</div>
        <div className="lg"><span className="ring"></span>Numbered circle</div>
      </div>
      <div className="m-nav">
        <div className="m-scale"><i></i><span>Schematic scale</span></div>
        <svg className="m-north" viewBox="0 0 22 30" aria-label="North"><path d="M11 3 17 20 11 16.5 5 20Z" fill="var(--cyan)"/><text x="11" y="29" textAnchor="middle" style=${{ font: '700 8px Inter,sans-serif', fill: 'var(--mut)' }}>N</text></svg>
      </div>
      ${sel && html`<div className="m-pop" role="dialog" aria-label="Incident information">
        <div className="top-row"><div><span className="id">${sel.id}</span><h4>${sel.title}</h4></div><button type="button" className="x-btn" aria-label="Close" onClick=${() => onSelect(null)}><${Icon} n="x" /></button></div>
        <dl>
          <dt>Type</dt><dd>${CATS[sel.cat].label}</dd>
          <dt>Neighborhood</dt><dd>${DMAP[sel.district].en}</dd>
          <dt>Priority</dt><dd><${PriPill} p=${sel.priority} /></dd>
          <dt>Status</dt><dd><${StatPill} s=${sel.status} /></dd>
          <dt>Assigned team</dt><dd>${sel.team ? TMAP[sel.team].name : 'Unassigned'}</dd>
        </dl>
        <button type="button" className="btn primary sm" style=${{ width: '100%' }} onClick=${() => onOpen(sel.id)}>View full details <${Icon} n="arrow" /></button>
      </div>`}
    `}
  </div>`;
}
