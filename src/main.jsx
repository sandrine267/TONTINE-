import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Banknote,
  BarChart3,
  Bell,
  ClipboardCheck,
  CreditCard,
  Download,
  Fingerprint,
  FileText,
  GraduationCap,
  Languages,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  ShieldCheck,
  Shuffle,
  Smartphone,
  Users,
  Vote
} from "lucide-react";
import "./styles.css";

const API = (() => {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) {
    const normalized = configured.replace(/\/$/, "");
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
  }

  const host = window.location.hostname;
  if (import.meta.env.PROD) {
    if (host.endsWith(".loca.lt")) return "https://itchy-flies-move.loca.lt/api";
    return "/api";
  }

  return `http://${host}:4000/api`;
})();

const copy = {
  en: {
    app: "Tontine Savings and Loan Management",
    choose: "Choose your tontine",
    chooseHint: "Each tontine is private. Enter the member PIN to open only that group's data.",
    pin: "PIN",
    memberPin: "Member PIN",
    adminPin: "Admin PIN",
    enter: "Enter",
    admin: "Admin",
    treasurer: "Treasurer",
    secretary: "Secretary",
    member: "Member",
    dashboard: "Dashboard",
    members: "Members",
    payments: "Payments",
    loans: "Loans",
    receipts: "Receipts",
    reminders: "Reminders",
    reports: "Reports",
    rotation: "Rotation",
    community: "Community",
    education: "Education",
    rules: "Rules engine",
    gateway: "Payment gateway",
    directPayment: "Direct payment",
    createPaymentIntent: "Start gateway payment",
    checkout: "Checkout",
    kyc: "KYC",
    verified: "Verified",
    pending: "Pending",
    creditScore: "Credit score",
    generateRotation: "Generate rotation",
    applyLoan: "Apply for loan",
    purpose: "Purpose",
    approve: "Approve",
    reject: "Reject",
    repayment: "Repayment",
    vote: "Vote",
    createVote: "Create vote",
    yes: "Yes",
    no: "No",
    message: "Message",
    minutes: "Meeting minutes",
    post: "Post",
    biometric: "Biometric check",
    audit: "Audit log",
    projections: "Savings projections",
    payoutProjection: "Projected payout",
    capitalGrowth: "Capital growth",
    health: "Health",
    healthy: "Healthy",
    warning: "Warning",
    late: "Late",
    watch: "Watch",
    lateFees: "Late fees",
    notifications: "Notifications",
    reconcile: "Run reconciliation",
    downloadReport: "Download monthly report",
    backup: "Download backup",
    activity: "Recent activity",
    whatsapp: "WhatsApp",
    balance: "Balance",
    contribution: "Contribution",
    nextDue: "Next due",
    totalSaved: "Total saved",
    activeLoans: "Active loans",
    pay: "Record payment",
    momo: "MTN MoMo",
    om: "Orange Money",
    cash: "Cash",
    amount: "Amount",
    phone: "Phone",
    createReceipt: "Create receipt",
    proof: "Proof code",
    queueSms: "Queue SMS reminders",
    addMember: "Add member",
    identity: "Identity",
    role: "Role",
    save: "Save",
    name: "Name",
    secureAdmin: "Secure admin side",
    settings: "Settings",
    loanMember: "Create loan",
    dueDate: "Due date",
    interest: "Interest %",
    logout: "Logout",
    install: "Install app",
    noItems: "No records yet.",
    error: "Something went wrong. Please check the details."
  },
  fr: {
    app: "Gestion des tontines, epargne et prets",
    choose: "Choisissez votre tontine",
    chooseHint: "Chaque tontine est privee. Entrez le PIN membre pour voir seulement ce groupe.",
    pin: "PIN",
    memberPin: "PIN membre",
    adminPin: "PIN admin",
    enter: "Entrer",
    admin: "Admin",
    treasurer: "Tresorier",
    secretary: "Secretaire",
    member: "Membre",
    dashboard: "Tableau",
    members: "Membres",
    payments: "Paiements",
    loans: "Prets",
    receipts: "Recus",
    reminders: "Rappels",
    reports: "Rapports",
    rotation: "Rotation",
    community: "Communaute",
    education: "Education",
    rules: "Moteur de regles",
    gateway: "Passerelle paiement",
    directPayment: "Paiement direct",
    createPaymentIntent: "Demarrer paiement",
    checkout: "Paiement",
    kyc: "KYC",
    verified: "Verifie",
    pending: "En attente",
    creditScore: "Score credit",
    generateRotation: "Generer rotation",
    applyLoan: "Demander pret",
    purpose: "Objet",
    approve: "Approuver",
    reject: "Rejeter",
    repayment: "Remboursement",
    vote: "Vote",
    createVote: "Creer vote",
    yes: "Oui",
    no: "Non",
    message: "Message",
    minutes: "Compte rendu",
    post: "Publier",
    biometric: "Controle biometrique",
    audit: "Journal audit",
    projections: "Projections d'epargne",
    payoutProjection: "Paiement projete",
    capitalGrowth: "Croissance capital",
    health: "Sante",
    healthy: "Bon",
    warning: "Attention",
    late: "En retard",
    watch: "A suivre",
    lateFees: "Penalites",
    notifications: "Notifications",
    reconcile: "Lancer rapprochement",
    downloadReport: "Telecharger rapport mensuel",
    backup: "Telecharger sauvegarde",
    activity: "Activite recente",
    whatsapp: "WhatsApp",
    balance: "Solde",
    contribution: "Cotisation",
    nextDue: "Prochaine date",
    totalSaved: "Total epargne",
    activeLoans: "Prets actifs",
    pay: "Enregistrer paiement",
    momo: "MTN MoMo",
    om: "Orange Money",
    cash: "Especes",
    amount: "Montant",
    phone: "Telephone",
    createReceipt: "Creer recu",
    proof: "Code preuve",
    queueSms: "Preparer SMS",
    addMember: "Ajouter membre",
    identity: "Identite",
    role: "Role",
    save: "Enregistrer",
    name: "Nom",
    secureAdmin: "Espace admin securise",
    settings: "Parametres",
    loanMember: "Creer pret",
    dueDate: "Date limite",
    interest: "Interet %",
    logout: "Sortir",
    install: "Installer",
    noItems: "Aucun element.",
    error: "Une erreur est arrivee. Verifiez les donnees."
  }
};

function money(value, currency) {
  return new Intl.NumberFormat("fr-CM", { style: "currency", currency }).format(value || 0);
}

function can(group, permission) {
  return group.capabilities?.includes("*") || group.capabilities?.includes(permission);
}

function saveGroupLocally(group) {
  if (!group?.id) return;
  localStorage.setItem(`group-${group.id}`, JSON.stringify(normalizeGroup(group)));
}

