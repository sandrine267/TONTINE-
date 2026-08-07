import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { nanoid } from "nanoid";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const dataFile = path.join(dataDir, "store.json");
const PORT = Number(process.env.PORT || 4000);
const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-secret-before-deployment";
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ROLE_PERMISSIONS = {
  admin: ["*"],
  treasurer: ["payments.write", "loans.write", "loans.approve", "reports.read", "reconciliation.run", "reminders.write", "votes.write"],
  secretary: ["members.write", "kyc.verify", "reports.read", "reminders.write", "votes.write", "collaboration.write"],
  member: ["payments.write", "loans.apply", "reports.read", "votes.cast", "collaboration.write"]
};

const app = express();
app.set("trust proxy", true);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

function hashSecret(secret, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(secret), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifySecret(secret, stored) {
  const [salt, hash] = stored.split(":");
  const candidate = crypto.pbkdf2Sync(String(secret), salt, 120000, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 8 })).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function readToken(token) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  return payload.exp > Date.now() ? payload : null;
}

async function loadStore() {
  try {
    const store = normalizeStore(JSON.parse(await fs.readFile(dataFile, "utf8")));
    const changed = applyScheduledTriggers(store);
    if (changed) await saveStore(store);
    return store;
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    const seed = createSeed();
    await saveStore(seed);
    return seed;
  }
}

async function saveStore(store) {
  await fs.mkdir(dataDir, { recursive: true });
  const clean = {
    ...store,
    groups: store.groups.map(({ _audit, ...group }) => group)
  };
  await fs.writeFile(dataFile, JSON.stringify(clean, null, 2));
}

function createSeed() {
  const now = new Date().toISOString();
  return {
    groups: [
      {
        id: "solidarity-women",
        name: "Tontine Solidarity Women",
        description: "Weekly savings and emergency loans",
        pinHash: hashSecret("1234"),
        adminPinHash: hashSecret("9999"),
        rolePins: {
          treasurer: hashSecret("5555"),
          secretary: hashSecret("7777")
        },
        currency: "XAF",
        contributionAmount: 10000,
        lateFeeAmount: 1000,
        rules: defaultRules(10000),
        paymentGateway: defaultGateway(),
        paymentDeadlineDay: "Saturday",
        nextPaymentDue: nextDate(6),
        nextMeetingAt: meetingDate(6),
        createdAt: now,
        members: [
          { id: "m1", name: "Amina N.", phone: "+237670000001", identityId: "CNI-001-2026", role: "Treasurer", kycStatus: "verified" },
          { id: "m2", name: "Brenda F.", phone: "+237670000002", identityId: "CNI-002-2026", role: "Member", kycStatus: "pending" },
          { id: "m3", name: "Grace M.", phone: "+237670000003", identityId: "CNI-003-2026", role: "Member", kycStatus: "pending" }
        ],
        transactions: [],
        loans: [],
        loanApplications: [],
        paymentIntents: [],
        receipts: [],
        reminders: [],
        notifications: [],
        lateFees: [],
        rotations: [],
        votes: [],
        messages: [],
        minutes: [],
        education: defaultEducation()
      },
      {
        id: "unity-builders",
        name: "Tontine Unity Builders",
        description: "Monthly project savings circle",
        pinHash: hashSecret("2468"),
        adminPinHash: hashSecret("8642"),
        rolePins: {
          treasurer: hashSecret("5555"),
          secretary: hashSecret("7777")
        },
        currency: "XAF",
        contributionAmount: 25000,
        lateFeeAmount: 2000,
        rules: defaultRules(25000),
        paymentGateway: defaultGateway(),
        paymentDeadlineDay: "Friday",
        nextPaymentDue: nextDate(5),
        nextMeetingAt: meetingDate(5),
        createdAt: now,
        members: [
          { id: "m4", name: "Jean T.", phone: "+237690000001", identityId: "CNI-004-2026", role: "President", kycStatus: "verified" },
          { id: "m5", name: "Mireille K.", phone: "+237690000002", identityId: "CNI-005-2026", role: "Member", kycStatus: "pending" }
        ],
        transactions: [],
        loans: [],
        loanApplications: [],
        paymentIntents: [],
        receipts: [],
        reminders: [],
        notifications: [],
        lateFees: [],
        rotations: [],
        votes: [],
        messages: [],
        minutes: [],
        education: defaultEducation()
      }
    ],
    audit: []
  };
}

