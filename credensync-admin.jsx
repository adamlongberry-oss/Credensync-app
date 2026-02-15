import { useState, useCallback } from "react";

// Sample data - simulates a staffing company's CRNA roster
const FACILITIES = [
  { id: "f1", name: "OhioHealth Berger Hospital", city: "Circleville", state: "OH" },
  { id: "f2", name: "OhioHealth Grady Memorial", city: "Delaware", state: "OH" },
  { id: "f3", name: "Blanchard Valley Hospital", city: "Findlay", state: "OH" },
  { id: "f4", name: "Adena Regional Medical Center", city: "Chillicothe", state: "OH" },
  { id: "f5", name: "Licking Memorial Hospital", city: "Newark", state: "OH" },
  { id: "f6", name: "Knox Community Hospital", city: "Mt. Vernon", state: "OH" },
];

const PROVIDERS = [
  {
    id: "p1", firstName: "Adam", lastName: "Longberry", credentials: "CRNA, DNAP",
    email: "adam@example.com", phone: "740-334-0171", npi: "1932554078",
    primaryState: "OH", status: "active", profileComplete: 92,
    licenses: [
      { state: "OH", number: "RN-XXXX-1234", expiration: "2026-09-30", status: "Active" },
      { state: "KY", number: "APRN-5678", expiration: "2026-06-15", status: "Active" },
    ],
    certifications: [
      { name: "NBCRNA", expiration: "2028-06-30", status: "Active" },
      { name: "BLS", expiration: "2026-04-15", status: "Active" },
      { name: "ACLS", expiration: "2026-05-20", status: "Active" },
      { name: "PALS", expiration: "2026-08-10", status: "Active" },
    ],
    deaExpiration: "2027-03-31",
    malpracticeExpiration: "2026-07-01",
    facilityStatus: { f1: "active", f2: "active", f3: "pending", f4: "none", f5: "none", f6: "none" },
    tasks: [
      { id: "t1", task: "Submit privileges application", facility: "Blanchard Valley", due: "2026-02-28", status: "in_progress", assignee: "Jody" },
      { id: "t2", task: "Upload updated ACLS card", facility: "All", due: "2026-05-20", status: "pending", assignee: "Provider" },
      { id: "t3", task: "CAQH re-attestation", facility: "CAQH", due: "2026-03-15", status: "pending", assignee: "Provider" },
    ],
  },
  {
    id: "p2", firstName: "Sarah", lastName: "Mitchell", credentials: "CRNA, MSN",
    email: "sarah@example.com", phone: "614-555-0102", npi: "1234567890",
    primaryState: "OH", status: "active", profileComplete: 100,
    licenses: [
      { state: "OH", number: "RN-XXXX-5678", expiration: "2027-01-15", status: "Active" },
    ],
    certifications: [
      { name: "NBCRNA", expiration: "2027-12-31", status: "Active" },
      { name: "BLS", expiration: "2026-03-01", status: "Active" },
      { name: "ACLS", expiration: "2026-03-01", status: "Active" },
    ],
    deaExpiration: "2027-08-15",
    malpracticeExpiration: "2026-12-01",
    facilityStatus: { f1: "active", f2: "none", f3: "none", f4: "active", f5: "active", f6: "none" },
    tasks: [
      { id: "t4", task: "Renew BLS certification", facility: "All", due: "2026-03-01", status: "urgent", assignee: "Provider" },
      { id: "t5", task: "Renew ACLS certification", facility: "All", due: "2026-03-01", status: "urgent", assignee: "Provider" },
    ],
  },
  {
    id: "p3", firstName: "James", lastName: "Park", credentials: "CRNA, DNP",
    email: "james@example.com", phone: "614-555-0203", npi: "9876543210",
    primaryState: "OH", status: "active", profileComplete: 78,
    licenses: [
      { state: "OH", number: "RN-XXXX-9012", expiration: "2026-04-30", status: "Active" },
      { state: "WV", number: "APRN-3456", expiration: "2026-11-30", status: "Active" },
    ],
    certifications: [
      { name: "NBCRNA", expiration: "2029-06-30", status: "Active" },
      { name: "BLS", expiration: "2027-01-15", status: "Active" },
      { name: "ACLS", expiration: "2026-12-20", status: "Active" },
    ],
    deaExpiration: "2026-06-30",
    malpracticeExpiration: "2026-09-15",
    facilityStatus: { f1: "none", f2: "active", f3: "active", f4: "none", f5: "none", f6: "active" },
    tasks: [
      { id: "t6", task: "Complete CAQH profile (Practice Locations missing)", facility: "CAQH", due: "2026-03-01", status: "in_progress", assignee: "Provider" },
      { id: "t7", task: "Renew OH license", facility: "All", due: "2026-04-30", status: "pending", assignee: "Jody" },
      { id: "t8", task: "Renew DEA registration", facility: "All", due: "2026-06-30", status: "pending", assignee: "Provider" },
    ],
  },
  {
    id: "p4", firstName: "Maria", lastName: "Santos", credentials: "CRNA, MSN",
    email: "maria@example.com", phone: "614-555-0304", npi: "5678901234",
    primaryState: "OH", status: "onboarding", profileComplete: 45,
    licenses: [
      { state: "OH", number: "Pending", expiration: "", status: "Pending" },
    ],
    certifications: [
      { name: "NBCRNA", expiration: "2030-06-30", status: "Active" },
      { name: "BLS", expiration: "2027-09-01", status: "Active" },
      { name: "ACLS", expiration: "2027-09-01", status: "Active" },
    ],
    deaExpiration: "",
    malpracticeExpiration: "2026-12-01",
    facilityStatus: { f1: "pending", f2: "none", f3: "none", f4: "pending", f5: "none", f6: "none" },
    tasks: [
      { id: "t9", task: "Complete CredenSync profile", facility: "All", due: "2026-02-20", status: "urgent", assignee: "Provider" },
      { id: "t10", task: "Obtain OH state license", facility: "All", due: "2026-03-15", status: "in_progress", assignee: "Jody" },
      { id: "t11", task: "Submit Berger Hospital application", facility: "OhioHealth Berger", due: "2026-03-01", status: "blocked", assignee: "Jody" },
      { id: "t12", task: "Submit Adena application", facility: "Adena Regional", due: "2026-03-01", status: "blocked", assignee: "Jody" },
      { id: "t13", task: "Apply for DEA registration", facility: "All", due: "2026-03-15", status: "pending", assignee: "Provider" },
    ],
  },
  {
    id: "p5", firstName: "David", lastName: "Chen", credentials: "CRNA, DNAP",
    email: "david@example.com", phone: "614-555-0405", npi: "3456789012",
    primaryState: "OH", status: "active", profileComplete: 97,
    licenses: [
      { state: "OH", number: "RN-XXXX-7890", expiration: "2027-05-31", status: "Active" },
      { state: "IN", number: "APRN-1234", expiration: "2027-03-15", status: "Active" },
    ],
    certifications: [
      { name: "NBCRNA", expiration: "2028-12-31", status: "Active" },
      { name: "BLS", expiration: "2027-06-01", status: "Active" },
      { name: "ACLS", expiration: "2027-06-01", status: "Active" },
      { name: "PALS", expiration: "2027-06-01", status: "Active" },
    ],
    deaExpiration: "2028-01-15",
    malpracticeExpiration: "2026-11-01",
    facilityStatus: { f1: "active", f2: "active", f3: "active", f4: "active", f5: "active", f6: "active" },
    tasks: [],
  },
  {
    id: "p6", firstName: "Rachel", lastName: "Kim", credentials: "CRNA, MSN",
    email: "rachel@example.com", phone: "614-555-0506", npi: "7890123456",
    primaryState: "OH", status: "inactive", profileComplete: 88,
    licenses: [
      { state: "OH", number: "RN-XXXX-3456", expiration: "2025-12-31", status: "Expired" },
    ],
    certifications: [
      { name: "NBCRNA", expiration: "2027-06-30", status: "Active" },
      { name: "BLS", expiration: "2025-11-01", status: "Expired" },
      { name: "ACLS", expiration: "2025-11-01", status: "Expired" },
    ],
    deaExpiration: "2025-09-30",
    malpracticeExpiration: "2025-12-01",
    facilityStatus: { f1: "expired", f2: "none", f3: "none", f4: "expired", f5: "none", f6: "none" },
    tasks: [
      { id: "t14", task: "Renew OH license (EXPIRED)", facility: "All", due: "2025-12-31", status: "overdue", assignee: "Provider" },
      { id: "t15", task: "Renew BLS (EXPIRED)", facility: "All", due: "2025-11-01", status: "overdue", assignee: "Provider" },
      { id: "t16", task: "Renew ACLS (EXPIRED)", facility: "All", due: "2025-11-01", status: "overdue", assignee: "Provider" },
      { id: "t17", task: "Renew DEA (EXPIRED)", facility: "All", due: "2025-09-30", status: "overdue", assignee: "Provider" },
    ],
  },
];

