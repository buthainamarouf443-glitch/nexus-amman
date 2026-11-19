/* ---------- pages ---------- */
const DemoNote = () => html`<div className="footer"><${Icon} n="info" />All incidents, teams, resources and figures are fictional demonstration data. No connection to real emergency services.</div>`;
function Head({ title, sub, children, loc }) {
  return html`<div className="page-head"><div>${loc && html`<div className="loc"><${Icon} n="pin" />AMMAN, JORDAN</div>`}<h1>${title}</h1><p>${sub}</p></div><div className="actions">${children}</div></div>`;
}
const CreateBtn = () => { const { openCreate } = useContext(Ctx); return html`<button type="button" className="btn primary" onClick=${openCreate}><${Icon} n="plus" />Create Demo Incident</button>`; };

function IncidentTable({ rows, now, onOpen, showTeam }) {
  return html`<div className="tbl-wrap"><table className="tbl">
    <thead><tr><th>Incident ID</th><th>Incident Type</th><th>Location</th><th>Priority</th><th>Reported Time</th><th>Status</th>${showTeam && html`<th>Team</th>`}</tr></thead>
    <tbody>${rows.map((i) => html`<tr key=${i.id} tabIndex="0" onClick=${() => onOpen(i.id)} onKeyDown=${(e) => { if (e.key === 'Enter') onOpen(i.id); }}>
      <td className="id">${i.id}</td>
      <td><div className="tcell"><${CatIcon} cat=${i.cat} /><div><b style=${{ fontWeight: 600 }}>${i.title}</b><small>${CATS[i.cat].label}</small></div></div></td>
      <td>${i.location}<small>${DMAP[i.district].en}</small></td>
      <td><${PriPill} p=${i.priority} /></td>
      <td className="num">${fmtTime(i.t0)}<small>${rel(i.t0, now)}</small></td>
      <td><${StatPill} s=${i.status} /></td>
      ${showTeam && html`<td>${i.team ? TMAP[i.team].name : html`<span style=${{ color: 'var(--dim)' }}>Unassigned</span>`}</td>`}
    </tr>`)}</tbody></table></div>`;
}