function saveCurrentGroup(group) {
  if (!group?.id) return;
  localStorage.setItem("current-group", JSON.stringify(normalizeGroup(group)));
}

function loadLocalGroups() {
  const saved = localStorage.getItem("demo-tontines");
  if (!saved) return [];
  try {
    const groups = JSON.parse(saved);
    return Array.isArray(groups) ? groups.map(normalizeGroup) : [];
  } catch {
    localStorage.removeItem("demo-tontines");
    return [];
  }
}

function readSavedGroup() {
  const saved = localStorage.getItem("current-group");
  if (!saved) return null;
  try {
    return normalizeGroup(JSON.parse(saved));
  } catch {
    localStorage.removeItem("current-group");
    return null;
  }
}

// The app can be opened without the API (for example, from a phone's installed
// PWA or a static host). Keep locally saved and demo groups safe to render.
function normalizeGroup(group = {}) {
  return {
    ...group,
    name: group.name || "My Tontine",
    role: group.role || "member",
    currency: group.currency || "XAF",
    contributionAmount: Number(group.contributionAmount || 0),
    members: Array.isArray(group.members) ? group.members : [],
    transactions: Array.isArray(group.transactions) ? group.transactions : [],
    loans: Array.isArray(group.loans) ? group.loans : [],
    loanApplications: Array.isArray(group.loanApplications) ? group.loanApplications : [],
    receipts: Array.isArray(group.receipts) ? group.receipts : [],
    reminders: Array.isArray(group.reminders) ? group.reminders : [],
    notifications: Array.isArray(group.notifications) ? group.notifications : [],
    messages: Array.isArray(group.messages) ? group.messages : [],
    minutes: Array.isArray(group.minutes) ? group.minutes : [],
    education: Array.isArray(group.education) ? group.education : [],
    rotations: Array.isArray(group.rotations) ? group.rotations : [],
    votes: Array.isArray(group.votes) ? group.votes : [],
    lateFees: Array.isArray(group.lateFees) ? group.lateFees : [],
    audit: Array.isArray(group.audit) ? group.audit : [],
    projections: Array.isArray(group.projections) ? group.projections : [],
    capabilities: Array.isArray(group.capabilities) ? group.capabilities : [],
    rules: group.rules || {},
    analytics: group.analytics || {},
    memberCount: group.memberCount || (Array.isArray(group.members) ? group.members.length : 0)
  };
}

function saveLocalGroups(groups) {
  const normalized = Array.isArray(groups) ? groups.map(normalizeGroup) : [];
  localStorage.setItem("demo-tontines", JSON.stringify(normalized));
  return normalized;
}

function upsertGroupInCollection(group, groupsList = loadLocalGroups()) {
  const normalizedGroup = normalizeGroup(group);
  const existing = groupsList.find((item) => item.id === normalizedGroup.id);
  const nextGroups = existing
    ? groupsList.map((item) => (item.id === normalizedGroup.id ? normalizedGroup : item))
    : [...groupsList, normalizedGroup];
  saveLocalGroups(nextGroups);
  saveGroupLocally(normalizedGroup);
  saveCurrentGroup(normalizedGroup);
  return nextGroups;
}

function checkPin(group, pin, role) {
  if (!group) return false;
  if (role === "admin") return pin === group.adminPin;
  if (role === "treasurer") return pin === group.rolePins?.treasurer;
  if (role === "secretary") return pin === group.rolePins?.secretary;
  return pin === group.pin;
}