function normalizeStore(store) {
  store.audit ||= [];
  store.groups = (store.groups || []).map((group) => {
    group.rolePins ||= { treasurer: hashSecret("5555"), secretary: hashSecret("7777") };
    group.rules ||= defaultRules(group.contributionAmount || 10000);
    group.paymentGateway ||= defaultGateway();
    group.lateFeeAmount ||= Math.max(500, Math.round((group.contributionAmount || 10000) * 0.1));
    group.nextMeetingAt ||= `${group.nextPaymentDue}T17:00:00.000Z`;
    group.transactions ||= [];
    group.loans ||= [];
    group.loanApplications ||= [];
    group.paymentIntents ||= [];
    group.receipts ||= [];
    group.reminders ||= [];
    group.notifications ||= [];
    group.lateFees ||= [];
    group.rotations ||= [];
    group.votes ||= [];
    group.messages ||= [];
    group.minutes ||= [];
    group.education ||= defaultEducation();
    group.members = (group.members || []).map((member) => ({
      ...member,
      role: normalizeRole(member.role),
      kycStatus: member.kycStatus || (member.identityId && member.phone ? "pending" : "missing"),
      verifiedAt: member.verifiedAt || null
    }));
    return group;
  });
  return store;
}

function defaultRules(contributionAmount) {
  return {
    latePenaltyPercent: 10,
    lateFeeAmount: Math.max(500, Math.round(contributionAmount * 0.1)),
    loanInterestRate: 5,
    maxLoanMultiplier: 3,
    voteApprovalThreshold: 60,
    rotationIntervalDays: 30
  };
}

function defaultGateway() {
  return {
    name: "Unified Payment Aggregator",
    providers: ["mtn-momo", "orange-money", "bank-transfer"],
    status: "sandbox",
    settlementAccount: "TONTINE-POOL-XAF"
  };
}

function defaultEducation() {
  return [
    { id: "edu-budget", title: "Budget before contribution day", body: "Reserve tontine money first, then plan daily spending from the remainder." },
    { id: "edu-loan", title: "Borrow only for productive needs", body: "A tontine loan is healthiest when it protects income, stock, school fees, or emergencies." },
    { id: "edu-proof", title: "Keep receipts", body: "Receipts and audit logs protect every member and make meetings faster." }
  ];
}

function normalizeRole(role) {
  const value = String(role || "member").toLowerCase();
  if (value.includes("treasurer") || value.includes("tresor")) return "treasurer";
  if (value.includes("secretary") || value.includes("secretaire")) return "secretary";
  if (value.includes("president") || value.includes("admin")) return "admin";
  return "member";
}

function meetingDate(dayIndex) {
  return `${nextDate(dayIndex)}T17:00:00.000Z`;
}

function nextDate(dayIndex) {
  const date = new Date();
  const distance = (dayIndex + 7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + distance);
  return date.toISOString().slice(0, 10);
}

function publicGroup(group) {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    currency: group.currency,
    contributionAmount: group.contributionAmount,
    lateFeeAmount: group.lateFeeAmount,
    paymentDeadlineDay: group.paymentDeadlineDay,
    nextPaymentDue: group.nextPaymentDue,
    nextMeetingAt: group.nextMeetingAt,
    memberCount: group.members.length
  };
}

function groupView(group, role = "member") {
  const view = publicGroup(group);
  return {
    ...view,
    rules: group.rules,
    paymentGateway: group.paymentGateway,
    members: group.members.map((member) => ({
      ...member,
      health: memberHealth(group, member.id),
      creditScore: creditScore(group, member.id)
    })),
    transactions: group.transactions,
    loans: group.loans,
    loanApplications: group.loanApplications,
    paymentIntents: group.paymentIntents,
    receipts: group.receipts,
    reminders: group.reminders,
    notifications: group.notifications,
    lateFees: group.lateFees,
    rotations: group.rotations,
    votes: group.votes,
    messages: group.messages,
    minutes: group.minutes,
    education: group.education,
    projections: buildProjections(group),
    analytics: buildAnalytics(group),
    audit: hasPermission(role, "reports.read") ? groupAudit(group, role) : [],
    role,
    capabilities: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.member,
    admin: role === "admin"
  };
}

function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.member;
  return permissions.includes("*") || permissions.includes(permission);
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.session.role, permission)) return res.status(403).json({ error: "Insufficient role permission" });
    next();
  };
}

