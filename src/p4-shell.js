/* ---------- shell ---------- */
const NAV = [
  { id: 'overview', label: 'Overview', icon: 'overview', title: 'Overview' },
  { id: 'incidents', label: 'Live Incidents', icon: 'incidents', title: 'Live Incidents' },
  { id: 'teams', label: 'Response Teams', icon: 'teams', title: 'Response Teams' },
  { id: 'resources', label: 'Resources', icon: 'box', title: 'Resources' },
  { id: 'intel', label: 'City Intelligence', icon: 'city', title: 'City Intelligence' },
  { id: 'analytics', label: 'Analytics', icon: 'chart', title: 'Analytics' },
];

function Sidebar({ page, go, open, activeCount }) {
  return html`<aside className=${'side' + (open ? ' open' : '')} aria-label="Primary">
    <div className="brand"><${Logo} /><div><b>NEXUS AMMAN</b><span>CITY OPERATIONS</span></div></div>
    <div className="nav-label">WORKSPACE</div>
    <nav className="nav">${NAV.map((n) => html`<button key=${n.id} type="button" className=${'nav-item' + (page === n.id ? ' active' : '')} aria-current=${page === n.id ? 'page' : undefined} onClick=${() => go(n.id)}><${Icon} n=${n.icon} />${n.label}${n.id === 'incidents' && html`<span className="cnt num">${activeCount}</span>`}</button>`)}</nav>
    <div className="side-foot">
      <div className="sys">
        <div className="sys-row"><span className="dot"></span>System status<b>Nominal</b></div>
        <div className="sys-row"><span className="dot amber"></span>Environment<b>Demo</b></div>
      </div>
      <div className="me"><span className="avatar">OA</span><div><b>Operations Administrator</b><small>Demo account</small></div></div>
    </div>
  </aside>`;
}

function Header({ page, go, query, setQuery, onMenu, notices, readSet, markAllRead, onOpenIncident, onAbout, onReset }) {
  const [menu, setMenu] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const unread = notices.filter((n) => !readSet.has(n.id)).length;
  const cur = NAV.find((n) => n.id === page);
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return html`<header className="top" ref=${ref}>
    <button type="button" className="icon-btn hamb" aria-label="Open navigation" onClick=${onMenu}><${Icon} n="menu" /></button>
    <div>
      <div className="crumbs"><b>NEXUS AMMAN</b><${Icon} n="right" size=${11} /><b>Operations</b><${Icon} n="right" size=${11} /><span>${cur.label}</span></div>
      <h2>${cur.title}</h2>
    </div>
    <span className="demo-badge">DEMO ENVIRONMENT</span>
    <div className="top-spacer"></div>
    <label className="search"><${Icon} n="search" /><input id="global-search" type="search" placeholder="Search incidents, districts, teams" value=${query} aria-label="Search incidents" onChange=${(e) => { setQuery(e.target.value); if (e.target.value && page !== 'incidents') go('incidents'); }} /></label>
    <span className="date">${date}</span>
    <div className="host">
      <button type="button" className="icon-btn" aria-label=${'Notifications, ' + unread + ' unread'} aria-expanded=${menu === 'n'} onClick=${() => setMenu(menu === 'n' ? null : 'n')}><${Icon} n="bell" />${unread > 0 && html`<span className="badge num">${unread}</span>`}</button>
      ${menu === 'n' && html`<div className="menu" role="menu">
        <div className="menu-h">Alerts<button type="button" className="btn sm" onClick=${markAllRead} disabled=${unread === 0}>Mark all read</button></div>
        <div className="menu-list">${notices.length === 0 ? html`<div className="empty">No critical or high-priority alerts.</div>` : notices.map((n) => html`<button key=${n.id} type="button" className="menu-item" onClick=${() => { onOpenIncident(n.id); setMenu(null); }}><span className=${'unread' + (readSet.has(n.id) ? ' read' : '')}></span><span><b>${n.title}</b><small>${n.id} · ${DMAP[n.district].en} · ${n.priority}</small></span></button>`)}</div>
      </div>`}
    </div>
    <div className="host">
      <button type="button" className="avatar" aria-label="Profile menu" aria-expanded=${menu === 'p'} onClick=${() => setMenu(menu === 'p' ? null : 'p')}>OA</button>
      ${menu === 'p' && html`<div className="menu narrow" role="menu">
        <div className="menu-h" style=${{ display: 'block' }}>Operations Administrator<small style=${{ display: 'block', color: 'var(--mut)', fontWeight: 400 }}>Demo account</small></div>
        <button type="button" className="menu-link" onClick=${() => { setMenu(null); onAbout(); }}><${Icon} n="info" />About this demo</button>
        <button type="button" className="menu-link" onClick=${() => { setMenu(null); onReset(); }}><${Icon} n="refresh" />Reset demo data</button>
      </div>`}
    </div>
  </header>`;
}