const today = new Date("2026-02-15");
const daysUntil = (dateStr) => {
  if (!dateStr) return Infinity;
  return Math.ceil((new Date(dateStr) - today) / 86400000);
};

const statusColor = (s) => ({ active: "#27ae60", pending: "#f39c12", expired: "#c0392b", none: "#bdc3c7", onboarding: "#3498db", inactive: "#95a5a6", blocked: "#8e44ad" }[s] || "#bdc3c7");
const taskStatusColor = (s) => ({ urgent: "#c0392b", overdue: "#c0392b", in_progress: "#f39c12", pending: "#3498db", blocked: "#8e44ad", complete: "#27ae60" }[s] || "#bdc3c7");
const taskStatusLabel = (s) => ({ urgent: "URGENT", overdue: "OVERDUE", in_progress: "In Progress", pending: "Pending", blocked: "Blocked", complete: "Complete" }[s] || s);

function getExpirations(provider) {
  const items = [];
  provider.licenses?.forEach(l => {
    if (l.expiration) items.push({ type: "License", detail: `${l.state} ${l.number}`, date: l.expiration, days: daysUntil(l.expiration) });
  });
  provider.certifications?.forEach(c => {
    items.push({ type: "Certification", detail: c.name, date: c.expiration, days: daysUntil(c.expiration) });
  });
  if (provider.deaExpiration) items.push({ type: "DEA", detail: "DEA Registration", date: provider.deaExpiration, days: daysUntil(provider.deaExpiration) });
  if (provider.malpracticeExpiration) items.push({ type: "Malpractice", detail: "Professional Liability", date: provider.malpracticeExpiration, days: daysUntil(provider.malpracticeExpiration) });
  return items.sort((a, b) => a.days - b.days);
}