function appendAudit(store, groupId, action, details = {}) {
  const previousHash = store.audit[0]?.hash || "GENESIS";
  const entry = {
    id: nanoid(10),
    groupId,
    action,
    details,
    previousHash,
    createdAt: new Date().toISOString()
  };
  entry.hash = crypto.createHash("sha256").update(JSON.stringify(entry)).digest("hex");
  store.audit.unshift(entry);
  return entry;
}

function groupAudit(group, role) {
  if (!hasPermission(role, "reports.read")) return [];
  return (group._audit || []).slice(0, 50);
}

function attachAudit(store) {
  for (const group of store.groups) {
    group._audit = store.audit.filter((entry) => entry.groupId === group.id);
  }
}

function hasPaidForDueDate(group, memberId, dueDate = group.nextPaymentDue) {
  return group.transactions.some((item) =>
    item.memberId === memberId &&
    ["recorded", "confirmed", "reconciled"].includes(item.status) &&
    item.createdAt?.slice(0, 10) <= dueDate
  );
}

function memberBalance(group, memberId) {
  const paid = group.transactions
    .filter((item) => item.memberId === memberId && ["recorded", "confirmed", "reconciled"].includes(item.status))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const fees = group.lateFees
    .filter((item) => item.memberId === memberId && item.status !== "waived")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return paid - fees;
}

function memberHealth(group, memberId) {
  const paid = hasPaidForDueDate(group, memberId);
  const fee = group.lateFees.find((item) => item.memberId === memberId && item.dueDate === group.nextPaymentDue);
  const due = new Date(`${group.nextPaymentDue}T23:59:59.000Z`);
  const hoursLeft = Math.ceil((due - new Date()) / 3600000);
  if (fee) return { status: "late", label: "Late fee applied", color: "red", balance: memberBalance(group, memberId), hoursLeft };
  if (paid) return { status: "healthy", label: "Contribution paid", color: "green", balance: memberBalance(group, memberId), hoursLeft };
  if (hoursLeft <= 24) return { status: "warning", label: "Due within 24h", color: "yellow", balance: memberBalance(group, memberId), hoursLeft };
  return { status: "watch", label: "Awaiting contribution", color: "blue", balance: memberBalance(group, memberId), hoursLeft };
}

function creditScore(group, memberId) {
  const memberPayments = group.transactions.filter((item) => item.memberId === memberId && ["recorded", "confirmed", "reconciled"].includes(item.status));
  const lateFees = group.lateFees.filter((item) => item.memberId === memberId && item.status !== "waived").length;
  const loans = group.loans.filter((item) => item.memberId === memberId);
  const paidRatio = Math.min(1, memberPayments.length / Math.max(1, group.transactions.length || group.members.length));
  const repaymentBonus = loans.filter((loan) => loan.status === "repaid").length * 20;
  const score = 520 + Math.round(paidRatio * 220) + repaymentBonus - lateFees * 45;
  return Math.max(300, Math.min(850, score));
}

function buildAnalytics(group) {
  const confirmed = group.transactions.filter((item) => ["recorded", "confirmed", "reconciled"].includes(item.status));
  const expected = group.members.length * group.contributionAmount;
  const totalContributions = confirmed.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingPayments = Math.max(0, group.members.length - new Set(confirmed.map((item) => item.memberId)).size);
  const latePaymentTrend = group.lateFees.length;
  const pool = totalContributions + group.lateFees.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    - group.loans.filter((loan) => loan.status === "active").reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  return {
    totalContributions,
    expected,
    contributionRate: expected ? Math.round((totalContributions / expected) * 100) : 0,
    pendingPayments,
    latePaymentTrend,
    loanPool: Math.max(0, pool),
    paidMembers: new Set(confirmed.map((item) => item.memberId)).size,
    paidHistory: group.rotations.filter((item) => item.status === "paid")
  };
}

function generateRotation(group) {
  const members = [...group.members].sort((a, b) => creditScore(group, b.id) - creditScore(group, a.id));
  const start = new Date(group.nextPaymentDue);
  return members.map((member, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index * (group.rules?.rotationIntervalDays || 30));
    return {
      id: nanoid(8),
      memberId: member.id,
      memberName: member.name,
      payoutAmount: group.contributionAmount * group.members.length,
      scheduledDate: date.toISOString().slice(0, 10),
      status: index === 0 ? "next" : "scheduled",
      creditScore: creditScore(group, member.id),
      createdAt: new Date().toISOString()
    };
  });
}