async function api(path, options = {}) {
  const token = localStorage.getItem("tontine-token");
  const timeout = options.timeout ?? 10000;
  const retries = options.retries ?? 2;
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(`${API}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers
        }
      });
      clearTimeout(id);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
      if (data === null || typeof data !== "object") throw new Error("Invalid response from server");
      return data;
    } catch (err) {
      clearTimeout(id);
      lastErr = err.name === "AbortError" ? new Error("Request timed out") : err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      else throw lastErr;
    }
  }
}

function App() {
  const [lang, setLang] = useState(localStorage.getItem("tontine-lang") || "en");
  const [groups, setGroups] = useState(() => loadLocalGroups());
  const [group, setGroup] = useState(readSavedGroup);
  const [screen, setScreen] = useState("dashboard");
  const [error, setError] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showCreateTontine, setShowCreateTontine] = useState(false);
  const t = copy[lang];

  // Load demo data on first load
  useEffect(() => {
    const saved = localStorage.getItem("demo-tontines");
    if (!saved) {
      const demoTontines = [
        {
          id: "solidarity-women",
          name: "Solidarity Women Group",
          memberCount: 3,
          pin: "1234",
          adminPin: "9999",
          rolePins: { treasurer: "5555", secretary: "7777" },
          currency: "XAF",
          contributionAmount: 10000,
          members: [
            { id: "m1", name: "Amina N.", role: "treasurer", phone: "+237670000001", identityId: "CNI-001-2026", kycStatus: "verified", creditScore: 750, health: { balance: 5000, status: "healthy", color: "green" } },
            { id: "m2", name: "Brenda F.", role: "member", phone: "+237670000002", identityId: "CNI-002-2026", kycStatus: "verified", creditScore: 680, health: { balance: 0, status: "healthy", color: "green" } },
            { id: "m3", name: "Grace M.", role: "member", phone: "+237670000003", identityId: "CNI-003-2026", kycStatus: "pending", creditScore: 640, health: { balance: 0, status: "warning", color: "yellow" } }
          ],
          transactions: [],
          receipts: [],
          reminders: [],
          notifications: [],
          messages: [],
          minutes: [],
          education: [],
          capabilities: ["*"],
          role: "admin"
        },
        {
          id: "youth-savings",
          name: "Youth Savings Club",
          memberCount: 3,
          pin: "2468",
          adminPin: "8642",
          rolePins: { treasurer: "5555", secretary: "7777" },
          currency: "XAF",
          contributionAmount: 25000,
          members: [
            { id: "m4", name: "Jean T.", role: "admin", phone: "+237690000001", identityId: "CNI-004-2026", kycStatus: "verified", creditScore: 720, health: { balance: 2500, status: "healthy", color: "green" } },
            { id: "m5", name: "Mireille K.", role: "member", phone: "+237690000002", identityId: "CNI-005-2026", kycStatus: "verified", creditScore: 650, health: { balance: 0, status: "healthy", color: "green" } },
            { id: "m6", name: "FOTSO", role: "member", phone: "657276085", identityId: "CNI-006-2026", kycStatus: "verified", creditScore: 630, health: { balance: 0, status: "healthy", color: "green" } }
          ],
          transactions: [],
          receipts: [],
          reminders: [],
          notifications: [],
          messages: [],
          minutes: [],
          education: [],
          capabilities: ["payments.write", "reports.read", "votes.cast", "loans.apply"],
          role: "member"
        }
      ];
      setGroups(saveLocalGroups(demoTontines));
    } else {
      // Upgrade the first offline demo that was released with only one member.
      const existingGroups = loadLocalGroups();
      const migratedGroups = existingGroups.map((savedGroup) => {
        const demoGroup = demoTontines.find((item) => item.id === savedGroup.id);
        if (!demoGroup) return savedGroup;
        const members = (savedGroup.members || []).length > 1 ? savedGroup.members : demoGroup.members;
        return normalizeGroup({
          ...demoGroup,
          ...savedGroup,
          members,
          memberCount: members.length,
          capabilities: [...new Set([...(demoGroup.capabilities || []), ...(savedGroup.capabilities || [])])]
        });
      });
      setGroups(saveLocalGroups(migratedGroups));
      const current = readSavedGroup();
      const migratedCurrent = migratedGroups.find((item) => item.id === current?.id);
      if (migratedCurrent && (current.members || []).length <= 1) {
        setGroup(migratedCurrent);
        saveCurrentGroup(migratedCurrent);
      }
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    localStorage.setItem("tontine-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    api("/groups")
      .then((serverGroups) => {
        if (!Array.isArray(serverGroups)) throw new Error("Invalid group list from server");
        setGroups(saveLocalGroups(serverGroups));
      })
      .catch(() => {
        const demo = loadLocalGroups();
        if (demo.length) setGroups(demo);
      });
    const token = localStorage.getItem("tontine-token");
    if (token) {
      api("/me")
        .then((data) => {
          const nextGroup = normalizeGroup(data.group);
          setGroup(nextGroup);
          saveGroupLocally(nextGroup);
          saveCurrentGroup(nextGroup);
        })
        .catch(() => {
          const saved = localStorage.getItem("current-group");
          if (saved) {
            const nextGroup = normalizeGroup(JSON.parse(saved));
            setGroup(nextGroup);
          }
          localStorage.removeItem("tontine-token");
        });
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {});
  }, []);

  async function refresh() {
    try {
      const data = await api("/me");
      const nextGroup = normalizeGroup(data.group);
      saveGroupLocally(nextGroup);
      saveCurrentGroup(nextGroup);
      setGroup(nextGroup);
      setGroups((current) => upsertGroupInCollection(nextGroup, current));
    } catch (err) {
      const saved = localStorage.getItem(`group-${group?.id || ""}`);
      if (saved) {
        const nextGroup = normalizeGroup(JSON.parse(saved));
        setGroup(nextGroup);
        setError("Working offline with saved data.");
      } else {
        setError("Unable to refresh. Working offline.");
      }
    }
  }

  function logout() {
    localStorage.removeItem("tontine-token");
    localStorage.removeItem("current-group");
    setGroup(null);
    setScreen("dashboard");
  }

  async function handleInstall() {
    if (!window.confirm("Do you want to install Tontine on this phone?")) return;
    if (!installPrompt) {
      alert("To install: on Android, open the browser menu (⋮) and choose Install app or Add to Home screen. On iPhone, tap Share then Add to Home Screen.");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  }

  function createTontine(name) {
    const newTontine = {
      id: `tontine-${Date.now()}`,
      name,
      memberCount: 1,
      pin: "1234",
      adminPin: "9999",
      rolePins: { treasurer: "5555", secretary: "7777" },
      currency: "XAF",
      contributionAmount: 10000,
      members: [],
      transactions: [],
      receipts: [],
      reminders: [],
      notifications: [],
      messages: [],
      minutes: [],
      education: [],
      capabilities: ["*"],
      role: "admin"
    };
    const updated = upsertGroupInCollection(newTontine, groups);
    setGroups(updated);
    setGroup(newTontine);
    saveCurrentGroup(newTontine);
    setShowCreateTontine(false);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">T</span>
          <span>{t.app}</span>
        </div>
        <div className="actions">
          <button className="icon-button" onClick={handleInstall} title={t.install} aria-label="Install app">
            <Download size={18} />
            {t.install}
          </button>
          <button
            className="icon-button"
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            title="Language"
            aria-label="Toggle language"
            aria-pressed={lang === "fr"}
          >
            <Languages size={18} />
            {lang.toUpperCase()}
          </button>
          {group && (
            <button className="icon-button" onClick={logout} title={t.logout} aria-label="Logout">
              <LogOut size={18} />
              {t.logout}
            </button>
          )}
        </div>
      </header>

      {error && <div className="toast">{error}</div>}

      {!group ? (
        <>
          {showCreateTontine ? (
            <CreateTontineForm onSubmit={createTontine} onCancel={() => setShowCreateTontine(false)} t={t} />
          ) : (
            <>
              <Login groups={groups} setGroup={setGroup} setError={setError} t={t} />
              <button
                onClick={() => setShowCreateTontine(true)}
                style={{
                  position: "fixed",
                  bottom: "20px",
                  right: "20px",
                  padding: "12px 18px",
                  background: "#126b68",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                + {t.choose}
              </button>
            </>
          )}
        </>
      ) : (
        <Shell
          group={group}
          setGroup={setGroup}
          setGroups={setGroups}
          screen={screen}
          setScreen={setScreen}
          refresh={refresh}
          t={t}
        />
      )}
    </div>
  );
}

function Login({ groups, setGroup, setError, t }) {
  const [selected, setSelected] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("member");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    // client-side validation
    if (!selected) {
      setError(t.choose || "Please select a group");
      return;
    }
    if (!pin || pin.length < 4) {
      setError(t.pin + " must be at least 4 digits");
      return;
    }
    setBusy(true);
    try {
      const data = await api(`/groups/${selected}/login`, {
        method: "POST",
        body: JSON.stringify({ pin, role }),
        timeout: 10000,
        retries: 2
      });
      localStorage.setItem("tontine-token", data.token);
      const nextGroup = normalizeGroup(data.group);
      saveGroupLocally(nextGroup);
      saveCurrentGroup(nextGroup);
      setGroup(nextGroup);
      setError("");
    } catch (err) {
      const local = loadLocalGroups().find((item) => item.id === selected);
      if (local && checkPin(local, pin, role)) {
        localStorage.setItem("tontine-token", `offline-${selected}`);
        saveGroupLocally(local);
        saveCurrentGroup(local);
        setGroup(local);
        setError("");
      } else {
        setError(err.message || t.error);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="welcome">
        <p className="eyebrow"><ShieldCheck size={16} /> {t.secureAdmin}</p>
        <h1>{t.choose}</h1>
        <p>{t.chooseHint}</p>
        <div className="trust-row">
          <span><LockKeyhole size={18} /> PIN isolation</span>
          <span><FileText size={18} /> Receipts</span>
          <span><Smartphone size={18} /> WhatsApp/SMS</span>
        </div>
      </section>

      <form className="login-panel" onSubmit={submit}>
        <label>{t.choose}</label>
        <div className="group-grid">
          {groups.map((item) => (
            <button
              type="button"
              key={item.id}
              className={selected === item.id ? "group-choice active" : "group-choice"}
              onClick={() => setSelected(item.id)}
            >
              <strong>{item.name}</strong>
              <span>{item.memberCount} {t.members.toLowerCase()}</span>
            </button>
          ))}
        </div>
        <div className="segmented">
          <button type="button" className={role === "member" ? "active" : ""} onClick={() => setRole("member")}>{t.member}</button>
          <button type="button" className={role === "treasurer" ? "active" : ""} onClick={() => setRole("treasurer")}>{t.treasurer}</button>
          <button type="button" className={role === "secretary" ? "active" : ""} onClick={() => setRole("secretary")}>{t.secretary}</button>
          <button type="button" className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")}>{t.admin}</button>
        </div>
        <label htmlFor="pin">{role === "admin" ? t.adminPin : t.memberPin}</label>
        <input id="pin" value={pin} onChange={(event) => setPin(event.target.value)} inputMode="numeric" minLength="4" required />
        <button className="primary" disabled={!selected || busy}>
          <LockKeyhole size={18} /> {t.enter}
        </button>
      </form>
    </main>
  );
}

function Shell({ group, setGroup, setGroups, screen, setScreen, refresh, t }) {
  const tabs = [
    ["dashboard", t.dashboard, Banknote],
    ["members", t.members, Users],
    ["payments", t.payments, CreditCard],
    ["loans", t.loans, Banknote],
    ["rotation", t.rotation, Shuffle],
    ["votes", t.vote, Vote],
    ["community", t.community, MessageSquare],
    ["education", t.education, GraduationCap],
    ["receipts", t.receipts, FileText],
    ["reminders", t.reminders, Bell],
    ["reports", t.reports, BarChart3]
  ];

  return (
    <main className="workspace">
      <aside className="sidebar">
        <div className="group-title">
          <span>{group.name}</span>
          <small>{t[group.role] || group.role}</small>
        </div>
        <nav role="navigation" aria-label="Main navigation">
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              className={screen === key ? "active" : ""}
              onClick={() => setScreen(key)}
              aria-current={screen === key ? "page" : undefined}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="content">
        {screen === "dashboard" && <Dashboard group={group} t={t} />}
        {screen === "members" && <Members group={group} setGroup={setGroup} setGroups={setGroups} refresh={refresh} t={t} />}
        {screen === "payments" && <Payments group={group} refresh={refresh} t={t} />}
        {screen === "loans" && <Loans group={group} setGroup={setGroup} setGroups={setGroups} refresh={refresh} t={t} />}
        {screen === "rotation" && <Rotation group={group} refresh={refresh} t={t} />}
        {screen === "votes" && <Votes group={group} refresh={refresh} t={t} />}
        {screen === "community" && <Community group={group} refresh={refresh} t={t} />}
        {screen === "education" && <Education group={group} t={t} />}
        {screen === "receipts" && <Receipts group={group} t={t} />}
        {screen === "reminders" && <Reminders group={group} refresh={refresh} t={t} />}
        {screen === "reports" && <Reports group={group} refresh={refresh} t={t} />}
      </section>
    </main>
  );
}

function Dashboard({ group, t }) {
  const total = useMemo(() => group.transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0), [group.transactions]);
  const activeLoans = group.loans.filter((loan) => loan.status === "active").length;
  const activity = loadLocalActivity(group.id);
  return (
    <>
      <h2>{t.dashboard}</h2>
      <div className="stats">
        <Stat label={t.contribution} value={money(group.contributionAmount, group.currency)} />
        <Stat label={t.nextDue} value={group.nextPaymentDue} />
        <Stat label={t.totalSaved} value={money(total, group.currency)} />
        <Stat label={t.activeLoans} value={activeLoans} />
        <Stat label="Contribution rate" value={`${group.analytics?.contributionRate || 0}%`} />
        <Stat label="Loan pool" value={money(group.analytics?.loanPool || 0, group.currency)} />
        <Stat label="Pending" value={group.analytics?.pendingPayments || 0} />
        <Stat label={t.lateFees} value={group.analytics?.latePaymentTrend || 0} />
      </div>
      <div className="chart-grid">
        <ProjectionChart title={t.projections} data={group.projections} valueKey="savings" currency={group.currency} />
        <ProjectionChart title={t.capitalGrowth} data={group.projections} valueKey="capital" currency={group.currency} />
        <ProjectionChart title={t.payoutProjection} data={group.projections} valueKey="projectedPayout" currency={group.currency} />
      </div>
      <section className="table-card">
        <h3>{t.payments}</h3>
        <RecordList items={group.transactions.slice(0, 5)} empty={t.noItems} render={(item) => (
          <span>{item.memberName} - {money(item.amount, group.currency)} - {item.provider}</span>
        )} />
      </section>
      <section className="table-card stack-gap">
        <h3>{t.activity}</h3>
        <RecordList items={activity} empty={t.noItems} render={(item) => <span>{item.createdAt} - {item.action}</span>} />
      </section>
    </>
  );
}

function Stat({ label, value }) {
  return <article className="stat"><span>{label}</span><strong>{value}</strong></article>;
}

function Members({ group, setGroup, setGroups, refresh, t }) {
  return (
    <>
      <h2>{t.members}</h2>
      {can(group, "members.write") && <MemberForm group={group} setGroup={setGroup} setGroups={setGroups} refresh={refresh} t={t} />}
      <div className="members-grid">
        {group.members.map((member) => (
          <article className="member-card" key={member.id}>
            <div className="member-heading">
              <strong>{member.name}</strong>
              <HealthBadge health={member.health} t={t} />
            </div>
            <span>{t[member.role] || member.role}</span>
            <span>{member.phone}</span>
            <small>{t.identity}: {member.identityId}</small>
            <small>{t.kyc}: {t[member.kycStatus] || member.kycStatus}</small>
            <small>{t.creditScore}: {member.creditScore}</small>
            <small>{t.balance}: {money(member.health?.balance, group.currency)}</small>
            {can(group, "kyc.verify") && member.kycStatus !== "verified" && (
              <button className="secondary mini" onClick={async () => {
                await api(`/kyc/${member.id}/verify`, { method: "POST", body: JSON.stringify({}) });
                refresh();
              }}><ShieldCheck size={15} /> {t.verified}</button>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function MemberForm({ group, setGroup, setGroups, refresh, t }) {
  const [form, setForm] = useState({ name: "", phone: "", identityId: "", role: "member" });
  return <InlineForm title={t.addMember} onSubmit={async () => {
    const newMember = {
      id: `member-${Date.now()}`,
      name: form.name,
      phone: form.phone,
      identityId: form.identityId,
      role: form.role,
      kycStatus: "pending",
      verifiedAt: null
    };
    const updatedGroup = {
      ...group,
      members: [...(group.members || []), newMember],
      memberCount: (group.memberCount || (group.members || []).length) + 1
    };
    setGroup(updatedGroup);
    saveCurrentGroup(updatedGroup);
    saveGroupLocally(updatedGroup);
    setGroups((currentGroups) => upsertGroupInCollection(updatedGroup, currentGroups));
    addLocalActivity(group, `Member added: ${newMember.name}`);
    setForm({ name: "", phone: "", identityId: "", role: "member" });
    try {
      await api("/admin/members", { method: "POST", body: JSON.stringify(form) });
    } catch {
      // Keep the local update so the member is visible even when the server is unavailable.
    }
    refresh();
  }}>
    <Input label={t.name} value={form.name} onChange={(name) => setForm({ ...form, name })} />
    <Input label={t.phone} value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
    <Input label={t.identity} value={form.identityId} onChange={(identityId) => setForm({ ...form, identityId })} />
    <Select label={t.role} value={form.role} onChange={(role) => setForm({ ...form, role })} options={[["member", t.member], ["treasurer", t.treasurer], ["secretary", t.secretary], ["admin", t.admin]]} />
  </InlineForm>;
}

function Payments({ group, refresh, t }) {
  const [form, setForm] = useState({ memberId: group.members[0]?.id || "", amount: group.contributionAmount, provider: "mtn-momo", phone: "" });
  const [receipt, setReceipt] = useState(null);
  
  async function handlePayment() {
    if (!form.memberId || !form.amount) {
      alert("Please select member and amount");
      return;
    }
    
    // Save payment locally
    const payments = JSON.parse(localStorage.getItem(`payments-${group.id}`) || "[]");
    const newPayment = {
      id: Date.now(),
      ...form,
      status: "completed",
      memberName: group.members.find((m) => m.id === form.memberId)?.name || "Unknown",
      createdAt: new Date().toLocaleString()
    };
    payments.push(newPayment);
    localStorage.setItem(`payments-${group.id}`, JSON.stringify(payments));
    addLocalActivity(group, `Payment recorded for ${newPayment.memberName}: ${newPayment.amount} ${group.currency}`);

    const receipt = {
      id: `R-${Date.now()}`,
      memberName: newPayment.memberName,
      amount: newPayment.amount,
      provider: newPayment.provider,
      proofCode: `RCT${Date.now()}`,
      createdAt: new Date().toLocaleString()
    };
    const receipts = JSON.parse(localStorage.getItem(`receipts-${group.id}`) || "[]");
    receipts.push(receipt);
    localStorage.setItem(`receipts-${group.id}`, JSON.stringify(receipts));

    setReceipt(receipt);

    const member = group.members.find((m) => m.id === form.memberId);
    if (member?.phone) {
      const text = encodeURIComponent(`Payment of ${newPayment.amount} ${group.currency} received for ${newPayment.memberName}.`);
      window.open(`https://wa.me/${member.phone}?text=${text}`, "_blank");
      if (/^\+?[0-9]+$/.test(member.phone.replace(/\s+/g, ""))) {
        window.open(`sms:${member.phone}?body=${text}`, "_blank");
      }
    }

    setForm({ memberId: group.members[0]?.id || "", amount: group.contributionAmount, provider: "mtn-momo", phone: "" });
  }
  
  const localPayments = JSON.parse(localStorage.getItem(`payments-${group.id}`) || "[]");
  const allPayments = [...(group.transactions || []), ...localPayments];
  
  return (
    <>
      <h2>{t.payments}</h2>
      <section className="table-card gateway-card">
        <h3>{t.gateway}: Mobile Money</h3>
        <p>MTN MoMo / Orange Money / Bank Transfer - Active</p>
      </section>
      <section className="inline-form">
        <h3>{t.pay}</h3>
        <div className="form-grid">
          <Select label={t.member} value={form.memberId} onChange={(memberId) => setForm({ ...form, memberId })} options={group.members.map((m) => [m.id, m.name])} />
          <Input label={t.amount} type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
          <Select label="Method" value={form.provider} onChange={(provider) => setForm({ ...form, provider })} options={[["mtn-momo", t.momo], ["orange-money", t.om], ["bank-transfer", "Bank"], ["cash", t.cash]]} />
          <Input label={t.phone} value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
        </div>
        <button className="primary compact" onClick={handlePayment}><CreditCard size={18} /> {t.pay}</button>
      </section>
      {receipt && <ReceiptCard receipt={receipt} currency={group.currency} t={t} />}
      <section className="table-card">
        <h3>{t.payments}</h3>
        <RecordList items={localPayments} empty={t.noItems} render={(item) => (
          <span>{item.memberName} - {item.amount} {group.currency} - {item.status}</span>
        )} />
      </section>
      <section className="table-card stack-gap">
        <h3>Member payment history</h3>
        <RecordList items={group.members} empty={t.noItems} render={(member) => {
          const payments = allPayments.filter((payment) => payment.memberId === member.id);
          const total = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
          return <span>{member.name} - {payments.length} payment(s) - {money(total, group.currency)}</span>;
        }} />
      </section>
    </>
  );
}

