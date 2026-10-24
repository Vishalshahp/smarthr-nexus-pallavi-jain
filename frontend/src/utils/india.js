/**
 * India localisation helpers for SmartHR Nexus
 * Currency (INR, lakh/crore), dates (en-IN, IST), financial year (April–March),
 * Indian leave types, the 2026 holiday calendar (Gujarat) and the demo company.
 */

export const DEVELOPER_NAME = 'Pallavi Jain';

export const COMPANY = {
  name: 'Nexus Infotech Pvt. Ltd.',
  shortName: 'Nexus Infotech',
  address: 'SG Highway, Ahmedabad, Gujarat 380054',
  city: 'Ahmedabad',
  state: 'Gujarat',
  country: 'India',
  phone: '+91 79 4000 0000',
  email: 'hr@nexusinfotech.demo',
  gstin: '24ABCDE1234F1Z5',  // sample format only
  pan: 'ABCDE1234F',         // sample format only
  timezone: 'Asia/Kolkata (IST, UTC+05:30)',
  currency: 'INR (₹)',
  financialYear: 'April – March',
  workWeek: 'Monday – Friday',
};

const TZ = 'Asia/Kolkata';

// ── Money ────────────────────────────────────────────────────────────────────
const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const numFormatter = new Intl.NumberFormat('en-IN');

/** ₹1,23,456 */
export const formatINR = (n) => inrFormatter.format(Math.round(Number(n) || 0));

/** 1,23,456 (Indian digit grouping, no symbol) */
export const formatNumberIN = (n) => numFormatter.format(Number(n) || 0);