function Drawer({ id, onClose, onLocate }) {
  const { incidents, now, advance, assignTeam } = useContext(Ctx);
  const [tab, setTab] = useState('details');
  const inc = incidents.find((i) => i.id === id);
  useEffect(() => setTab('details'), [id]);
  if (!inc) return null;
  const idx = STATUSES.indexOf(inc.status);
  const want = CATS[inc.cat].team;
  const states = TEAMS.map((t) => ({ t, st: teamState(t, incidents) }));
  const free = (x) => x.st.status === 'Available' || x.t.id === inc.team;
  const rec = states.filter((x) => x.t.cat === want && free(x));
  const other = states.filter((x) => x.t.cat !== want && free(x));
  const busy = states.filter((x) => !free(x));
  const nextLabel = inc.status === 'Reported' ? 'Dispatch team' : inc.status === 'Dispatched' ? 'Mark on scene' : inc.status === 'On Scene' ? 'Mark resolved' : 'Resolved';
  return html`<${Fragment}>
    <div className="overlay" onClick=${onClose}></div>
    <aside className="drawer" role="dialog" aria-modal="true" aria-label=${'Incident ' + inc.id}>
      <div className="drawer-h">
        <div className="row"><span className="tag">${inc.id} · FICTIONAL DEMO RECORD</span><button type="button" className="x-btn" aria-label="Close details" onClick=${onClose}><${Icon} n="x" /></button></div>
        <h3>${inc.title}</h3>
        <div style=${{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><${PriPill} p=${inc.priority} /><${StatPill} s=${inc.status} /><span className="pill" style=${{ '--c': CATS[inc.cat].color }}>${CATS[inc.cat].label}</span></div>
      </div>
      <div className="tabs" role="tablist">${[['details', 'Details'], ['timeline', 'Activity timeline']].map(([k, l]) => html`<button key=${k} type="button" role="tab" aria-selected=${tab === k} className=${tab === k ? 'on' : ''} onClick=${() => setTab(k)}>${l}</button>`)}</div>
      <div className="drawer-b">
        ${tab === 'details' ? html`<${Fragment}>
          <div className="steps" aria-label="Progress">${STATUSES.map((s, i) => html`<div key=${s} className=${i <= idx ? 'done' : ''}><i></i>${s}</div>`)}</div>
          <dl className="kv">
            <div><dt>Incident reference</dt><dd className="num">${inc.id}</dd></div>
            <div><dt>Incident type</dt><dd>${CATS[inc.cat].label}</dd></div>
            <div><dt>District</dt><dd>${DMAP[inc.district].en} <span className="ar" style=${{ color: 'var(--mut)', fontWeight: 400 }}>${DMAP[inc.district].ar}</span></dd></div>
            <div><dt>Reported</dt><dd className="num">${fmtTime(inc.t0)} · ${rel(inc.t0, now)}</dd></div>
            <div className="wide"><dt>Illustrative location</dt><dd>${inc.location}, ${DMAP[inc.district].en}<small style=${{ display: 'block', color: 'var(--mut)', fontWeight: 400, fontSize: 12 }}>Schematic position only. Not a real address.</small></dd></div>
            <div className="wide"><dt>Description</dt><dd style=${{ fontWeight: 400 }}>${inc.desc}</dd></div>
          </dl>
          <label className="lbl" htmlFor="assign-team">Assigned team
            <select id="assign-team" className="select full" value=${inc.team || ''} disabled=${inc.status === 'Resolved'} onChange=${(e) => e.target.value && assignTeam(inc.id, e.target.value)}>
              <option value="" disabled>${inc.team ? '' : 'Select a team'}</option>
              <optgroup label=${'Recommended · ' + TEAMCATS[want].label}>${rec.map((x) => html`<option key=${x.t.id} value=${x.t.id}>${x.t.name} (${x.t.id}) · ${x.st.status === 'Available' ? 'Available' : 'Current'}</option>`)}</optgroup>
              ${other.length > 0 && html`<optgroup label="Other available teams">${other.map((x) => html`<option key=${x.t.id} value=${x.t.id}>${x.t.name} (${x.t.id})</option>`)}</optgroup>`}
              <optgroup label="Currently committed">${busy.map((x) => html`<option key=${x.t.id} value=${x.t.id} disabled>${x.t.name} · ${x.st.status}</option>`)}</optgroup>
            </select>
          </label>
        <//>` : html`<ul className="tl">${inc.tl.slice().sort((a, b) => b.t - a.t).map((e, i) => html`<li key=${i}><b>${e.text}</b><small className="num">${fmtTime(e.t)} · ${rel(e.t, now)}</small></li>`)}</ul>`}
      </div>
      <div className="drawer-f">
        <button type="button" className="btn primary" disabled=${inc.status === 'Resolved'} onClick=${() => advance(inc.id)}><${Icon} n=${inc.status === 'On Scene' ? 'check' : 'send'} />${nextLabel}</button>
        <button type="button" className="btn" onClick=${() => onLocate(inc.id)}><${Icon} n="pin" />Show on map</button>
      </div>
    </aside>
  <//>`;
}