function getProviderUrgency(p) {
  const exps = getExpirations(p);
  const soonest = exps[0]?.days ?? Infinity;
  if (soonest < 0) return "expired";
  if (soonest < 30) return "critical";
  if (soonest < 90) return "warning";
  return "good";
}

const urgencyBadge = (u) => {
  const m = { expired: { bg: "#c0392b", t: "EXPIRED" }, critical: { bg: "#e74c3c", t: "CRITICAL" }, warning: { bg: "#f39c12", t: "EXPIRING" }, good: { bg: "#27ae60", t: "CURRENT" } };
  const { bg, t } = m[u] || m.good;
  return <span style={{ background: bg, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, letterSpacing: 0.5 }}>{t}</span>;
};

// ── Styles ──
const font = "'DM Sans', system-ui, sans-serif";
const S = {
  app: { fontFamily: font, background: "#0f1419", color: "#e8ecf0", minHeight: "100vh", display: "flex" },
  sidebar: { width: 220, background: "#161b22", borderRight: "1px solid #21262d", padding: "20px 0", flexShrink: 0, display: "flex", flexDirection: "column" },
  logo: { padding: "0 20px 20px", borderBottom: "1px solid #21262d", marginBottom: 12 },
  logoText: { fontSize: 18, fontWeight: 700, color: "#58a6ff", letterSpacing: -0.5 },
  logoSub: { fontSize: 11, color: "#8b949e", marginTop: 2 },
  navItem: (active) => ({ padding: "8px 20px", fontSize: 13, color: active ? "#58a6ff" : "#8b949e", background: active ? "#1c2533" : "transparent", borderLeft: active ? "2px solid #58a6ff" : "2px solid transparent", cursor: "pointer", fontWeight: active ? 600 : 400, transition: "all 0.15s" }),
  main: { flex: 1, overflow: "auto", padding: 28 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#e8ecf0", marginBottom: 4, letterSpacing: -0.5 },
  pageSub: { fontSize: 13, color: "#8b949e", marginBottom: 24 },
  card: { background: "#161b22", border: "1px solid #21262d", borderRadius: 10, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#e8ecf0", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 12px", color: "#8b949e", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #21262d" },
  td: { padding: "10px 12px", borderBottom: "1px solid #21262d", color: "#c9d1d9" },
  stat: { textAlign: "center", flex: 1 },
  statNum: { fontSize: 28, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#8b949e", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  badge: (color) => ({ display: "inline-block", background: color + "20", color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }),
  clickRow: { cursor: "pointer", transition: "background 0.1s" },
  backBtn: { background: "none", border: "1px solid #30363d", color: "#8b949e", fontSize: 12, padding: "4px 12px", borderRadius: 6, cursor: "pointer", marginBottom: 16 },
  progressBar: (pct) => ({ width: "100%", height: 6, background: "#21262d", borderRadius: 3, overflow: "hidden", display: "inline-block" }),
  progressFill: (pct) => ({ width: `${pct}%`, height: "100%", background: pct === 100 ? "#27ae60" : pct > 75 ? "#58a6ff" : "#f39c12", borderRadius: 3, transition: "width 0.3s" }),
  matrixCell: (status) => ({ width: 32, height: 32, borderRadius: 6, background: statusColor(status) + "20", border: `1px solid ${statusColor(status)}40`, display: "flex", alignItems: "center", justifyContent: "center" }),
  matrixDot: (status) => ({ width: 10, height: 10, borderRadius: "50%", background: statusColor(status) }),
  tab: (active) => ({ padding: "6px 16px", fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#58a6ff" : "#8b949e", background: active ? "#1c2533" : "transparent", border: "1px solid " + (active ? "#30363d" : "transparent"), borderRadius: 6, cursor: "pointer" }),
  filterPill: (active) => ({ padding: "4px 12px", fontSize: 11, fontWeight: 500, color: active ? "#fff" : "#8b949e", background: active ? "#30363d" : "transparent", border: "1px solid #30363d", borderRadius: 20, cursor: "pointer" }),
};

// ── Views ──

function StatsBar() {
  const active = PROVIDERS.filter(p => p.status === "active").length;
  const onboarding = PROVIDERS.filter(p => p.status === "onboarding").length;
  const allTasks = PROVIDERS.flatMap(p => p.tasks);
  const urgentTasks = allTasks.filter(t => t.status === "urgent" || t.status === "overdue").length;
  const allExps = PROVIDERS.flatMap(p => getExpirations(p));
  const expiring90 = allExps.filter(e => e.days >= 0 && e.days <= 90).length;
  const expired = allExps.filter(e => e.days < 0).length;

  return (
    <div style={{ ...S.card, display: "flex", gap: 0 }}>
      <div style={S.stat}><div style={{ ...S.statNum, color: "#27ae60" }}>{active}</div><div style={S.statLabel}>Active Providers</div></div>
      <div style={S.stat}><div style={{ ...S.statNum, color: "#3498db" }}>{onboarding}</div><div style={S.statLabel}>Onboarding</div></div>
      <div style={S.stat}><div style={{ ...S.statNum, color: "#f39c12" }}>{expiring90}</div><div style={S.statLabel}>Expiring ≤90d</div></div>
      <div style={S.stat}><div style={{ ...S.statNum, color: "#c0392b" }}>{expired}</div><div style={S.statLabel}>Expired Items</div></div>
      <div style={S.stat}><div style={{ ...S.statNum, color: "#e74c3c" }}>{urgentTasks}</div><div style={S.statLabel}>Urgent Tasks</div></div>
    </div>
  );
}

function RosterView({ onSelectProvider }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = PROVIDERS.filter(p => {
    if (filter === "active" && p.status !== "active") return false;
    if (filter === "onboarding" && p.status !== "onboarding") return false;
    if (filter === "attention" && !["expired", "critical"].includes(getProviderUrgency(p))) return false;
    if (search && !(p.firstName + " " + p.lastName).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={S.pageTitle}>Provider Roster</div>
          <div style={S.pageSub}>{PROVIDERS.length} providers · {PROVIDERS.filter(p => p.status === "active").length} active</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search providers..." style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "8px 14px", color: "#c9d1d9", fontSize: 13, width: 220 }} />
      </div>
      <StatsBar />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all", "All"], ["active", "Active"], ["onboarding", "Onboarding"], ["attention", "Needs Attention"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={S.filterPill(filter === k)}>{l}</button>
        ))}
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Provider</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Profile</th>
              <th style={S.th}>Credential Status</th>
              <th style={S.th}>Next Expiration</th>
              <th style={S.th}>Open Tasks</th>
              <th style={S.th}>Facilities</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const urgency = getProviderUrgency(p);
              const exps = getExpirations(p);
              const soonest = exps[0];
              const activeFacilities = Object.values(p.facilityStatus).filter(s => s === "active").length;
              const pendingFacilities = Object.values(p.facilityStatus).filter(s => s === "pending").length;
              return (
                <tr key={p.id} style={S.clickRow} onClick={() => onSelectProvider(p.id)}
                  onMouseEnter={e => e.currentTarget.style.background = "#1c2533"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={S.td}>
                    <div style={{ fontWeight: 600, color: "#e8ecf0" }}>{p.firstName} {p.lastName}</div>
                    <div style={{ fontSize: 11, color: "#8b949e" }}>{p.credentials} · NPI: {p.npi}</div>
                  </td>
                  <td style={S.td}><span style={S.badge(statusColor(p.status))}>{p.status}</span></td>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={S.progressBar(p.profileComplete)}><div style={S.progressFill(p.profileComplete)} /></div>
                      <span style={{ fontSize: 11, color: "#8b949e", minWidth: 30 }}>{p.profileComplete}%</span>
                    </div>
                  </td>
                  <td style={S.td}>{urgencyBadge(urgency)}</td>
                  <td style={S.td}>
                    {soonest ? (
                      <div>
                        <div style={{ color: soonest.days < 0 ? "#c0392b" : soonest.days < 90 ? "#f39c12" : "#c9d1d9", fontWeight: 500 }}>
                          {soonest.days < 0 ? `${Math.abs(soonest.days)}d overdue` : `${soonest.days}d`}
                        </div>
                        <div style={{ fontSize: 11, color: "#8b949e" }}>{soonest.detail}</div>
                      </div>
                    ) : <span style={{ color: "#8b949e" }}>—</span>}
                  </td>
                  <td style={S.td}>
                    {p.tasks.length > 0 ? (
                      <span style={{ fontWeight: 600, color: p.tasks.some(t => t.status === "urgent" || t.status === "overdue") ? "#c0392b" : "#f39c12" }}>
                        {p.tasks.length}
                      </span>
                    ) : <span style={{ color: "#27ae60" }}>✓</span>}
                  </td>
                  <td style={S.td}>
                    <span style={{ color: "#c9d1d9" }}>{activeFacilities}</span>
                    {pendingFacilities > 0 && <span style={{ color: "#f39c12", marginLeft: 4 }}>+{pendingFacilities}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProviderDetail({ provider, onBack }) {
  const [tab, setTab] = useState("overview");
  const exps = getExpirations(provider);
  const urgency = getProviderUrgency(provider);

  return (
    <div>
      <button onClick={onBack} style={S.backBtn}>← Back to Roster</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={S.pageTitle}>{provider.firstName} {provider.lastName}</div>
            {urgencyBadge(urgency)}
            <span style={S.badge(statusColor(provider.status))}>{provider.status}</span>
          </div>
          <div style={S.pageSub}>{provider.credentials} · NPI: {provider.npi} · {provider.primaryState} · {provider.email}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "#238636", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>Edit Profile</button>
          <button style={{ background: "none", border: "1px solid #30363d", color: "#c9d1d9", fontSize: 12, padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>Send to Provider</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["overview", "Overview"], ["tasks", "Tasks"], ["expirations", "Expirations"], ["facilities", "Facilities"], ["documents", "Documents"], ["audit", "Audit Log"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={S.tab(tab === k)}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={S.card}>
            <div style={S.cardTitle}>Profile Completion</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ ...S.progressBar(provider.profileComplete), flex: 1, height: 10 }}><div style={{ ...S.progressFill(provider.profileComplete), height: 10 }} /></div>
              <span style={{ fontSize: 18, fontWeight: 700, color: provider.profileComplete === 100 ? "#27ae60" : "#f39c12" }}>{provider.profileComplete}%</span>
            </div>
            {provider.profileComplete < 100 && (
              <div style={{ fontSize: 12, color: "#f39c12", background: "#f39c1215", padding: "8px 12px", borderRadius: 6 }}>
                Missing sections need attention before facility submissions.
              </div>
            )}
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>Quick Stats</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><span style={{ fontSize: 11, color: "#8b949e" }}>Active Licenses</span><div style={{ fontWeight: 700 }}>{provider.licenses.filter(l => l.status === "Active").length}</div></div>
              <div><span style={{ fontSize: 11, color: "#8b949e" }}>Certifications</span><div style={{ fontWeight: 700 }}>{provider.certifications.length}</div></div>
              <div><span style={{ fontSize: 11, color: "#8b949e" }}>Active Facilities</span><div style={{ fontWeight: 700 }}>{Object.values(provider.facilityStatus).filter(s => s === "active").length}</div></div>
              <div><span style={{ fontSize: 11, color: "#8b949e" }}>Open Tasks</span><div style={{ fontWeight: 700, color: provider.tasks.length > 0 ? "#f39c12" : "#27ae60" }}>{provider.tasks.length}</div></div>
            </div>
          </div>
          <div style={{ ...S.card, gridColumn: "1 / -1" }}>
            <div style={S.cardTitle}>
              Upcoming Expirations
              <span style={{ fontSize: 11, color: "#8b949e", fontWeight: 400 }}>Next 180 days</span>
            </div>
            <table style={S.table}>
              <thead><tr><th style={S.th}>Type</th><th style={S.th}>Detail</th><th style={S.th}>Date</th><th style={S.th}>Days</th><th style={S.th}>Status</th></tr></thead>
              <tbody>
                {exps.filter(e => e.days < 180).map((e, i) => (
                  <tr key={i}>
                    <td style={S.td}>{e.type}</td>
                    <td style={{ ...S.td, fontWeight: 500 }}>{e.detail}</td>
                    <td style={S.td}>{e.date}</td>
                    <td style={{ ...S.td, fontWeight: 600, color: e.days < 0 ? "#c0392b" : e.days < 30 ? "#e74c3c" : e.days < 90 ? "#f39c12" : "#c9d1d9" }}>
                      {e.days < 0 ? `${Math.abs(e.days)}d overdue` : `${e.days}d`}
                    </td>
                    <td style={S.td}>
                      <span style={S.badge(e.days < 0 ? "#c0392b" : e.days < 30 ? "#e74c3c" : e.days < 90 ? "#f39c12" : "#27ae60")}>
                        {e.days < 0 ? "Expired" : e.days < 30 ? "Critical" : e.days < 90 ? "Expiring" : "OK"}
                      </span>
                    </td>
                  </tr>
                ))}
                {exps.filter(e => e.days < 180).length === 0 && (
                  <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#27ae60" }}>All credentials current for 180+ days</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {provider.tasks.length > 0 && (
            <div style={{ ...S.card, gridColumn: "1 / -1" }}>
              <div style={S.cardTitle}>Open Tasks</div>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Task</th><th style={S.th}>Facility</th><th style={S.th}>Due</th><th style={S.th}>Assignee</th><th style={S.th}>Status</th></tr></thead>
                <tbody>
                  {provider.tasks.map(t => (
                    <tr key={t.id}>
                      <td style={{ ...S.td, fontWeight: 500 }}>{t.task}</td>
                      <td style={S.td}>{t.facility}</td>
                      <td style={{ ...S.td, color: daysUntil(t.due) < 0 ? "#c0392b" : daysUntil(t.due) < 14 ? "#f39c12" : "#c9d1d9" }}>{t.due}</td>
                      <td style={S.td}>{t.assignee}</td>
                      <td style={S.td}><span style={S.badge(taskStatusColor(t.status))}>{taskStatusLabel(t.status)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "tasks" && (
        <div style={S.card}>
          <div style={S.cardTitle}>All Tasks<button style={{ background: "#238636", border: "none", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 6, cursor: "pointer" }}>+ Add Task</button></div>
          {provider.tasks.length === 0 ? (
            <div style={{ textAlign: "center", color: "#27ae60", padding: 40, fontSize: 14 }}>No open tasks — all clear.</div>
          ) : (
            <table style={S.table}>
              <thead><tr><th style={S.th}>Task</th><th style={S.th}>Facility</th><th style={S.th}>Due</th><th style={S.th}>Assignee</th><th style={S.th}>Status</th><th style={S.th}>Actions</th></tr></thead>
              <tbody>
                {provider.tasks.map(t => (
                  <tr key={t.id}>
                    <td style={{ ...S.td, fontWeight: 500 }}>{t.task}</td>
                    <td style={S.td}>{t.facility}</td>
                    <td style={S.td}>{t.due}</td>
                    <td style={S.td}>{t.assignee}</td>
                    <td style={S.td}><span style={S.badge(taskStatusColor(t.status))}>{taskStatusLabel(t.status)}</span></td>
                    <td style={S.td}><button style={{ background: "none", border: "1px solid #30363d", color: "#8b949e", fontSize: 11, padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}>Complete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "expirations" && (
        <div style={S.card}>
          <div style={S.cardTitle}>All Expirations</div>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Type</th><th style={S.th}>Detail</th><th style={S.th}>Expiration</th><th style={S.th}>Days</th><th style={S.th}>Status</th></tr></thead>
            <tbody>
              {exps.map((e, i) => (
                <tr key={i}>
                  <td style={S.td}>{e.type}</td>
                  <td style={{ ...S.td, fontWeight: 500 }}>{e.detail}</td>
                  <td style={S.td}>{e.date || "N/A"}</td>
                  <td style={{ ...S.td, fontWeight: 600, color: e.days < 0 ? "#c0392b" : e.days < 30 ? "#e74c3c" : e.days < 90 ? "#f39c12" : "#27ae60" }}>
                    {e.days === Infinity ? "—" : e.days < 0 ? `${Math.abs(e.days)}d overdue` : `${e.days}d`}
                  </td>
                  <td style={S.td}>
                    <span style={S.badge(e.days < 0 ? "#c0392b" : e.days < 30 ? "#e74c3c" : e.days < 90 ? "#f39c12" : "#27ae60")}>
                      {e.days < 0 ? "Expired" : e.days < 30 ? "Critical" : e.days < 90 ? "Expiring" : "Current"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "facilities" && (
        <div style={S.card}>
          <div style={S.cardTitle}>Facility Enrollment</div>
          <table style={S.table}>
            <thead><tr><th style={S.th}>Facility</th><th style={S.th}>Location</th><th style={S.th}>Status</th><th style={S.th}>Actions</th></tr></thead>
            <tbody>
              {FACILITIES.map(f => {
                const st = provider.facilityStatus[f.id] || "none";
                return (
                  <tr key={f.id}>
                    <td style={{ ...S.td, fontWeight: 500 }}>{f.name}</td>
                    <td style={S.td}>{f.city}, {f.state}</td>
                    <td style={S.td}><span style={S.badge(statusColor(st))}>{st}</span></td>
                    <td style={S.td}>
                      {st === "none" && <button style={{ background: "#238636", border: "none", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>Enroll</button>}
                      {st === "pending" && <button style={{ background: "none", border: "1px solid #f39c12", color: "#f39c12", fontSize: 11, padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>Track</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "documents" && (
        <div style={S.card}>
          <div style={S.cardTitle}>Document Vault<button style={{ background: "#238636", border: "none", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 6, cursor: "pointer" }}>+ Upload</button></div>
          <div style={{ textAlign: "center", color: "#8b949e", padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
            <div>Documents synced from provider's CredenSync profile</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>ACLS, BLS, PALS, Licenses, Immunizations, etc.</div>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div style={S.card}>
          <div style={S.cardTitle}>Audit Log</div>
          {[
            { date: "2026-02-14 3:45 PM", user: "Jody", action: "Submitted privileges application to Blanchard Valley Hospital" },
            { date: "2026-02-12 10:22 AM", user: "Adam Longberry", action: "Updated CAQH profile — Practice Locations section" },
            { date: "2026-02-10 2:15 PM", user: "Jody", action: "Uploaded updated malpractice insurance certificate" },
            { date: "2026-02-08 9:30 AM", user: "System", action: "Expiration alert: BLS expires in 59 days" },
            { date: "2026-01-28 11:00 AM", user: "Jody", action: "Initiated credentialing at Blanchard Valley Hospital" },
          ].map((log, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #21262d", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ fontSize: 11, color: "#8b949e", minWidth: 140, flexShrink: 0 }}>{log.date}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#58a6ff", minWidth: 100 }}>{log.user}</div>
              <div style={{ fontSize: 12, color: "#c9d1d9" }}>{log.action}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FacilityMatrix() {
  return (
    <div>
      <div style={S.pageTitle}>Facility Matrix</div>
      <div style={S.pageSub}>Provider enrollment status across all facilities</div>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, position: "sticky", left: 0, background: "#161b22", zIndex: 1 }}>Provider</th>
                {FACILITIES.map(f => (
                  <th key={f.id} style={{ ...S.th, textAlign: "center", minWidth: 90, fontSize: 10, lineHeight: 1.3 }}>
                    {f.name.replace("OhioHealth ", "").replace(" Hospital", "").replace(" Medical Center", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROVIDERS.map(p => (
                <tr key={p.id}>
                  <td style={{ ...S.td, position: "sticky", left: 0, background: "#161b22", zIndex: 1, fontWeight: 500 }}>
                    {p.lastName}, {p.firstName}
                  </td>
                  {FACILITIES.map(f => {
                    const st = p.facilityStatus[f.id] || "none";
                    return (
                      <td key={f.id} style={{ ...S.td, textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <div style={S.matrixCell(st)}><div style={S.matrixDot(st)} /></div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16, padding: "12px 0", borderTop: "1px solid #21262d" }}>
          {[["active", "Active"], ["pending", "Pending"], ["expired", "Expired"], ["none", "Not Enrolled"]].map(([k, l]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8b949e" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor(k) }} />{l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExpirationCalendar() {
  const allExps = PROVIDERS.flatMap(p => getExpirations(p).map(e => ({ ...e, provider: `${p.lastName}, ${p.firstName}` })));
  const sorted = allExps.filter(e => e.days < 180).sort((a, b) => a.days - b.days);

  const overdue = sorted.filter(e => e.days < 0);
  const critical = sorted.filter(e => e.days >= 0 && e.days < 30);
  const warning = sorted.filter(e => e.days >= 30 && e.days < 90);
  const upcoming = sorted.filter(e => e.days >= 90 && e.days < 180);

  const Section = ({ title, items, color }) => items.length > 0 ? (
    <div style={{ ...S.card, borderLeft: `3px solid ${color}` }}>
      <div style={{ ...S.cardTitle, color }}>{title} ({items.length})</div>
      <table style={S.table}>
        <thead><tr><th style={S.th}>Provider</th><th style={S.th}>Type</th><th style={S.th}>Detail</th><th style={S.th}>Date</th><th style={S.th}>Days</th></tr></thead>
        <tbody>
          {items.map((e, i) => (
            <tr key={i}>
              <td style={{ ...S.td, fontWeight: 500 }}>{e.provider}</td>
              <td style={S.td}>{e.type}</td>
              <td style={S.td}>{e.detail}</td>
              <td style={S.td}>{e.date}</td>
              <td style={{ ...S.td, fontWeight: 600, color }}>{e.days < 0 ? `${Math.abs(e.days)}d ago` : `${e.days}d`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;

  return (
    <div>
      <div style={S.pageTitle}>Expiration Calendar</div>
      <div style={S.pageSub}>All credential expirations across all providers — next 180 days</div>
      <Section title="OVERDUE" items={overdue} color="#c0392b" />
      <Section title="CRITICAL — Within 30 Days" items={critical} color="#e74c3c" />
      <Section title="EXPIRING — 30-90 Days" items={warning} color="#f39c12" />
      <Section title="UPCOMING — 90-180 Days" items={upcoming} color="#3498db" />
      {sorted.length === 0 && <div style={{ ...S.card, textAlign: "center", color: "#27ae60", padding: 40 }}>All credentials current for 180+ days.</div>}
    </div>
  );
}

function TaskBoard() {
  const allTasks = PROVIDERS.flatMap(p => p.tasks.map(t => ({ ...t, provider: `${p.firstName} ${p.lastName}` })));
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? allTasks :
    filter === "mine" ? allTasks.filter(t => t.assignee === "Jody") :
    filter === "provider" ? allTasks.filter(t => t.assignee === "Provider") :
    allTasks.filter(t => t.status === filter);

  return (
    <div>
      <div style={S.pageTitle}>Task Board</div>
      <div style={S.pageSub}>{allTasks.length} total tasks across all providers</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all", "All"], ["mine", "My Tasks"], ["provider", "Provider Tasks"], ["urgent", "Urgent"], ["overdue", "Overdue"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={S.filterPill(filter === k)}>{l}</button>
        ))}
      </div>
      <div style={S.card}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#27ae60", padding: 40 }}>No tasks match this filter.</div>
        ) : (
          <table style={S.table}>
            <thead><tr><th style={S.th}>Provider</th><th style={S.th}>Task</th><th style={S.th}>Facility</th><th style={S.th}>Due</th><th style={S.th}>Assignee</th><th style={S.th}>Status</th></tr></thead>
            <tbody>
              {filtered.sort((a, b) => {
                const priority = { overdue: 0, urgent: 1, blocked: 2, in_progress: 3, pending: 4, complete: 5 };
                return (priority[a.status] || 9) - (priority[b.status] || 9);
              }).map(t => (
                <tr key={t.id}>
                  <td style={{ ...S.td, fontWeight: 500 }}>{t.provider}</td>
                  <td style={S.td}>{t.task}</td>
                  <td style={S.td}>{t.facility}</td>
                  <td style={{ ...S.td, color: daysUntil(t.due) < 0 ? "#c0392b" : daysUntil(t.due) < 14 ? "#f39c12" : "#c9d1d9" }}>{t.due}</td>
                  <td style={S.td}><span style={S.badge(t.assignee === "Jody" ? "#58a6ff" : "#8b949e")}>{t.assignee}</span></td>
                  <td style={S.td}><span style={S.badge(taskStatusColor(t.status))}>{taskStatusLabel(t.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Main App ──
export default function CredenSyncAdmin() {
  const [view, setView] = useState("roster");
  const [selectedProvider, setSelectedProvider] = useState(null);

  const navItems = [
    { id: "roster", label: "Provider Roster", icon: "👥" },
    { id: "tasks", label: "Task Board", icon: "📋" },
    { id: "expirations", label: "Expiration Calendar", icon: "⏰" },
    { id: "matrix", label: "Facility Matrix", icon: "🔲" },
  ];

  const handleSelectProvider = useCallback((id) => {
    setSelectedProvider(id);
    setView("detail");
  }, []);

  const provider = PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoText}>CredenSync</div>
          <div style={S.logoSub}>Specialist Portal</div>
        </div>
        {navItems.map(n => (
          <div key={n.id} style={S.navItem(view === n.id)} onClick={() => { setView(n.id); setSelectedProvider(null); }}>
            <span style={{ marginRight: 8 }}>{n.icon}</span>{n.label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "12px 20px", borderTop: "1px solid #21262d" }}>
          <div style={{ fontSize: 12, color: "#c9d1d9", fontWeight: 500 }}>Jody Porter</div>
          <div style={{ fontSize: 11, color: "#8b949e" }}>Credentialing Specialist</div>
        </div>
      </div>
      <div style={S.main}>
        {view === "roster" && <RosterView onSelectProvider={handleSelectProvider} />}
        {view === "detail" && provider && <ProviderDetail provider={provider} onBack={() => setView("roster")} />}
        {view === "tasks" && <TaskBoard />}
        {view === "expirations" && <ExpirationCalendar />}
        {view === "matrix" && <FacilityMatrix />}
      </div>
    </div>
  );
}