/** ₹1.38 Cr · ₹12.5 L · ₹45K · ₹900 */
export const formatINRShort = (n) => {
  const v = Number(n) || 0;
  const a = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (a >= 1e7) return `${sign}₹${+(a / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `${sign}₹${+(a / 1e5).toFixed(1)} L`;
  if (a >= 1e3) return `${sign}₹${+(a / 1e3).toFixed(0)}K`;
  return `${sign}₹${Math.round(a)}`;
};

/** Annual amount as "₹12.5 LPA" (lakhs per annum) */
export const formatLPA = (annual) => `₹${+((Number(annual) || 0) / 1e5).toFixed(1)} LPA`;

// ── Dates & time (IST) ───────────────────────────────────────────────────────
const toDate = (d) => {
  const x = d instanceof Date ? d : new Date(d);
  return isNaN(x.getTime()) ? null : x;
};

/** 09 Oct 2026 */
export const formatDateIN = (d, opts = {}) => {
  const x = toDate(d);
  return x ? x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TZ, ...opts }) : '—';
};

/** 09/10/2026 */
export const formatDateNumericIN = (d) => {
  const x = toDate(d);
  return x ? x.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ }) : '—';
};

/** 9 Oct (short, for lists) */
export const formatDayMonthIN = (d) => {
  const x = toDate(d);
  return x ? x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: TZ }) : '—';
};

/** Friday, 9 October 2026 */
export const formatDateLongIN = (d = new Date()) => {
  const x = toDate(d);
  return x ? x.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }) : '—';
};

/** 09:30 am */
export const formatTimeIN = (d) => {
  const x = toDate(d);
  return x ? x.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TZ }) : '—';
};

/** Month name for a 1-12 month number: "October" */
export const monthNameIN = (m, style = 'long') =>
  new Date(2026, (Number(m) || 1) - 1, 1).toLocaleDateString('en-IN', { month: style });

/** Indian financial year label: "FY 2026-27" (April – March) */
export const financialYearLabel = (d = new Date()) => {
  const x = toDate(d) || new Date();
  const y = x.getMonth() >= 3 ? x.getFullYear() : x.getFullYear() - 1;
  return `FY ${y}-${String((y + 1) % 100).padStart(2, '0')}`;
};

// ── Leaves ───────────────────────────────────────────────────────────────────
export const LEAVE_TYPES = {
  annual: 'Earned Leave (EL)',
  casual: 'Casual Leave (CL)',
  sick: 'Sick Leave (SL)',
  maternity: 'Maternity Leave',
  paternity: 'Paternity Leave',
  unpaid: 'Leave Without Pay (LWP)',
};
export const LEAVE_SHORT = { annual: 'EL', casual: 'CL', sick: 'SL', maternity: 'ML', paternity: 'PL', unpaid: 'LWP' };
export const leaveLabel = (t) => LEAVE_TYPES[t] || (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');

/** Company leave policy (per calendar year) */
export const LEAVE_POLICY = [
  { type: 'annual',    days: 18,  note: '1.5 days credited per month; up to 30 can be carried forward' },
  { type: 'casual',    days: 8,   note: 'For short personal needs; max 3 days at a time' },
  { type: 'sick',      days: 8,   note: 'Medical certificate needed for more than 2 days' },
  { type: 'maternity', days: 182, note: '26 weeks paid leave as per the Code on Social Security, 2020' },
  { type: 'paternity', days: 10,  note: 'Within 3 months of the child’s birth' },
  { type: 'unpaid',    days: 0,   note: 'Leave Without Pay, deducted from salary' },
];

// ── Holidays 2026 (Gujarat public holidays + Diwali) ────────────────────────
export const HOLIDAYS_2026 = [
  { date: '2026-01-14', name: 'Uttarayan (Makar Sankranti)' },
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-04', name: 'Holi (Dhuleti)' },
  { date: '2026-03-19', name: 'Cheti Chand' },
  { date: '2026-03-21', name: 'Id-ul-Fitr (Ramzan Eid)' },
  { date: '2026-03-26', name: 'Ram Navami' },
  { date: '2026-03-31', name: 'Mahavir Jayanti' },
  { date: '2026-04-03', name: 'Good Friday' },
  { date: '2026-04-14', name: 'Dr. B. R. Ambedkar Jayanti' },
  { date: '2026-05-27', name: 'Bakri Id (Id-ul-Zuha)' },
  { date: '2026-06-26', name: 'Muharram' },
  { date: '2026-08-15', name: 'Independence Day / Parsi New Year' },
  { date: '2026-08-26', name: 'Id-e-Milad' },
  { date: '2026-08-28', name: 'Raksha Bandhan' },
  { date: '2026-09-04', name: 'Janmashtami' },
  { date: '2026-09-15', name: 'Samvatsari' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
  { date: '2026-10-20', name: 'Dussehra (Vijaya Dashami)' },
  { date: '2026-10-31', name: 'Sardar Vallabhbhai Patel Jayanti' },
  { date: '2026-11-08', name: 'Diwali' },
  { date: '2026-11-10', name: 'Gujarati New Year (Bestu Varas)' },
  { date: '2026-11-11', name: 'Bhai Beej' },
  { date: '2026-11-24', name: 'Guru Nanak Jayanti' },
  { date: '2026-12-25', name: 'Christmas' },
];

const ymd = (d) => {
  const x = toDate(d) || new Date();
  return x.toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD in IST
};

/** Next `count` holidays from today (inclusive) */
export const upcomingHolidays = (count = 5, from = new Date()) => {
  const today = ymd(from);
  return HOLIDAYS_2026.filter((h) => h.date >= today).slice(0, count);
};

/** Holiday on a given date, or undefined */
export const holidayOn = (d) => HOLIDAYS_2026.find((h) => h.date === ymd(d));

/** Days from today until a YYYY-MM-DD date */
export const daysUntil = (dateStr, from = new Date()) => {
  const a = new Date(`${ymd(from)}T00:00:00`);
  const b = new Date(`${dateStr}T00:00:00`);
  return Math.round((b - a) / 86400000);
};

// ── Statutory payroll rules (for display) ────────────────────────────────────
export const PAYROLL_RULES = {
  regime: 'New tax regime (FY 2026-27)',
  standardDeduction: 75000,
  rebateLimit: 1200000,
  slabs: [
    { upto: 400000, rate: 0 },
    { upto: 800000, rate: 5 },
    { upto: 1200000, rate: 10 },
    { upto: 1600000, rate: 15 },
    { upto: 2000000, rate: 20 },
    { upto: 2400000, rate: 25 },
    { upto: Infinity, rate: 30 },
  ],
  pf: 'Employee 12% of basic (on wages up to ₹15,000) + employer 12%',
  esi: 'Employee 0.75% + employer 3.25% when gross pay is ₹21,000/month or less',
  pt: 'Professional Tax as per state (Gujarat ₹200/month)',
  cess: '4% health & education cess on income tax',
};