function CreateModal({ onClose }) {
  const { createIncident } = useContext(Ctx);
  const [f, setF] = useState({ cat: 'traffic', priority: 'Medium', district: 'abdali', location: '', desc: '' });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.location.trim().length < 3) er.location = 'Enter an illustrative location of at least 3 characters.';
    if (f.desc.trim().length < 10) er.desc = 'Describe the incident in at least 10 characters.';
    setErr(er);
    if (Object.keys(er).length) return;
    createIncident({ ...f, location: f.location.trim(), desc: f.desc.trim() });
    onClose();
  };
  return html`<${Fragment}>
    <div className="overlay" onClick=${onClose}></div>
    <form className="modal" role="dialog" aria-modal="true" aria-labelledby="cm-t" onSubmit=${submit} noValidate>
      <div className="modal-h"><div><h3 id="cm-t">Create Demo Incident</h3><p>Adds a fictional record to this prototype only. Nothing is sent anywhere.</p></div><button type="button" className="x-btn" aria-label="Close" onClick=${onClose}><${Icon} n="x" /></button></div>
      <div className="modal-b">
        <div className="two">
          <label className="lbl" htmlFor="f-cat">Category<select id="f-cat" className="select full" value=${f.cat} onChange=${set('cat')}>${Object.entries(CATS).map(([k, c]) => html`<option key=${k} value=${k}>${c.label}</option>`)}</select></label>
          <label className="lbl" htmlFor="f-pri">Priority<select id="f-pri" className="select full" value=${f.priority} onChange=${set('priority')}>${PRIORITIES.map((p) => html`<option key=${p}>${p}</option>`)}</select></label>
        </div>
        <label className="lbl" htmlFor="f-dist">District<select id="f-dist" className="select full" value=${f.district} onChange=${set('district')}>${DISTRICTS.map((d) => html`<option key=${d.id} value=${d.id}>${d.en}</option>`)}</select></label>
        <label className="lbl" htmlFor="f-loc">Illustrative location<input id="f-loc" className=${'input' + (err.location ? ' invalid' : '')} value=${f.location} onChange=${set('location')} placeholder="For example: 5th Circle" aria-invalid=${!!err.location} />${err.location && html`<span className="err">${err.location}</span>`}</label>
        <label className="lbl" htmlFor="f-desc">Description<textarea id="f-desc" className=${'textarea' + (err.desc ? ' invalid' : '')} value=${f.desc} onChange=${set('desc')} placeholder="What was reported?" aria-invalid=${!!err.desc}></textarea>${err.desc && html`<span className="err">${err.desc}</span>`}</label>
      </div>
      <div className="modal-f"><button type="button" className="btn" onClick=${onClose}>Cancel</button><button type="submit" className="btn primary"><${Icon} n="plus" />Create incident</button></div>
    </form>
  <//>`;
}