function applyScheduledTriggers(store) {
  attachAudit(store);
  let changed = false;
  for (const group of store.groups) {
    const now = Date.now();
    const dueTime = new Date(`${group.nextPaymentDue}T23:59:59.000Z`).getTime();
    const reminderTime = new Date(group.nextMeetingAt || `${group.nextPaymentDue}T17:00:00.000Z`).getTime() - 86400000;
    if (now >= reminderTime) {
      for (const member of group.members) {
        const alreadyQueued = group.reminders.some((item) => item.memberId === member.id && item.type === "predictive-24h" && item.dueDate === group.nextPaymentDue);
        if (!alreadyQueued) {
          group.reminders.unshift(createReminder(group, member, "predictive-24h", "sms"));
          group.notifications.unshift(createNotification(group, member, "whatsapp", `24h reminder: ${group.name} meeting/payment is due on ${group.nextPaymentDue}.`));
          appendAudit(store, group.id, "predictive_reminder_queued", { memberId: member.id, dueDate: group.nextPaymentDue });
          changed = true;
        }
      }
    }
    if (now > dueTime) {
      for (const member of group.members) {
        const alreadyCharged = group.lateFees.some((item) => item.memberId === member.id && item.dueDate === group.nextPaymentDue);
        if (!alreadyCharged && !hasPaidForDueDate(group, member.id)) {
          const fee = {
            id: nanoid(10),
            memberId: member.id,
            memberName: member.name,
            amount: Number(group.rules?.lateFeeAmount || group.lateFeeAmount),
            dueDate: group.nextPaymentDue,
            status: "applied",
            createdAt: new Date().toISOString()
          };
          group.lateFees.unshift(fee);
          appendAudit(store, group.id, "late_fee_applied", { memberId: member.id, amount: fee.amount, dueDate: fee.dueDate });
          changed = true;
        }
      }
    }
  }
  attachAudit(store);
  return changed;
}

function createReminder(group, member, type = "manual", channel = "sms") {
  const due = new Date(group.nextPaymentDue);
  const daysLeft = Math.ceil((due - new Date()) / 86400000);
  return {
    id: nanoid(8),
    memberId: member.id,
    phone: member.phone,
    channel,
    type,
    status: "queued",
    dueDate: group.nextPaymentDue,
    message: `Reminder: ${group.name} payment of ${group.contributionAmount} ${group.currency} is due on ${group.nextPaymentDue}.`,
    daysLeft,
    createdAt: new Date().toISOString()
  };
}

function createNotification(group, member, channel, message, receiptId = null) {
  return {
    id: nanoid(8),
    memberId: member.id,
    phone: member.phone,
    channel,
    provider: channel === "whatsapp" ? "whatsapp-business-api" : "sms-gateway",
    status: "queued",
    receiptId,
    message,
    createdAt: new Date().toISOString()
  };
}

function buildReceipt(group, payment, member) {
  const proofCode = crypto.createHash("sha256").update(`${payment.id}:${group.id}`).digest("hex").slice(0, 12).toUpperCase();
  return {
    id: `RCT-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`,
    paymentId: payment.id,
    memberName: member.name,
    amount: payment.amount,
    provider: payment.provider,
    issuedAt: payment.createdAt,
    groupName: group.name,
    proofCode,
    shareUrl: `/receipts/${group.id}/${proofCode}`
  };
}

function buildProjections(group) {
  const confirmedTotal = group.transactions
    .filter((item) => ["recorded", "confirmed", "reconciled"].includes(item.status))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const members = group.members.length || 1;
  return Array.from({ length: 6 }, (_, index) => {
    const month = index + 1;
    const monthlyContribution = group.contributionAmount * members;
    const projectedCapital = confirmedTotal + monthlyContribution * month;
    return {
      month,
      savings: confirmedTotal + monthlyContribution * month,
      projectedPayout: Math.round(projectedCapital / members),
      capital: projectedCapital
    };
  });
}

function monthlyReport(group) {
  const month = new Date().toISOString().slice(0, 7);
  const payments = group.transactions.filter((item) => item.createdAt?.startsWith(month));
  const total = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const rows = [
    ["Tontine", group.name],
    ["Month", month],
    ["Members", group.members.length],
    ["Total payments", total],
    ["Pending payments", buildAnalytics(group).pendingPayments],
    ["Contribution rate", `${buildAnalytics(group).contributionRate}%`],
    ["Late fees", group.lateFees.reduce((sum, item) => sum + Number(item.amount || 0), 0)],
    [],
    ["Member", "Role", "Phone", "Health", "Balance"],
    ...group.members.map((member) => [member.name, member.role, member.phone, memberHealth(group, member.id).status, memberBalance(group, member.id)])
  ];
  return rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
}