function Loans({ group, setGroup, setGroups, refresh, t }) {
  const [form, setForm] = useState({ memberId: group.members[0]?.id || "", amount: "", interestRate: 0, dueDate: "" });
  const [application, setApplication] = useState({ memberId: group.members[0]?.id || "", amount: "", purpose: "" });
  const [repayment, setRepayment] = useState({ loanId: group.loans[0]?.id || "", amount: "", provider: "mtn-momo" });
  function saveOffline(nextGroup) {
    const normalized = normalizeGroup(nextGroup);
    setGroup(normalized);
    saveCurrentGroup(normalized);
    saveGroupLocally(normalized);
    setGroups((current) => upsertGroupInCollection(normalized, current));
  }

  async function submitApplication() {
    const member = group.members.find((item) => item.id === application.memberId);
    const localApplication = {
      id: `loan-app-${Date.now()}`,
      memberId: application.memberId,
      memberName: member?.name || "Member",
      amount: Number(application.amount),
      purpose: application.purpose,
      eligibility: "needs-review",
      status: "submitted",
      createdAt: new Date().toISOString()
    };
    try {
      await api("/loan-applications", { method: "POST", body: JSON.stringify(application) });
      setApplication({ ...application, amount: "", purpose: "" });
      refresh();
    } catch {
      saveOffline({ ...group, loanApplications: [localApplication, ...(group.loanApplications || [])] });
      addLocalActivity(group, `Loan application submitted for ${localApplication.memberName}`);
      setApplication({ ...application, amount: "", purpose: "" });
    }
  }

  async function createLoan() {
    const member = group.members.find((item) => item.id === form.memberId);
    const localLoan = {
      id: `loan-${Date.now()}`,
      memberId: form.memberId,
      memberName: member?.name || "Member",
      amount: Number(form.amount),
      interestRate: Number(form.interestRate || 0),
      dueDate: form.dueDate,
      status: "active",
      balance: Number(form.amount),
      repayments: [],
      createdAt: new Date().toISOString()
    };
    try {
      await api("/loans", { method: "POST", body: JSON.stringify(form) });
      setForm({ ...form, amount: "" });
      refresh();
    } catch {
      saveOffline({ ...group, loans: [localLoan, ...group.loans] });
      addLocalActivity(group, `Loan created for ${localLoan.memberName}: ${localLoan.amount} ${group.currency}`);
      setForm({ ...form, amount: "" });
      setRepayment((current) => ({ ...current, loanId: localLoan.id }));
    }
  }

  async function recordRepayment() {
    try {
      await api(`/loans/${repayment.loanId}/repayments`, { method: "POST", body: JSON.stringify(repayment) });
      setRepayment({ ...repayment, amount: "" });
      refresh();
    } catch {
      const amount = Number(repayment.amount);
      const loans = group.loans.map((loan) => loan.id !== repayment.loanId ? loan : {
        ...loan,
        balance: Math.max(0, Number(loan.balance ?? loan.amount) - amount),
        status: Number(loan.balance ?? loan.amount) - amount <= 0 ? "repaid" : loan.status,
        repayments: [{ id: `repayment-${Date.now()}`, amount, provider: repayment.provider, createdAt: new Date().toISOString() }, ...(loan.repayments || [])]
      });
      saveOffline({ ...group, loans });
      addLocalActivity(group, `Loan repayment recorded: ${amount} ${group.currency}`);
      setRepayment({ ...repayment, amount: "" });
    }
  }
  return (
    <>
      <h2>{t.loans}</h2>
      {can(group, "loans.apply") && <InlineForm title={t.applyLoan} onSubmit={submitApplication}>
        <Select label={t.member} value={application.memberId} onChange={(memberId) => setApplication({ ...application, memberId })} options={group.members.map((m) => [m.id, m.name])} />
        <Input label={t.amount} type="number" value={application.amount} onChange={(amount) => setApplication({ ...application, amount })} />
        <Input label={t.purpose} value={application.purpose} onChange={(purpose) => setApplication({ ...application, purpose })} />
      </InlineForm>}
      {can(group, "loans.write") && <InlineForm title={t.loanMember} onSubmit={createLoan}>
        <Select label={t.member} value={form.memberId} onChange={(memberId) => setForm({ ...form, memberId })} options={group.members.map((m) => [m.id, m.name])} />
        <Input label={t.amount} type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
        <Input label={t.interest} type="number" value={form.interestRate} onChange={(interestRate) => setForm({ ...form, interestRate })} />
        <Input label={t.dueDate} type="date" value={form.dueDate} onChange={(dueDate) => setForm({ ...form, dueDate })} />
      </InlineForm>}
      {group.loans.length > 0 && <InlineForm title={t.repayment} onSubmit={recordRepayment}>
        <Select label={t.loans} value={repayment.loanId} onChange={(loanId) => setRepayment({ ...repayment, loanId })} options={group.loans.map((loan) => [loan.id, `${loan.memberName} - ${money(loan.balance ?? loan.amount, group.currency)}`])} />
        <Input label={t.amount} type="number" value={repayment.amount} onChange={(amount) => setRepayment({ ...repayment, amount })} />
        <Select label="Method" value={repayment.provider} onChange={(provider) => setRepayment({ ...repayment, provider })} options={[["mtn-momo", t.momo], ["orange-money", t.om], ["bank-transfer", "Bank"], ["cash", t.cash]]} />
      </InlineForm>}
      <section className="table-card">
        <h3>{t.applyLoan}</h3>
        <RecordList items={group.loanApplications || []} empty={t.noItems} render={(item) => (
          <span>
            {item.memberName} - {money(item.amount, group.currency)} - {item.eligibility} - {item.status}
            {can(group, "loans.approve") && item.status === "submitted" && (
              <>
                <button className="secondary mini inline-action" onClick={async () => {
                try {
                  await api(`/loan-applications/${item.id}/approve`, { method: "POST", body: JSON.stringify({}) });
                  refresh();
                } catch {
                  const applications = group.loanApplications.map((applicationItem) => applicationItem.id === item.id ? { ...applicationItem, status: "approved" } : applicationItem);
                  const loan = { id: `loan-${Date.now()}`, memberId: item.memberId, memberName: item.memberName, amount: Number(item.amount), interestRate: 0, dueDate: group.nextPaymentDue || "", status: "active", balance: Number(item.amount), repayments: [], createdAt: new Date().toISOString() };
                  saveOffline({ ...group, loanApplications: applications, loans: [loan, ...group.loans] });
                  addLocalActivity(group, `Loan approved for ${item.memberName}`);
                  setRepayment((current) => ({ ...current, loanId: loan.id }));
                }
                }}>{t.approve}</button>
                <button className="secondary mini inline-action" onClick={async () => {
                  try {
                    await api(`/loan-applications/${item.id}/reject`, { method: "POST", body: JSON.stringify({}) });
                    refresh();
                  } catch {
                    const applications = group.loanApplications.map((applicationItem) => applicationItem.id === item.id ? { ...applicationItem, status: "rejected" } : applicationItem);
                    saveOffline({ ...group, loanApplications: applications });
                    addLocalActivity(group, `Loan rejected for ${item.memberName}`);
                  }
                }}>{t.reject}</button>
              </>
            )}
          </span>
        )} />
      </section>
      <section className="table-card">
        <h3>{t.loans}</h3>
        <RecordList items={group.loans} empty={t.noItems} render={(loan) => (
          <span>{loan.memberName} - {money(loan.balance ?? loan.amount, group.currency)} - {loan.status} - {loan.dueDate}</span>
        )} />
      </section>
    </>
  );
}