function Overview() {
  const { incidents, now, openIncident, go, resolvedToday, mapSel, setMapSel } = useContext(Ctx);
  const active = incidents.filter((i) => i.status !== 'Resolved');
  const pc = countBy(active, (i) => i.priority);
  const events = useMemo(() => incidents.flatMap((i) => i.tl.map((e) => ({ ...e, inc: i }))).sort((a, b) => b.t - a.t).slice(0, 10), [incidents]);
  const recent = incidents.slice().sort((a, b) => b.t0 - a.t0).slice(0, 8);
  return html`<div className="page">
    <${Head} loc=${true} title="Amman Operations Overview" sub="Unified visibility across the city."><${CreateBtn} /><//>
    <div className="stats">
      <${StatCard} icon="incidents" color="var(--red)" label="Active Incidents" value=${active.length} sub="Across monitored districts" spark=${[18, 21, 19, 24, 22, 26, active.length]} />
      <${StatCard} icon="teams" color="var(--cyan)" label="Response Teams" value=${TEAMS.length} sub="Available and assigned" spark=${[15, 16, 16, 17, 17, 18, 18]} />
      <${StatCard} icon="box" color="var(--green)" label="Resources Available" value=${Math.round((RES_AVAIL / RES_TOTAL) * 100) + '%'} sub="Illustrative availability" spark=${[82, 84, 83, 87, 85, 86, 86]} />
      <${StatCard} icon="check" color="var(--blue)" label="Resolved Today" value=${resolvedToday} sub="Demo daily activity" spark=${[12, 18, 22, 27, 31, 34, resolvedToday]} />
    </div>
    <div className="grid-map">
      <${AmmanMap} uid="ov" incidents=${incidents} selectedId=${mapSel} onSelect=${setMapSel} onOpen=${openIncident} />
      <div className="col-fill"><div className="inner">
        <div className="card"><div className="card-h"><h3>Active by priority</h3><span className="tag">${active.length} OPEN</span></div><div className="card-b" style=${{ paddingTop: 0 }}>
          <div className="mix" role="img" aria-label="Active incidents by priority">${PRIORITIES.map((p) => html`<i key=${p} style=${{ flex: pc[p] || 0.0001, background: p === 'Critical' ? 'var(--red)' : p === 'High' ? 'var(--amber)' : p === 'Medium' ? 'var(--cyan)' : 'var(--blue)' }}></i>`)}</div>
          <div className="mix-leg">${PRIORITIES.map((p) => html`<div key=${p}><b className="num">${pc[p] || 0}</b>${p}</div>`)}</div>
        </div></div>
        <div className="card feed"><div className="card-h" style=${{ paddingBottom: 6 }}><h3>Live activity<small>Latest updates across all incidents</small></h3><span className="tag live">LIVE · DEMO</span></div>
          <div className="feed-list">${events.map((e, k) => html`<button key=${e.inc.id + k} type="button" className="ev" onClick=${() => openIncident(e.inc.id)}><span className="ev-ic" style=${{ '--c': pColor(e.inc.priority) }}><${Icon} n=${CATS[e.inc.cat].icon} /></span><span><span className="ev-t">${e.text}</span><small>${e.inc.id} · ${DMAP[e.inc.district].en} · ${rel(e.t, now)}</small></span></button>`)}</div>
        </div>
      </div></div>
    </div>
    <div className="card">
      <div className="card-h"><h3>Recent incidents<small>Fictional demonstration records</small></h3><button type="button" className="btn sm" onClick=${() => go('incidents')}>View all<${Icon} n="arrow" /></button></div>
      <div style=${{ paddingTop: 8 }}><${IncidentTable} rows=${recent} now=${now} onOpen=${openIncident} /></div>
    </div>
    <${DemoNote} />
  </div>`;
}