async function authGroup(req, res, next) {
  const session = readToken(req.headers.authorization?.replace("Bearer ", ""));
  if (!session?.groupId) return res.status(401).json({ error: "Session expired or missing" });
  const store = await loadStore();
  const group = store.groups.find((item) => item.id === session.groupId);
  if (!group) return res.status(404).json({ error: "Tontine not found" });
  attachAudit(store);
  req.store = store;
  req.group = group;
  req.session = session;
  next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "tontine-app" });
});

app.get("/api/groups", async (_req, res) => {
  const store = await loadStore();
  res.json(store.groups.map(publicGroup));
});

app.post("/api/groups/:id/login", async (req, res) => {
  const store = await loadStore();
  const group = store.groups.find((item) => item.id === req.params.id);
  if (!group) return res.status(404).json({ error: "Tontine not found" });
  const requestedRole = ["admin", "treasurer", "secretary", "member"].includes(req.body.role) ? req.body.role : "member";
  const secretHash = requestedRole === "admin"
    ? group.adminPinHash
    : requestedRole === "member"
      ? group.pinHash
      : group.rolePins?.[requestedRole];
  if (!verifySecret(req.body.pin, secretHash)) return res.status(401).json({ error: "Invalid PIN" });
  appendAudit(store, group.id, "login", { role: requestedRole });
  await saveStore(store);
  res.json({ token: sign({ groupId: group.id, role: requestedRole }), group: groupView(group, requestedRole) });
});

app.get("/api/me", authGroup, (req, res) => {
  res.json({ group: groupView(req.group, req.session.role) });
});

app.post("/api/payment-intents", authGroup, requirePermission("payments.write"), async (req, res) => {
  const member = req.group.members.find((item) => item.id === req.body.memberId);
  if (!member) return res.status(400).json({ error: "Member not found" });
  const provider = ["mtn-momo", "orange-money", "bank-transfer"].includes(req.body.provider) ? req.body.provider : "mtn-momo";
  const intent = {
    id: `PAY-${nanoid(8).toUpperCase()}`,
    memberId: member.id,
    memberName: member.name,
    amount: Number(req.body.amount || req.group.contributionAmount),
    provider,
    status: "awaiting-member-authorization",
    checkoutUrl: `/checkout/${req.group.id}/${provider}`,
    aggregator: req.group.paymentGateway.name,
    createdAt: new Date().toISOString()
  };
  req.group.paymentIntents.unshift(intent);
  appendAudit(req.store, req.group.id, "payment_intent_created", { intentId: intent.id, provider, amount: intent.amount });
  await saveStore(req.store);
  res.status(201).json({ intent });
});

app.post("/api/payments", authGroup, requirePermission("payments.write"), async (req, res) => {
  const { memberId, amount, provider, phone } = req.body;
  const member = req.group.members.find((item) => item.id === memberId);
  if (!member) return res.status(400).json({ error: "Member not found" });
  if (!["momo", "mtn-momo", "orange-money", "bank-transfer", "cash", "aggregated-gateway"].includes(provider)) return res.status(400).json({ error: "Unsupported payment method" });
  const payment = {
    id: nanoid(10),
    memberId,
    memberName: member.name,
    amount: Number(amount),
    provider,
    phone: phone || member.phone,
    status: provider === "cash" ? "recorded" : "pending-provider-confirmation",
    createdAt: new Date().toISOString()
  };
  const receipt = buildReceipt(req.group, payment, member);
  req.group.transactions.unshift(payment);
  req.group.receipts.unshift(receipt);
  req.group.notifications.unshift(createNotification(req.group, member, "whatsapp", `Receipt ${receipt.id}: ${payment.amount} ${req.group.currency} received for ${req.group.name}.`, receipt.id));
  appendAudit(req.store, req.group.id, "payment_created", { paymentId: payment.id, memberId, amount: payment.amount, provider });
  await saveStore(req.store);
  res.status(201).json({ payment, receipt });
});