function Receipts({ group, t }) {
  const localReceipts = JSON.parse(localStorage.getItem(`receipts-${group.id}`) || "[]");
  const receipts = [...(group.receipts || []), ...localReceipts];
  return (
    <>
      <h2>{t.receipts}</h2>
      <div className="receipt-grid">
        {receipts.map((receipt) => <ReceiptCard key={receipt.id} receipt={receipt} currency={group.currency} t={t} />)}
      </div>
      {!receipts.length && <p className="empty">{t.noItems}</p>}
    </>
  );
}

function Rotation({ group, refresh, t }) {
  return (
    <>
      <h2>{t.rotation}</h2>
      {group.admin && <button className="primary compact" onClick={async () => {
        await api("/admin/rotation/generate", { method: "POST", body: "{}" });
        refresh();
      }}><Shuffle size={18} /> {t.generateRotation}</button>}
      <section className="table-card stack-gap">
        <RecordList items={group.rotations || []} empty={t.noItems} render={(turn) => (
          <span>{turn.memberName} - {turn.scheduledDate} - {money(turn.payoutAmount, group.currency)} - {turn.status}</span>
        )} />
      </section>
    </>
  );
}

function Votes({ group, refresh, t }) {
  const [vote, setVote] = useState({ title: "", description: "" });
  const [memberId, setMemberId] = useState(group.members[0]?.id || "");
  return (
    <>
      <h2>{t.vote}</h2>
      {can(group, "votes.write") && <InlineForm title={t.createVote} onSubmit={async () => {
        await api("/votes", { method: "POST", body: JSON.stringify(vote) });
        setVote({ title: "", description: "" });
        refresh();
      }}>
        <Input label="Title" value={vote.title} onChange={(title) => setVote({ ...vote, title })} />
        <Input label={t.message} value={vote.description} onChange={(description) => setVote({ ...vote, description })} />
      </InlineForm>}
      <section className="table-card">
        <label>{t.member}<select value={memberId} onChange={(event) => setMemberId(event.target.value)}>{group.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
        <RecordList items={group.votes || []} empty={t.noItems} render={(item) => {
          const yes = item.ballots?.filter((ballot) => ballot.choice === "yes").length || 0;
          const no = item.ballots?.filter((ballot) => ballot.choice === "no").length || 0;
          return (
            <span className="vote-row">
              <strong>{item.title}</strong> {yes} {t.yes} / {no} {t.no}
              <button className="secondary mini" onClick={async () => { await api(`/votes/${item.id}/cast`, { method: "POST", body: JSON.stringify({ memberId, choice: "yes" }) }); refresh(); }}>{t.yes}</button>
              <button className="secondary mini" onClick={async () => { await api(`/votes/${item.id}/cast`, { method: "POST", body: JSON.stringify({ memberId, choice: "no" }) }); refresh(); }}>{t.no}</button>
            </span>
          );
        }} />
      </section>
    </>
  );
}

function Community({ group, refresh, t }) {
  const [post, setPost] = useState({ author: "", body: "", type: "message" });
  
  async function handleSendMessage() {
    if (!post.author || !post.body) {
      alert("Please fill name and message");
      return;
    }
    const messages = JSON.parse(localStorage.getItem(`msgs-${group.id}`) || "[]");
    messages.push({ ...post, id: Date.now(), createdAt: new Date().toLocaleString() });
    localStorage.setItem(`msgs-${group.id}`, JSON.stringify(messages));
    
    // Try to send via WhatsApp
    const whatsappMsg = encodeURIComponent(`${post.author}: ${post.body}`);
    window.open(`https://wa.me/?text=${whatsappMsg}`, "_blank");
    
    setPost({ author: "", body: "", type: "message" });
    refresh();
  }

  const messages = JSON.parse(localStorage.getItem(`msgs-${group.id}`) || "[]");
  
  return (
    <>
      <h2>{t.community}</h2>
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
        <h3>{t.post}</h3>
        <div className="form-grid">
          <Input label={t.name} value={post.author} onChange={(author) => setPost({ ...post, author })} />
          <Input label={t.message} value={post.body} onChange={(body) => setPost({ ...post, body })} />
        </div>
        <button className="primary compact"><MessageSquare size={18} /> {t.post}</button>
      </form>
      <section className="table-card">
        <h3>{t.message}</h3>
        <RecordList items={messages} empty={t.noItems} render={(item) => <span>{item.author} - {item.body}</span>} />
      </section>
    </>
  );
}

function Education({ group, t }) {
  return (
    <>
      <h2>{t.education}</h2>
      <div className="members-grid">
        {(group.education || []).map((item) => (
          <article className="member-card" key={item.id}>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </article>
        ))}
      </div>
    </>
  );
}

function Reminders({ group, refresh, t }) {
  return (
    <>
      <h2>{t.reminders}</h2>
      {can(group, "reminders.write") && <button className="primary compact" onClick={async () => {
        await api("/admin/reminders", { method: "POST", body: JSON.stringify({ channel: "whatsapp" }) });
        refresh();
      }}><Bell size={18} /> {t.queueSms}</button>}
      <section className="table-card">
        <h3>{t.reminders}</h3>
        <RecordList items={group.reminders} empty={t.noItems} render={(item) => (
          <span>{item.phone} - {item.channel} - {item.type} - {item.status} - {item.message}</span>
        )} />
      </section>
      <section className="table-card stack-gap">
        <h3>{t.notifications}</h3>
        <RecordList items={group.notifications} empty={t.noItems} render={(item) => (
          <span>{item.phone} - {item.provider} - {item.status} - {item.message}</span>
        )} />
      </section>
    </>
  );
}

function Reports({ group, refresh, t }) {
  const [rules, setRules] = useState({
    contributionAmount: group.contributionAmount,
    lateFeeAmount: group.rules?.lateFeeAmount || group.lateFeeAmount,
    latePenaltyPercent: group.rules?.latePenaltyPercent || 10,
    loanInterestRate: group.rules?.loanInterestRate || 5,
    maxLoanMultiplier: group.rules?.maxLoanMultiplier || 3,
    voteApprovalThreshold: group.rules?.voteApprovalThreshold || 60,
    rotationIntervalDays: group.rules?.rotationIntervalDays || 30
  });
  const [biometric, setBiometric] = useState("");
  async function downloadReport() {
    const filename = `${group.id || "tontine"}-monthly-report.csv`;
    try {
      const token = localStorage.getItem("tontine-token");
      const response = await fetch(`${API}/reports/monthly.csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const type = response.headers.get("content-type") || "";
      if (!response.ok || !type.includes("text/csv")) throw new Error("Monthly report is unavailable");
      downloadCsv(filename, await response.text());
    } catch {
      downloadCsv(filename, monthlyReportCsv(group));
    }
  }

  return (
    <>
      <h2>{t.reports}</h2>
      <div className="report-actions">
        <button className="primary compact" onClick={downloadReport}><Download size={18} /> {t.downloadReport}</button>
        <button className="secondary compact" onClick={() => downloadBackup(group)}><Download size={18} /> {t.backup}</button>
        <button className="secondary compact" onClick={async () => {
          if (navigator.credentials?.get) {
            setBiometric("Device biometric prompt ready");
          }
          await api("/security/biometric/verify", { method: "POST", body: JSON.stringify({ method: "device-biometric" }) });
          setBiometric("Verified");
          refresh();
        }}><Fingerprint size={18} /> {t.biometric}</button>
        {can(group, "reconciliation.run") && <button className="secondary compact" onClick={async () => {
          await api("/admin/reconciliation/run", { method: "POST", body: "{}" });
          refresh();
        }}><ClipboardCheck size={18} /> {t.reconcile}</button>}
      </div>
      {biometric && <p className="intent-box">{biometric}</p>}
      {group.admin && <InlineForm title={t.rules} onSubmit={async () => {
        await api("/admin/settings", { method: "POST", body: JSON.stringify(rules) });
        refresh();
      }}>
        <Input label={t.contribution} type="number" value={rules.contributionAmount} onChange={(contributionAmount) => setRules({ ...rules, contributionAmount })} />
        <Input label={t.lateFees} type="number" value={rules.lateFeeAmount} onChange={(lateFeeAmount) => setRules({ ...rules, lateFeeAmount })} />
        <Input label="Penalty %" type="number" value={rules.latePenaltyPercent} onChange={(latePenaltyPercent) => setRules({ ...rules, latePenaltyPercent })} />
        <Input label={t.interest} type="number" value={rules.loanInterestRate} onChange={(loanInterestRate) => setRules({ ...rules, loanInterestRate })} />
        <Input label="Loan multiplier" type="number" value={rules.maxLoanMultiplier} onChange={(maxLoanMultiplier) => setRules({ ...rules, maxLoanMultiplier })} />
        <Input label="Vote %" type="number" value={rules.voteApprovalThreshold} onChange={(voteApprovalThreshold) => setRules({ ...rules, voteApprovalThreshold })} />
        <Input label="Rotation days" type="number" value={rules.rotationIntervalDays} onChange={(rotationIntervalDays) => setRules({ ...rules, rotationIntervalDays })} />
      </InlineForm>}
      <div className="chart-grid">
        <ProjectionChart title={t.projections} data={group.projections} valueKey="savings" currency={group.currency} />
        <ProjectionChart title={t.payoutProjection} data={group.projections} valueKey="projectedPayout" currency={group.currency} />
      </div>
      <section className="table-card">
        <h3>{t.lateFees}</h3>
        <RecordList items={group.lateFees} empty={t.noItems} render={(item) => (
          <span>{item.memberName} - {money(item.amount, group.currency)} - {item.status} - {item.dueDate}</span>
        )} />
      </section>
      <section className="table-card stack-gap">
        <h3>{t.audit}</h3>
        <RecordList items={group.audit || []} empty={t.noItems} render={(item) => (
          <span>{item.createdAt} - {item.action} - {item.hash?.slice(0, 16)}</span>
        )} />
      </section>
    </>
  );
}

function ProjectionChart({ title, data = [], valueKey, currency }) {
  const max = Math.max(...data.map((item) => item[valueKey] || 0), 1);
  const points = data.map((item, index) => {
    const x = 24 + index * (252 / Math.max(data.length - 1, 1));
    const y = 136 - ((item[valueKey] || 0) / max) * 108;
    return `${x},${y}`;
  }).join(" ");
  return (
    <section className="chart-card">
      <div className="chart-title"><Activity size={18} /> <h3>{title}</h3></div>
      <svg viewBox="0 0 310 170" role="img" aria-label={title}>
        <line x1="24" y1="140" x2="288" y2="140" />
        <line x1="24" y1="24" x2="24" y2="140" />
        <polyline points={points} />
        {data.map((item, index) => {
          const x = 24 + index * (252 / Math.max(data.length - 1, 1));
          const y = 136 - ((item[valueKey] || 0) / max) * 108;
          return <circle key={item.month} cx={x} cy={y} r="4" />;
        })}
      </svg>
      <strong>{money(data.at(-1)?.[valueKey] || 0, currency)}</strong>
    </section>
  );
}

function HealthBadge({ health, t }) {
  const label = t[health?.status] || health?.label || t.watch;
  return <span className={`health health-${health?.color || "blue"}`}>{label}</span>;
}

function ReceiptCard({ receipt, currency, t }) {
  return (
    <article className="receipt">
      <div>
        <small>{receipt.id}</small>
        <strong>{receipt.memberName}</strong>
      </div>
      <span>{money(receipt.amount, currency)}</span>
      <span>{receipt.provider}</span>
      <code>{t.proof}: {receipt.proofCode}</code>
    </article>
  );
}

function InlineForm({ title, children, onSubmit }) {
  return (
    <form className="inline-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <h3>{title}</h3>
      <div className="form-grid">{children}</div>
      <button className="primary compact"><Plus size={18} /> {title}</button>
    </form>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return <label>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} required /></label>;
}

function Select({ label, value, onChange, options }) {
  return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>;
}

function RecordList({ items, empty, render }) {
  if (!items.length) return <p className="empty">{empty}</p>;
  return <div className="record-list">{items.map((item) => <div key={item.id}>{render(item)}</div>)}</div>;
}

function loadLocalActivity(groupId) {
  try {
    const entries = JSON.parse(localStorage.getItem(`activity-${groupId}`) || "[]");
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

function addLocalActivity(group, action) {
  const entries = loadLocalActivity(group.id);
  entries.unshift({ id: `activity-${Date.now()}`, action, createdAt: new Date().toLocaleString() });
  localStorage.setItem(`activity-${group.id}`, JSON.stringify(entries.slice(0, 50)));
}

function monthlyReportCsv(group) {
  const month = new Date().toISOString().slice(0, 7);
  const payments = (group.transactions || []).filter((item) => item.createdAt?.startsWith(month));
  const total = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const rows = [
    ["Tontine", group.name],
    ["Month", month],
    ["Members", (group.members || []).length],
    ["Total payments", total],
    [],
    ["Member", "Role", "Phone", "Health", "Balance"],
    ...(group.members || []).map((member) => [member.name, member.role, member.phone, member.health?.status || "watch", member.health?.balance || 0])
  ];
  return rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
}

function downloadCsv(filename, contents) {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadBackup(group) {
  const backup = {
    exportedAt: new Date().toISOString(),
    group,
    localPayments: JSON.parse(localStorage.getItem(`payments-${group.id}`) || "[]"),
    localReceipts: JSON.parse(localStorage.getItem(`receipts-${group.id}`) || "[]"),
    activity: loadLocalActivity(group.id)
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${group.id || "tontine"}-backup.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function CreateTontineForm({ onSubmit, onCancel, t }) {
  const [name, setName] = useState("");
  return (
    <main className="login-layout">
      <section className="welcome">
        <p className="eyebrow"><Plus size={16} /> Create New Tontine</p>
        <h1>Start Your Group</h1>
        <p>Create a new savings group with your friends and family.</p>
      </section>
      <form className="login-panel" onSubmit={(e) => { e.preventDefault(); if (name) onSubmit(name); }}>
        <label>Group Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Women Savings Club"
          required
        />
        <button className="primary" disabled={!name}>
          <Plus size={18} /> Create Tontine
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Back
        </button>
      </form>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