function IncidentsPage() {
  const { incidents, now, query, setQuery, openIncident } = useContext(Ctx);
  const [pri, setPri] = useState('All');
  const [st, setSt] = useState('Active');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('newest');
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    let r = incidents.filter((i) => {
      if (pri !== 'All' && i.priority !== pri) return false;
      if (st === 'Active' ? i.status === 'Resolved' : st !== 'All' && i.status !== st) return false;
      if (cat !== 'all' && i.cat !== cat) return false;
      if (q) {
        const hay = [i.id, i.title, i.location, DMAP[i.district].en, DMAP[i.district].ar, CATS[i.cat].label, i.team ? TMAP[i.team].name : '', i.desc, i.priority, i.status].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const cmp = { newest: (a, b) => b.t0 - a.t0, oldest: (a, b) => a.t0 - b.t0, priority: (a, b) => PRANK[a.priority] - PRANK[b.priority] || b.t0 - a.t0, district: (a, b) => DMAP[a.district].en.localeCompare(DMAP[b.district].en), status: (a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) };
    return r.sort(cmp[sort]);
  }, [incidents, pri, st, cat, sort, q]);
  const dirty = pri !== 'All' || st !== 'Active' || cat !== 'all' || q;
  return html`<div className="page">
    <${Head} title="Live Incidents" sub="Search, filter and manage fictional incident records across Amman."><${CreateBtn} /><//>
    <div className="card">
      <div className="toolbar">
        <label className="search"><${Icon} n="search" /><input id="inc-search" type="search" placeholder="Search incidents" value=${query} onChange=${(e) => setQuery(e.target.value)} aria-label="Search incidents" /></label>
        <${Seg} label="Priority" value=${pri} onChange=${setPri} options=${['All', ...PRIORITIES].map((p) => ({ v: p, l: p }))} />
        <select className="select" aria-label="Status" value=${st} onChange=${(e) => setSt(e.target.value)}><option value="Active">Status: Active</option><option value="All">Status: All</option>${STATUSES.map((s) => html`<option key=${s} value=${s}>Status: ${s}</option>`)}</select>
        <select className="select" aria-label="Category" value=${cat} onChange=${(e) => setCat(e.target.value)}><option value="all">Category: All</option>${Object.entries(CATS).map(([k, c]) => html`<option key=${k} value=${k}>${c.label}</option>`)}</select>
        <select className="select" aria-label="Sort by" value=${sort} onChange=${(e) => setSort(e.target.value)}><option value="newest">Sort: Newest first</option><option value="oldest">Sort: Oldest first</option><option value="priority">Sort: Priority</option><option value="district">Sort: District</option><option value="status">Sort: Status</option></select>
        ${dirty && html`<button type="button" className="btn sm" onClick=${() => { setPri('All'); setSt('Active'); setCat('all'); setQuery(''); }}>Clear filters</button>`}
        <span className="count num">${rows.length} of ${incidents.length} records</span>
      </div>
      ${rows.length ? html`<${IncidentTable} rows=${rows} now=${now} onOpen=${openIncident} showTeam=${true} />` : html`<div className="empty"><b>No incidents match these filters</b>Try clearing a filter or searching a different term.</div>`}
    </div>
    <${DemoNote} />
  </div>`;
}

function TeamsPage() {
  const { incidents, openIncident } = useContext(Ctx);
  const [sf, setSf] = useState('All');
  const [cf, setCf] = useState('all');
  const [dispatch, setDispatch] = useState(null);
  const rows = TEAMS.map((t) => ({ t, st: teamState(t, incidents) }));
  const sc = countBy(rows, (r) => r.st.status);
  const shown = rows.filter((r) => (sf === 'All' || r.st.status === sf) && (cf === 'all' || r.t.cat === cf));
  const TS = ['Available', 'Assigned', 'En Route', 'Busy'];
  const dist = DISTRICTS.map((d) => ({ d, c: countBy(rows.filter((r) => r.st.district === d.id), (r) => r.st.status), n: rows.filter((r) => r.st.district === d.id).length }));
  const col = { Available: 'var(--green)', Assigned: 'var(--blue)', 'En Route': 'var(--cyan)', Busy: 'var(--amber)' };
  return html`<div className="page">
    <${Head} title="Response Teams" sub="Fictional teams, live status and district coverage."><${CreateBtn} /><//>
    <div style=${{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <${Seg} label="Status" value=${sf} onChange=${setSf} options=${[{ v: 'All', l: 'All ' + TEAMS.length }, ...TS.map((s) => ({ v: s, l: s + ' ' + (sc[s] || 0) }))]} />
      <${Seg} label="Category" value=${cf} onChange=${setCf} options=${[{ v: 'all', l: 'All categories' }, ...Object.entries(TEAMCATS).map(([k, c]) => ({ v: k, l: c.label }))]} />
    </div>
    <div className="grid-intel" style=${{ gridTemplateColumns: 'minmax(0,1.9fr) minmax(280px,1fr)', alignItems: 'start' }}>
      ${shown.length ? html`<div className="team-grid">${shown.map(({ t, st }) => html`<div key=${t.id} className="team">
        <div className="team-top"><span className="chip" style=${{ '--c': TEAMCATS[t.cat].color }}><${Icon} n=${TEAMCATS[t.cat].icon} size=${16} /></span><div style=${{ flex: 1, minWidth: 0 }}><b>${t.name}</b><small>${t.id} · ${TEAMCATS[t.cat].label}</small></div><${TeamPill} s=${st.status} /></div>
        <dl><dt>District</dt><dd>${DMAP[st.district].en}</dd><dt>Current task</dt><dd title=${st.inc ? st.inc.title : 'Standby'}>${st.inc ? st.inc.id + ' · ' + st.inc.title : 'Standby'}</dd></dl>
        <div className="avail"><div className="track"><div className="fill" style=${{ width: AVAIL_BAR[st.status] + '%', '--c': col[st.status] }}></div></div><span>${AVAIL_TXT[st.status]}</span></div>
        ${st.inc ? html`<button type="button" className="btn sm" onClick=${() => openIncident(st.inc.id)}>View incident</button>` : html`<button type="button" className="btn sm primary" onClick=${() => setDispatch(t.id)}><${Icon} n="send" />Dispatch</button>`}
      </div>`)}</div>` : html`<div className="card empty"><b>No teams match</b>Adjust the status or category filter.</div>`}
      <div className="card"><div className="card-h"><h3>District distribution<small>Teams by current district</small></h3></div><div className="card-b">
        <div className="leg-row">${TS.map((s) => html`<span key=${s} style=${{ '--c': col[s] }}><i></i>${s}</span>`)}</div>
        ${dist.map(({ d, c, n }) => html`<div className="dist-row" key=${d.id}><span>${d.en}</span><div className="stack">${TS.map((s) => (c[s] ? html`<i key=${s} style=${{ flex: c[s], '--c': col[s] }}></i>` : null))}</div><b className="num">${n}</b></div>`)}
      </div></div>
    </div>
    ${dispatch && html`<${DispatchModal} teamId=${dispatch} onClose=${() => setDispatch(null)} />`}
    <${DemoNote} />
  </div>`;
}

function ResourcesPage() {
  const [f, setF] = useState('all');
  const list = RES.filter((c) => f === 'all' || c.id === f);
  const pct = Math.round((RES_AVAIL / RES_TOTAL) * 100);
  return html`<div className="page">
    <${Head} title="Resources" sub="Illustrative inventory and availability across the city."><//>
    <div className="grid-intel">
      <div className="card"><div className="card-h"><h3>Overall availability<small>${RES_AVAIL} of ${RES_TOTAL} units available · illustrative</small></h3><span className="tag">DEMO DATA</span></div><div className="card-b">
        <${Donut} big=${pct + '%'} small="AVAILABLE" parts=${RES.map((c) => ({ label: c.label, value: c.avail, color: c.color }))} />
      </div></div>
      <div className="card"><div className="card-h"><h3>By category</h3></div><div className="card-b"><${HBars} unit="%" max=${100} rows=${RES.map((c) => ({ label: c.label, value: Math.round((c.avail / c.total) * 100), color: c.color }))} /></div></div>
    </div>
    <${Seg} label="Resource category" value=${f} onChange=${setF} options=${[{ v: 'all', l: 'All categories' }, ...RES.map((c) => ({ v: c.id, l: c.label }))]} />
    <div className="grid2">${list.map((c) => html`<div key=${c.id} className="card res-card">
      <div className="res-top"><span className="chip" style=${{ '--c': c.color }}><${Icon} n=${c.icon} size=${16} /></span><div style=${{ flex: 1 }}><h3>${c.label}</h3><small>${Math.round((c.avail / c.total) * 100)}% available</small></div></div>
      <div className="track"><div className="fill" style=${{ width: (c.avail / c.total) * 100 + '%', '--c': c.color }}></div></div>
      <div className="res-nums"><div><small>Total</small><b>${c.total}</b></div><div><small>Available</small><b>${c.avail}</b></div><div><small>Assigned</small><b>${c.total - c.avail}</b></div></div>
      <div className="res-items">${c.items.map(([n, t, a]) => html`<div className="res-item" key=${n}><span title=${n}>${n}</span><div className="track" style=${{ height: 6 }}><div className="fill" style=${{ width: (a / t) * 100 + '%', '--c': c.color }}></div></div><b>${a}/${t}</b></div>`)}</div>
    </div>`)}</div>
    <${DemoNote} />
  </div>`;
}

const hourly = (id, base) => { const r = rng(id.split('').reduce((s, ch) => s * 31 + ch.charCodeAt(0), 7)); return Array.from({ length: 24 }, (_, h) => Math.round(base + 4 * (Math.sin(((h - 7) / 24) * Math.PI * 2) + 1) + r() * 3)); };
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0') + ':00');

function IntelPage() {
  const { incidents } = useContext(Ctx);
  const [dsel, setDsel] = useState('abdali');
  const active = incidents.filter((i) => i.status !== 'Resolved');
  const byD = countBy(active, (i) => i.district);
  const byC = countBy(active, (i) => i.cat);
  const d = DMAP[dsel];
  const di = active.filter((i) => i.district === dsel);
  const top = Object.entries(countBy(di, (i) => i.cat)).sort((a, b) => b[1] - a[1])[0];
  const teamsHere = TEAMS.filter((t) => teamState(t, incidents).district === dsel).length;
  return html`<div className="page">
    <${Head} loc=${true} title="City Intelligence" sub="District-level view of demo activity across Amman."><//>
    <div className="grid-intel">
      <div style=${{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <${AmmanMap} uid="in" compact=${true} incidents=${[]} heat=${byD} selDistrict=${dsel} onDistrict=${setDsel} />
        <div className="note"><${Icon} n="info" />Illustrative district map. Shading and badges show demo active incidents per district. Select a district.</div>
      </div>
      <div className="card"><div className="card-h"><h3><span className="ar" style=${{ color: 'var(--mut)', fontWeight: 400, marginInlineEnd: 8 }}>${d.ar}</span>${d.full || d.en}<small>${d.about}</small></h3><span className="tag">DEMO DATA</span></div><div className="card-b">
        <div className="facts"><div><small>Active</small><b>${di.length}</b></div><div><small>Teams</small><b>${teamsHere}</b></div><div><small>Top category</small><b style=${{ fontSize: 13, lineHeight: '26px' }}>${top ? CATS[top[0]].label : 'None'}</b></div></div>
        <div style=${{ marginTop: 18 }}><div className="leg-inline" style=${{ marginBottom: 6 }}><span style=${{ '--c': 'var(--cyan)' }}><i></i>Illustrative hourly activity (demo)</span></div>
          <${LineChart} labels=${HOURS} height=${190} series=${[{ name: d.en, color: 'var(--cyan)', values: hourly(dsel, 2 + di.length * 0.6) }]} /></div>
      </div></div>
    </div>
    <div className="dgrid">${DISTRICTS.map((x) => html`<button key=${x.id} type="button" className=${'dcard' + (x.id === dsel ? ' on' : '')} aria-pressed=${x.id === dsel} onClick=${() => setDsel(x.id)}><div><b>${x.en}</b><span className="ar">${x.ar}</span></div><div className="row"><span className="n">${byD[x.id] || 0}</span><small>active</small></div></button>`)}</div>
    <div className="grid2">
      <div className="card"><div className="card-h"><h3>Incident distribution by district<small>Illustrative · demo data</small></h3></div><div className="card-b"><${HBars} rows=${DISTRICTS.map((x) => ({ label: x.en, value: byD[x.id] || 0 })).sort((a, b) => b.value - a.value)} /></div></div>
      <div className="card"><div className="card-h"><h3>Category breakdown<small>Active demo incidents</small></h3></div><div className="card-b"><${Donut} big=${active.length} small="ACTIVE" parts=${Object.entries(CATS).map(([k, c]) => ({ label: c.label, value: byC[k] || 0, color: c.color }))} /></div></div>
    </div>
    <${DemoNote} />
  </div>`;
}

function AnalyticsPage() {
  const { incidents } = useContext(Ctx);
  const [range, setRange] = useState('24h');
  const active = incidents.filter((i) => i.status !== 'Resolved');
  const byC = countBy(incidents, (i) => i.cat), byD = countBy(incidents, (i) => i.district), byS = countBy(incidents, (i) => i.status);
  const trend = useMemo(() => {
    const cfg = { '24h': [24, (i) => String(i).padStart(2, '0') + ':00', 5], '7d': [7, (i) => ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'][i], 38], '30d': [30, (i) => 'D' + (i + 1), 34] }[range];
    const r = rng(range.length * 97 + 5);
    const rep = Array.from({ length: cfg[0] }, (_, i) => Math.round(cfg[2] + cfg[2] * 0.6 * Math.sin((i / cfg[0]) * Math.PI * 2 + 1) + r() * cfg[2] * 0.3));
    const res = rep.map((v, i) => Math.max(1, Math.round(v * 0.85 + (i % 3) - 1)));
    return { labels: Array.from({ length: cfg[0] }, (_, i) => cfg[1](i)), rep, res };
  }, [range]);
  const sCol = { Reported: 'var(--slate)', Dispatched: 'var(--blue)', 'On Scene': 'var(--cyan)', Resolved: 'var(--green)' };
  return html`<div className="page">
    <${Head} title="Analytics" sub="Illustrative trends across incidents, districts and resources."><${Seg} label="Range" value=${range} onChange=${setRange} options=${[{ v: '24h', l: 'Last 24 hours' }, { v: '7d', l: '7 days' }, { v: '30d', l: '30 days' }]} /><//>
    <div className="card"><div className="card-h"><h3>Response activity trend<small>Reported and resolved incidents · illustrative</small></h3><div className="leg-inline"><span style=${{ '--c': 'var(--cyan)' }}><i></i>Reported</span><span style=${{ '--c': 'var(--green)' }}><i></i>Resolved</span></div></div><div className="card-b"><${LineChart} labels=${trend.labels} series=${[{ name: 'Reported', color: 'var(--cyan)', values: trend.rep }, { name: 'Resolved', color: 'var(--green)', values: trend.res }]} /></div></div>
    <div className="grid2">
      <div className="card"><div className="card-h"><h3>Incidents by category<small>${incidents.length} demo records</small></h3></div><div className="card-b"><${HBars} rows=${Object.entries(CATS).map(([k, c]) => ({ label: c.label, value: byC[k] || 0, color: c.color })).sort((a, b) => b.value - a.value)} /></div></div>
      <div className="card"><div className="card-h"><h3>Incident status distribution</h3></div><div className="card-b"><${Donut} big=${incidents.length} small="RECORDS" parts=${STATUSES.map((s) => ({ label: s, value: byS[s] || 0, color: sCol[s] }))} /></div></div>
      <div className="card"><div className="card-h"><h3>Incidents by district<small>Illustrative</small></h3></div><div className="card-b"><${HBars} rows=${DISTRICTS.map((x) => ({ label: x.en, value: byD[x.id] || 0 })).sort((a, b) => b.value - a.value)} /></div></div>
      <div className="card"><div className="card-h"><h3>Resource availability<small>${RES_AVAIL} of ${RES_TOTAL} units · illustrative</small></h3></div><div className="card-b"><${HBars} unit="%" max=${100} rows=${RES.map((c) => ({ label: c.label, value: Math.round((c.avail / c.total) * 100), color: c.color }))} /></div></div>
    </div>
    <${DemoNote} />
  </div>`;
}

/* ---------- app ---------- */
const PAGES = { overview: Overview, incidents: IncidentsPage, teams: TeamsPage, resources: ResourcesPage, intel: IntelPage, analytics: AnalyticsPage };
function App() {
  const [page, setPage] = useState('overview');
  const [incidents, setIncidents] = useState(seedIncidents);
  const [drawer, setDrawer] = useState(null);
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [mapSel, setMapSel] = useState(null);
  const [read, setRead] = useState(() => new Set());
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 20000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { if (modal) setModal(null); else if (drawer) setDrawer(null); else setNavOpen(false); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [modal, drawer]);
  const toast = (msg, warn) => { const id = Math.random(); setToasts((l) => [...l, { id, msg, warn }]); setTimeout(() => setToasts((l) => l.filter((x) => x.id !== id)), 3400); };
  const go = (p) => { setPage(p); setNavOpen(false); window.scrollTo(0, 0); };
  const advance = (id) => {
    const inc = incidents.find((i) => i.id === id); if (!inc || inc.status === 'Resolved') return;
    let team = inc.team;
    if (inc.status === 'Reported' && !team) {
      const want = CATS[inc.cat].team, free = (t) => teamState(t, incidents).status === 'Available';
      const c = TEAMS.find((t) => t.cat === want && free(t)) || TEAMS.find(free);
      if (!c) { toast('No team is available to dispatch right now.', true); return; }
      team = c.id;
    }
    const next = STATUSES[STATUSES.indexOf(inc.status) + 1], t = Date.now();
    const text = next === 'Dispatched' ? team + ' dispatched to location' : next === 'On Scene' ? 'Team arrived on scene' : 'Incident resolved and team released';
    const add = team !== inc.team ? [{ t, text: team + ' assigned by coordinator' }] : [];
    setIncidents((l) => l.map((i) => (i.id === id ? { ...i, status: next, team, tl: [...i.tl, ...add, { t: t + 1, text }] } : i)));
    toast(id + ' is now ' + next);
  };
  const assignTeam = (id, teamId) => {
    const t = Date.now();
    setIncidents((l) => l.map((i) => (i.id === id ? { ...i, team: teamId, tl: [...i.tl, { t, text: TMAP[teamId].name + ' (' + teamId + ') assigned by coordinator' }] } : i)));
    toast(TMAP[teamId].name + ' assigned to ' + id);
  };
  const createIncident = (f) => {
    const num = Math.max(...incidents.map((i) => i.num)) + 1, t = Date.now();
    const inc = { id: 'DEMO-' + num, num, cat: f.cat, title: CATS[f.cat].label, district: f.district, location: f.location, priority: f.priority, status: 'Reported', t0: t, team: null, desc: f.desc, pos: placeIn(f.district, num), tl: [{ t, text: 'Report received through demo intake' }] };
    setIncidents((l) => [inc, ...l]);
    setNavOpen(false);
    setDrawer(inc.id);
    toast('Demo incident ' + inc.id + ' created');
  };
  const reset = () => { setIncidents(seedIncidents()); setDrawer(null); setMapSel(null); setQuery(''); setRead(new Set()); toast('Demo data reset'); };
  const locate = (id) => { setDrawer(null); setMapSel(id); go('overview'); };
  const active = incidents.filter((i) => i.status !== 'Resolved');
  const notices = active.filter((i) => i.priority === 'Critical' || i.priority === 'High').sort((a, b) => PRANK[a.priority] - PRANK[b.priority] || b.t0 - a.t0);
  const ctx = { incidents, now, query, setQuery, openIncident: setDrawer, openCreate: () => setModal({ k: 'create' }), advance, assignTeam, createIncident, go, mapSel, setMapSel, resolvedToday: 37 + incidents.filter((i) => i.status === 'Resolved').length };
  const Page = PAGES[page];
  return html`<${Ctx.Provider} value=${ctx}>
    <div className="app">
      <${Sidebar} page=${page} go=${go} open=${navOpen} activeCount=${active.length} />
      ${navOpen && html`<div className="navscrim" onClick=${() => setNavOpen(false)}></div>`}
      <div className="main">
        <${Header} page=${page} go=${go} query=${query} setQuery=${setQuery} onMenu=${() => setNavOpen(true)} notices=${notices} readSet=${read} markAllRead=${() => { setRead(new Set(notices.map((n) => n.id))); toast('Alerts marked as read'); }} onOpenIncident=${(id) => { setRead(new Set([...read, id])); setDrawer(id); }} onAbout=${() => setModal({ k: 'about' })} onReset=${reset} />
        <main><${Page} key=${page} /></main>
      </div>
      ${drawer && html`<${Drawer} id=${drawer} onClose=${() => setDrawer(null)} onLocate=${locate} />`}
      ${modal && modal.k === 'create' && html`<${CreateModal} onClose=${() => setModal(null)} />`}
      ${modal && modal.k === 'about' && html`<${AboutModal} onClose=${() => setModal(null)} />`}
      <${Toasts} list=${toasts} />
    </div>
  <//>`;
}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