app.post("/api/loan-applications", authGroup, requirePermission("loans.apply"), async (req, res) => {
  const member = req.group.members.find((item) => item.id === req.body.memberId);
  if (!member) return res.status(400).json({ error: "Member not found" });
  const score = creditScore(req.group, member.id);
  const maxEligible = req.group.contributionAmount * (req.group.rules?.maxLoanMultiplier || 3);
  const application = {
    id: nanoid(10),
    memberId: member.id,
    memberName: member.name,
    amount: Number(req.body.amount),
    purpose: req.body.purpose || "General need",
    creditScore: score,
    eligibility: score >= 600 && Number(req.body.amount) <= maxEligible ? "eligible" : "needs-review",
    status: "submitted",
    createdAt: new Date().toISOString()
  };
  req.group.loanApplications.unshift(application);
  appendAudit(req.store, req.group.id, "loan_application_submitted", { applicationId: application.id, memberId: member.id, amount: application.amount });
  await saveStore(req.store);
  res.status(201).json({ application });
});

app.post("/api/loan-applications/:id/approve", authGroup, requirePermission("loans.approve"), async (req, res) => {
  const application = req.group.loanApplications.find((item) => item.id === req.params.id);
  if (!application) return res.status(404).json({ error: "Application not found" });
  application.status = "approved";
  application.approvedAt = new Date().toISOString();
  const loan = {
    id: nanoid(10),
    memberId: application.memberId,
    memberName: application.memberName,
    amount: application.amount,
    interestRate: Number(req.body.interestRate || req.group.rules?.loanInterestRate || 5),
    dueDate: req.body.dueDate || req.group.nextPaymentDue,
    status: "active",
    balance: application.amount,
    repayments: [],
    createdAt: new Date().toISOString()
  };
  req.group.loans.unshift(loan);
  appendAudit(req.store, req.group.id, "loan_application_approved", { applicationId: application.id, loanId: loan.id });
  await saveStore(req.store);
  res.status(201).json({ application, loan });
});

app.post("/api/loan-applications/:id/reject", authGroup, requirePermission("loans.approve"), async (req, res) => {
  const application = req.group.loanApplications.find((item) => item.id === req.params.id);
  if (!application) return res.status(404).json({ error: "Application not found" });
  if (application.status !== "submitted") return res.status(400).json({ error: "Only submitted applications can be rejected" });
  application.status = "rejected";
  application.rejectedAt = new Date().toISOString();
  appendAudit(req.store, req.group.id, "loan_application_rejected", { applicationId: application.id });
  await saveStore(req.store);
  res.json({ application });
});

app.post("/api/loans", authGroup, requirePermission("loans.write"), async (req, res) => {
  const member = req.group.members.find((item) => item.id === req.body.memberId);
  if (!member) return res.status(400).json({ error: "Member not found" });
  const loan = {
    id: nanoid(10),
    memberId: member.id,
    memberName: member.name,
    amount: Number(req.body.amount),
    interestRate: Number(req.body.interestRate || 0),
    dueDate: req.body.dueDate,
    status: "active",
    balance: Number(req.body.amount),
    repayments: [],
    createdAt: new Date().toISOString()
  };
  req.group.loans.unshift(loan);
  appendAudit(req.store, req.group.id, "loan_created", { loanId: loan.id, memberId: member.id, amount: loan.amount });
  await saveStore(req.store);
  res.status(201).json({ loan });
});

app.post("/api/loans/:id/repayments", authGroup, requirePermission("payments.write"), async (req, res) => {
  const loan = req.group.loans.find((item) => item.id === req.params.id);
  if (!loan) return res.status(404).json({ error: "Loan not found" });
  const amount = Number(req.body.amount);
  const repayment = { id: nanoid(8), amount, provider: req.body.provider || "cash", createdAt: new Date().toISOString() };
  loan.repayments ||= [];
  loan.repayments.unshift(repayment);
  loan.balance = Math.max(0, Number(loan.balance ?? loan.amount) - amount);
  if (loan.balance === 0) loan.status = "repaid";
  appendAudit(req.store, req.group.id, "loan_repayment_recorded", { loanId: loan.id, amount, balance: loan.balance });
  await saveStore(req.store);
  res.status(201).json({ loan, repayment });
});

app.post("/api/admin/members", authGroup, requirePermission("members.write"), async (req, res) => {
  const member = {
    id: nanoid(8),
    name: req.body.name,
    phone: req.body.phone,
    identityId: req.body.identityId,
    role: normalizeRole(req.body.role),
    kycStatus: req.body.identityId && req.body.phone ? "pending" : "missing",
    verifiedAt: null
  };
  req.group.members.push(member);
  appendAudit(req.store, req.group.id, "member_created", { memberId: member.id, role: member.role });
  await saveStore(req.store);
  res.status(201).json({ member });
});