function DispatchModal({ teamId, onClose }) {
  const { incidents, assignTeam } = useContext(Ctx);
  const team = TMAP[teamId];
  const open = incidents.filter((i) => i.status !== 'Resolved' && !i.team).sort((a, b) => PRANK[a.priority] - PRANK[b.priority]);
  const rec = open.filter((i) => CATS[i.cat].team === team.cat);
  const [sel, setSel] = useState((rec[0] || open[0] || {}).id || '');
  return html`<${Fragment}>
    <div className="overlay" onClick=${onClose}></div>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="dm-t">
      <div className="modal-h"><div><h3 id="dm-t">Dispatch ${team.name}</h3><p>${TEAMCATS[team.cat].label} · ${team.id}</p></div><button type="button" className="x-btn" aria-label="Close" onClick=${onClose}><${Icon} n="x" /></button></div>
      <div className="modal-b">
        ${open.length === 0 ? html`<div className="empty"><b>No unassigned incidents</b>Create a demo incident first, then dispatch a team.</div>` : html`<label className="lbl" htmlFor="dm-inc">Unassigned incident<select id="dm-inc" className="select full" value=${sel} onChange=${(e) => setSel(e.target.value)}>${open.map((i) => html`<option key=${i.id} value=${i.id}>${i.id} · ${i.title} · ${DMAP[i.district].en} · ${i.priority}${CATS[i.cat].team === team.cat ? ' (matching)' : ''}</option>`)}</select></label>`}
      </div>
      <div className="modal-f"><button type="button" className="btn" onClick=${onClose}>Cancel</button><button type="button" className="btn primary" disabled=${!sel} onClick=${() => { assignTeam(sel, teamId); onClose(); }}><${Icon} n="send" />Dispatch team</button></div>
    </div>
  <//>`;
}

function AboutModal({ onClose }) {
  return html`<${Fragment}>
    <div className="overlay" onClick=${onClose}></div>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ab-t">
      <div className="modal-h"><div><h3 id="ab-t">About this demo</h3><p>NEXUS AMMAN · One City. One Connected Response.</p></div><button type="button" className="x-btn" aria-label="Close" onClick=${onClose}><${Icon} n="x" /></button></div>
      <div className="modal-b" style=${{ color: 'var(--mut)' }}>
        <p>NEXUS AMMAN is a conceptual prototype showing how incidents, response teams and resources could be coordinated in one command center.</p>
        <p>All incidents, teams, resources and figures are fictional demonstration data. This prototype has no connection to Jordanian emergency services, police, hospitals or government databases.</p>
        <p>The map is an illustrative schematic inspired by Amman's districts. Road alignments, positions and scale are not geographically accurate.</p>
      </div>
      <div className="modal-f"><button type="button" className="btn primary" onClick=${onClose}>Close</button></div>
    </div>
  <//>`;
}

function Toasts({ list }) {
  return html`<div className="toasts" role="status" aria-live="polite">${list.map((t) => html`<div key=${t.id} className=${'toast' + (t.warn ? ' warn' : '')}><${Icon} n=${t.warn ? 'info' : 'check'} />${t.msg}</div>`)}</div>`;
}