app.post("/api/kyc/:memberId/verify", authGroup, requirePermission("kyc.verify"), async (req, res) => {
  const member = req.group.members.find((item) => item.id === req.params.memberId);
  if (!member) return res.status(404).json({ error: "Member not found" });
  member.kycStatus = "verified";
  member.verifiedAt = new Date().toISOString();
  member.identityId = req.body.identityId || member.identityId;
  member.phone = req.body.phone || member.phone;
  appendAudit(req.store, req.group.id, "kyc_verified", { memberId: member.id });
  await saveStore(req.store);
  res.json({ member });
});

app.post("/api/security/biometric/verify", authGroup, requirePermission("reports.read"), async (req, res) => {
  appendAudit(req.store, req.group.id, "biometric_gate_verified", { role: req.session.role, method: req.body.method || "webauthn-demo" });
  await saveStore(req.store);
  res.json({ verified: true, method: "device-biometric-ready" });
});

app.post("/api/admin/rotation/generate", authGroup, requirePermission("*"), async (req, res) => {
  req.group.rotations = generateRotation(req.group);
  for (const turn of req.group.rotations) {
    const member = req.group.members.find((item) => item.id === turn.memberId);
    if (member) req.group.notifications.unshift(createNotification(req.group, member, "whatsapp", `Your tontine payout turn is scheduled for ${turn.scheduledDate}.`));
  }
  appendAudit(req.store, req.group.id, "rotation_generated", { turns: req.group.rotations.length });
  await saveStore(req.store);
  res.status(201).json({ rotations: req.group.rotations });
});

app.post("/api/votes", authGroup, requirePermission("votes.write"), async (req, res) => {
  const vote = {
    id: nanoid(8),
    title: req.body.title,
    description: req.body.description || "",
    status: "open",
    options: ["yes", "no"],
    ballots: [],
    createdAt: new Date().toISOString()
  };
  req.group.votes.unshift(vote);
  appendAudit(req.store, req.group.id, "vote_created", { voteId: vote.id, title: vote.title });
  await saveStore(req.store);
  res.status(201).json({ vote });
});

app.post("/api/votes/:id/cast", authGroup, requirePermission("votes.cast"), async (req, res) => {
  const vote = req.group.votes.find((item) => item.id === req.params.id);
  const member = req.group.members.find((item) => item.id === req.body.memberId);
  if (!vote || !member) return res.status(404).json({ error: "Vote or member not found" });
  vote.ballots = vote.ballots.filter((item) => item.memberId !== member.id);
  vote.ballots.push({ memberId: member.id, memberName: member.name, choice: req.body.choice === "no" ? "no" : "yes", createdAt: new Date().toISOString() });
  appendAudit(req.store, req.group.id, "vote_cast", { voteId: vote.id, memberId: member.id });
  await saveStore(req.store);
  res.json({ vote });
});

app.post("/api/messages", authGroup, requirePermission("collaboration.write"), async (req, res) => {
  const message = {
    id: nanoid(8),
    author: req.body.author || req.session.role,
    body: req.body.body,
    type: req.body.type === "minutes" ? "minutes" : "message",
    createdAt: new Date().toISOString()
  };
  if (message.type === "minutes") req.group.minutes.unshift(message);
  else req.group.messages.unshift(message);
  appendAudit(req.store, req.group.id, "collaboration_posted", { messageId: message.id, type: message.type });
  await saveStore(req.store);
  res.status(201).json({ message });
});

app.post("/api/admin/reminders", authGroup, requirePermission("reminders.write"), async (req, res) => {
  const channel = req.body.channel === "whatsapp" ? "whatsapp" : "sms";
  const reminders = req.group.members.map((member) => createReminder(req.group, member, "manual", channel));
  req.group.reminders.unshift(...reminders);
  for (const reminder of reminders) appendAudit(req.store, req.group.id, "reminder_queued", { reminderId: reminder.id, channel });
  await saveStore(req.store);
  res.status(201).json({ reminders });
});

app.post("/api/admin/settings", authGroup, requirePermission("*"), async (req, res) => {
  req.group.contributionAmount = Number(req.body.contributionAmount || req.group.contributionAmount);
  req.group.lateFeeAmount = Number(req.body.lateFeeAmount || req.group.lateFeeAmount);
  req.group.rules = {
    ...req.group.rules,
    latePenaltyPercent: Number(req.body.latePenaltyPercent || req.group.rules?.latePenaltyPercent || 10),
    lateFeeAmount: Number(req.body.lateFeeAmount || req.group.rules?.lateFeeAmount || req.group.lateFeeAmount),
    loanInterestRate: Number(req.body.loanInterestRate || req.group.rules?.loanInterestRate || 5),
    maxLoanMultiplier: Number(req.body.maxLoanMultiplier || req.group.rules?.maxLoanMultiplier || 3),
    voteApprovalThreshold: Number(req.body.voteApprovalThreshold || req.group.rules?.voteApprovalThreshold || 60),
    rotationIntervalDays: Number(req.body.rotationIntervalDays || req.group.rules?.rotationIntervalDays || 30)
  };
  req.group.nextPaymentDue = req.body.nextPaymentDue || req.group.nextPaymentDue;
  req.group.nextMeetingAt = req.body.nextMeetingAt || req.group.nextMeetingAt;
  req.group.paymentDeadlineDay = req.body.paymentDeadlineDay || req.group.paymentDeadlineDay;
  appendAudit(req.store, req.group.id, "settings_updated", { role: req.session.role });
  await saveStore(req.store);
  res.json({ group: groupView(req.group, req.session.role) });
});

app.post("/api/admin/reconciliation/run", authGroup, requirePermission("reconciliation.run"), async (req, res) => {
  const reconciled = [];
  for (const payment of req.group.transactions) {
    if (payment.status !== "pending-provider-confirmation") continue;
    payment.status = "reconciled";
    payment.reconciledAt = new Date().toISOString();
    const member = req.group.members.find((item) => item.id === payment.memberId);
    const receipt = req.group.receipts.find((item) => item.paymentId === payment.id) || buildReceipt(req.group, payment, member);
    if (!req.group.receipts.some((item) => item.id === receipt.id)) req.group.receipts.unshift(receipt);
    if (member) {
      req.group.notifications.unshift(createNotification(req.group, member, "whatsapp", `Payment reconciled: ${payment.amount} ${req.group.currency}. Receipt ${receipt.id}.`, receipt.id));
    }
    appendAudit(req.store, req.group.id, "payment_reconciled", { paymentId: payment.id, memberId: payment.memberId, balance: memberBalance(req.group, payment.memberId) });
    reconciled.push(payment);
  }
  await saveStore(req.store);
  res.json({ reconciled, balances: req.group.members.map((member) => ({ memberId: member.id, balance: memberBalance(req.group, member.id) })) });
});

app.get("/api/reports/monthly.csv", authGroup, requirePermission("reports.read"), (req, res) => {
  appendAudit(req.store, req.group.id, "monthly_report_generated", { role: req.session.role });
  saveStore(req.store).catch(() => {});
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${req.group.id}-monthly-report.csv"`);
  res.send(monthlyReport(req.group));
});

app.post("/api/webhooks/payment", async (req, res) => {
  const store = await loadStore();
  const group = store.groups.find((item) => item.id === req.body.groupId);
  if (!group) return res.status(404).json({ error: "Tontine not found" });
  const member = group.members.find((item) => item.id === req.body.memberId || item.phone === req.body.phone);
  if (!member) return res.status(400).json({ error: "Member not found" });
  const payment = {
    id: req.body.providerReference || nanoid(10),
    memberId: member.id,
    memberName: member.name,
    amount: Number(req.body.amount),
    provider: req.body.provider || "momo",
    phone: req.body.phone || member.phone,
    status: "reconciled",
    createdAt: new Date().toISOString(),
    reconciledAt: new Date().toISOString()
  };
  const receipt = buildReceipt(group, payment, member);
  group.transactions.unshift(payment);
  group.receipts.unshift(receipt);
  group.notifications.unshift(createNotification(group, member, "whatsapp", `Automatic receipt ${receipt.id}: ${payment.amount} ${group.currency} received.`, receipt.id));
  appendAudit(store, group.id, "webhook_payment_reconciled", { paymentId: payment.id, memberId: member.id, amount: payment.amount });
  await saveStore(store);
  res.status(201).json({ payment, receipt, balance: memberBalance(group, member.id) });
});

app.use(express.static(path.join(rootDir, "dist")));
app.get("*", async (_req, res, next) => {
  try {
    await fs.access(path.join(rootDir, "dist", "index.html"));
    res.sendFile(path.join(rootDir, "dist", "index.html"));
  } catch {
    next();
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Tontine API running on http://0.0.0.0:${PORT}`);
});
