/**
 * SmartHR Nexus — Database Seeder
 * Run: node src/utils/seeder.js
 * Run (reset): node src/utils/seeder.js --reset
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const mongoose = require('mongoose');

// ─── Models ──────────────────────────────────────────────────────────────────
const userSchema = require('../models/User.model');

// Inline schemas for seeder (avoids circular deps)
const departmentSchema = new mongoose.Schema({
  name: String, code: String, description: String,
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentDept: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  budget: Number, location: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  employeeType: { type: String, default: 'full_time' },
  workLocation: { type: String, default: 'office' },
  shift: { type: { type: String, default: 'morning' }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '18:00' } },
  probationEndDate: Date, confirmationDate: Date,
  noticePeriod: { type: Number, default: 30 },
  status: { type: String, default: 'active' },
  leaveBalance: { annual: { type: Number, default: 21 }, sick: { type: Number, default: 10 }, casual: { type: Number, default: 7 } },
  payrollDetails: { ctc: Number, inHandSalary: Number, panNumber: String, uanNumber: String, pfNumber: String, esiNumber: String, taxRegime: { type: String, default: 'new' } },
  performanceRating: { type: Number, default: 0 },
  skills: [String],
  goals: [{
    title: String, description: String, targetDate: Date,
    status: { type: String, default: 'in_progress' }, progress: { type: Number, default: 0 },
  }],
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  checkIn: { time: Date, method: String },
  checkOut: { time: Date, method: String },
  totalHours: Number, overtimeHours: { type: Number, default: 0 },
  status: { type: String, default: 'present' },
  workMode: { type: String, default: 'office' },
}, { timestamps: true });

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payPeriod: { month: Number, year: Number, startDate: Date, endDate: Date },
  earnings: { basicSalary: Number, houseRentAllowance: Number, conveyanceAllowance: Number, medicalAllowance: Number, performanceBonus: { type: Number, default: 0 }, specialAllowance: Number },
  deductions: { providentFund: Number, employeeStateInsurance: Number, professionalTax: Number, incomeTax: Number },
  grossEarnings: Number, totalDeductions: Number, netSalary: Number,
  taxDetails: { taxableIncome: Number, taxSlab: String, tds: Number },
  status: { type: String, default: 'paid' },
  paymentDetails: { method: { type: String, default: 'bank_transfer' }, paidAt: Date },
  attendanceSummary: { totalWorkingDays: Number, presentDays: Number, absentDays: Number, leaveDays: Number },
}, { timestamps: true });

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leaveType: String, reason: String,
  startDate: Date, endDate: Date, totalDays: Number,
  status: { type: String, default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date, comments: String,
}, { timestamps: true });

const performanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewCycle: { type: { type: String, default: 'quarterly' }, period: String, startDate: Date, endDate: Date },
  ratings: {
    technical: { score: Number, comments: String },
    communication: { score: Number, comments: String },
    teamwork: { score: Number, comments: String },
    leadership: { score: Number, comments: String },
    productivity: { score: Number, comments: String },
  },
  overallRating: Number,
  strengths: [String], areasOfImprovement: [String],
  managerComments: String, status: { type: String, default: 'completed' },
  aiInsights: { summary: String, recommendations: [String] },
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  title: String, department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  description: String, requirements: [String], skills: [String],
  experience: { min: Number, max: Number },
  salary: { min: Number, max: Number, currency: { type: String, default: 'INR' } },
  location: String, workType: String, workMode: String,
  openings: Number, closingDate: Date,
  status: { type: String, default: 'open' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiScreeningEnabled: { type: Boolean, default: true },
  applicationCount: { type: Number, default: 0 },
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  candidate: { firstName: String, lastName: String, email: String, phone: String, currentPosition: String, currentCompany: String, currentLocation: String, totalExperience: Number, currentSalary: Number, expectedSalary: Number, noticePeriod: Number },
  resumeUrl: String, stage: String,
  aiScreening: { score: Number, summary: String, strengths: [String], weaknesses: [String], recommendation: String, processedAt: Date },
  source: String,
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, message: String, type: String,
  read: { type: Boolean, default: false },
  link: String,
}, { timestamps: true });

// ─── Register models ──────────────────────────────────────────────────────────
const Department  = mongoose.model('Department',       departmentSchema);
const Employee    = mongoose.model('Employee',         employeeSchema);
const Attendance  = mongoose.model('Attendance',       attendanceSchema);
const Payroll     = mongoose.model('Payroll',          payrollSchema);
const Leave       = mongoose.model('Leave',            leaveSchema);
const Performance = mongoose.model('PerformanceReview',performanceSchema);
const Job         = mongoose.model('Job',              jobSchema);
const Application = mongoose.model('Application',     applicationSchema);
const Notification= mongoose.model('Notification',    notificationSchema);
const User        = mongoose.model('User');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const dateOffset = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
const monthStart = (y, m) => new Date(y, m - 1, 1);
const monthEnd   = (y, m) => new Date(y, m, 0);

// ─── Seed Data Definitions (India) ────────────────────────────────────────────
// Demo company: Nexus Infotech Pvt. Ltd., Ahmedabad (Gujarat). Amounts in INR.
const { buildPayslip, annualCTC } = require('./indianPayroll');

const DEPARTMENTS_DATA = [
  { name: 'Engineering',      code: 'ENG',  description: 'Software development and architecture',        budget: 25000000, location: 'Ahmedabad HQ – 3rd Floor' },
  { name: 'Human Resources',  code: 'HR',   description: 'Talent acquisition and employee relations',    budget: 4000000,  location: 'Ahmedabad HQ – 1st Floor' },
  { name: 'Sales',            code: 'SLS',  description: 'Business development and revenue growth',      budget: 12000000, location: 'Mumbai Office' },
  { name: 'Marketing',        code: 'MKT',  description: 'Brand, campaigns and growth marketing',        budget: 8000000,  location: 'Ahmedabad HQ – 2nd Floor' },
  { name: 'Finance',          code: 'FIN',  description: 'Accounts, GST, TDS and financial planning',    budget: 5000000,  location: 'Ahmedabad HQ – 4th Floor' },
  { name: 'Product',          code: 'PRD',  description: 'Product management and roadmap',               budget: 6000000,  location: 'Hyderabad Office' },
  { name: 'Design',           code: 'DSN',  description: 'UX/UI and brand design',                       budget: 3500000,  location: 'Pune Office' },
  { name: 'Operations',       code: 'OPS',  description: 'Business operations, admin and facilities',    budget: 4500000,  location: 'Ahmedabad HQ – 1st Floor' },
];

const SKILLS_POOL = {
  Engineering: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'Docker', 'TypeScript', 'GraphQL', 'Redis', 'Kubernetes'],
  'Human Resources': ['Recruitment', 'HRMS', 'Employee Relations', 'Payroll', 'Labour Codes', 'PF & ESI Compliance', 'Training'],
  Sales:       ['CRM', 'Negotiation', 'B2B Sales', 'Pipeline Management', 'Key Accounts', 'Channel Partners'],
  Marketing:   ['SEO', 'Google Ads', 'Content Strategy', 'Social Media', 'Instagram Reels', 'Analytics', 'Copywriting'],
  Finance:     ['Excel', 'Tally Prime', 'GST Returns', 'TDS', 'Financial Modelling', 'Ind AS', 'Auditing'],
  Product:     ['Agile', 'Jira', 'Roadmapping', 'User Research', 'Figma', 'OKRs', 'A/B Testing'],
  Design:      ['Figma', 'Adobe XD', 'Illustrator', 'Prototyping', 'User Research', 'Motion Design'],
  Operations:  ['Process Improvement', 'Vendor Management', 'Facilities', 'Project Management', 'Six Sigma'],
};

// Indian public holidays 2026 (Gujarat) — no attendance is marked on these days
const HOLIDAYS_2026 = [
  ['2026-01-14', 'Uttarayan (Makar Sankranti)'], ['2026-01-26', 'Republic Day'], ['2026-03-04', 'Holi (Dhuleti)'],
  ['2026-03-19', 'Cheti Chand'], ['2026-03-21', 'Id-ul-Fitr'], ['2026-03-26', 'Ram Navami'], ['2026-03-31', 'Mahavir Jayanti'],
  ['2026-04-03', 'Good Friday'], ['2026-04-14', 'Dr. B. R. Ambedkar Jayanti'], ['2026-05-27', 'Bakri Id'], ['2026-06-26', 'Muharram'],
  ['2026-08-15', 'Independence Day'], ['2026-08-26', 'Id-e-Milad'], ['2026-08-28', 'Raksha Bandhan'], ['2026-09-04', 'Janmashtami'],
  ['2026-09-15', 'Samvatsari'], ['2026-10-02', 'Gandhi Jayanti'], ['2026-10-20', 'Dussehra'], ['2026-10-31', 'Sardar Patel Jayanti'],
  ['2026-11-08', 'Diwali'], ['2026-11-10', 'Gujarati New Year'], ['2026-11-11', 'Bhai Beej'], ['2026-11-24', 'Guru Nanak Jayanti'],
  ['2026-12-25', 'Christmas'],
];
const HOLIDAY_SET = new Set(HOLIDAYS_2026.map(([d]) => d));
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ─── Main Seeder ─────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 SmartHR Nexus — Database Seeder (India)\n' + '─'.repeat(50));

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthr_nexus');
  console.log('✅ Connected to MongoDB');

  // Reset if requested
  if (process.argv.includes('--reset')) {
    console.log('🗑️  Dropping all collections...');
    await Promise.all([
      User.deleteMany({}), Department.deleteMany({}), Employee.deleteMany({}),
      Attendance.deleteMany({}), Payroll.deleteMany({}), Leave.deleteMany({}),
      Performance.deleteMany({}), Job.deleteMany({}), Application.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✅ Collections cleared\n');
  }

  // ── 1. Departments ──────────────────────────────────────────────────────────
  console.log('📁 Seeding departments...');
  const departments = await Department.insertMany(DEPARTMENTS_DATA);
  const deptMap = {};
  departments.forEach((d) => { deptMap[d.code] = d._id; });
  console.log(`   ✅ ${departments.length} departments created`);

  // ── 2. Users ────────────────────────────────────────────────────────────────
  console.log('👥 Seeding users...');

  // [firstName, lastName, email, password, role, dept, position, city, state, PIN, monthly gross, joined]
  const PEOPLE = [
    ['Pallavi', 'Jain',     'admin@demo.com',    'Admin@1234',    'admin',          'HR',  'HR Director',          'Ahmedabad', 'Gujarat',     '380054', 150000, '2021-01-15'],
    ['Rohan',  'Mehta',    'manager@demo.com',  'Manager@1234',  'senior_manager', 'ENG', 'Engineering Manager',  'Bengaluru', 'Karnataka',   '560103', 200000, '2020-06-01'],
    ['Priya',  'Sharma',   'hr@demo.com',       'HR@12345',      'hr_recruiter',   'HR',  'HR Recruiter',         'Ahmedabad', 'Gujarat',     '380015', 50000,  '2022-03-10'],
    ['Aarav',  'Shah',     'employee@demo.com', 'Employee@1234', 'employee',       'ENG', 'Frontend Developer',   'Ahmedabad', 'Gujarat',     '380009', 70000,  '2023-07-20'],
    ['Ananya', 'Iyer',     'ananya.iyer@demo.com',     'Pass@1234', 'employee', 'ENG', 'Senior Developer',      'Bengaluru', 'Karnataka',   '560034', 140000, '2021-08-12'],
    ['Vikram', 'Singh',    'vikram.singh@demo.com',    'Pass@1234', 'employee', 'SLS', 'Sales Executive',       'Mumbai',    'Maharashtra', '400069', 45000,  '2022-01-05'],
    ['Sneha',  'Desai',    'sneha.desai@demo.com',     'Pass@1234', 'employee', 'MKT', 'Marketing Specialist',  'Ahmedabad', 'Gujarat',     '380006', 55000,  '2022-05-20'],
    ['Karan',  'Joshi',    'karan.joshi@demo.com',     'Pass@1234', 'employee', 'FIN', 'Financial Analyst',     'Ahmedabad', 'Gujarat',     '380013', 75000,  '2021-11-15'],
    ['Diya',   'Reddy',    'diya.reddy@demo.com',      'Pass@1234', 'employee', 'PRD', 'Product Manager',       'Hyderabad', 'Telangana',   '500081', 160000, '2020-09-08'],
    ['Arjun',  'Nair',     'arjun.nair@demo.com',      'Pass@1234', 'employee', 'DSN', 'UI/UX Designer',        'Pune',      'Maharashtra', '411057', 80000,  '2023-01-16'],
    ['Kavya',  'Pillai',   'kavya.pillai@demo.com',    'Pass@1234', 'employee', 'ENG', 'Backend Developer',     'Bengaluru', 'Karnataka',   '560037', 110000, '2022-07-04'],
    ['Harsh',  'Trivedi',  'harsh.trivedi@demo.com',   'Pass@1234', 'employee', 'OPS', 'Operations Manager',    'Ahmedabad', 'Gujarat',     '380051', 120000, '2019-12-02'],
    ['Meera',  'Kapoor',   'meera.kapoor@demo.com',    'Pass@1234', 'employee', 'SLS', 'Sales Manager',         'Mumbai',    'Maharashtra', '400051', 130000, '2020-04-15'],
    ['Aditya', 'Kulkarni', 'aditya.kulkarni@demo.com', 'Pass@1234', 'employee', 'ENG', 'DevOps Engineer',       'Pune',      'Maharashtra', '411014', 125000, '2021-03-22'],
    ['Riya',   'Bhatt',    'riya.bhatt@demo.com',      'Pass@1234', 'employee', 'MKT', 'Content Strategist',    'Ahmedabad', 'Gujarat',     '380052', 40000,  '2023-04-10'],
    ['Ramesh', 'Parmar',   'ramesh.parmar@demo.com',   'Pass@1234', 'employee', 'OPS', 'Office Assistant',      'Ahmedabad', 'Gujarat',     '380004', 18000,  '2024-02-01'],
  ];
  const BANKS = [['HDFC Bank', 'HDFC0001234'], ['State Bank of India', 'SBIN0001234'], ['ICICI Bank', 'ICIC0001234'], ['Axis Bank', 'UTIB0001234'], ['Kotak Mahindra Bank', 'KKBK0001234']];

  const usersData = PEOPLE.map(([firstName, lastName, email, password, role, dept, position, city, state, pin, gross, joined], i) => {
    const n = String(i + 1).padStart(2, '0');
    const [bankName, ifscCode] = BANKS[i % BANKS.length];
    return {
      firstName, lastName, email, password, role, department: deptMap[dept], position,
      phone: `+91 90000 000${n}`, employeeId: `EMP000${n}`, isActive: true, isEmailVerified: true,
      dateOfJoining: new Date(joined),
      // Labour-code friendly structure: basic = 50% of gross, rest as allowances
      salary: { basic: gross / 2, allowances: gross / 2, currency: 'INR' },
      address: { city, state, country: 'India', zipCode: pin },
      bankDetails: { bankName, ifscCode, accountHolderName: `${firstName} ${lastName}`, accountNumber: `50100000000${n}` },
      emergencyContact: { name: 'Family contact', relationship: 'Parent', phone: `+91 90000 100${n}` },
    };
  });

  const users = await User.create(usersData);
  console.log(`   ✅ ${users.length} users created`);

  const userMap = {};
  users.forEach((u) => { userMap[u.email] = u; });

  // Set dept heads
  await Department.findByIdAndUpdate(deptMap['HR'],  { head: userMap['admin@demo.com']._id });
  await Department.findByIdAndUpdate(deptMap['ENG'], { head: userMap['manager@demo.com']._id });
  await Department.findByIdAndUpdate(deptMap['SLS'], { head: userMap['meera.kapoor@demo.com']._id });
  await Department.findByIdAndUpdate(deptMap['OPS'], { head: userMap['harsh.trivedi@demo.com']._id });
  await Department.findByIdAndUpdate(deptMap['PRD'], { head: userMap['diya.reddy@demo.com']._id });

  // Set reporting managers
  const engUsers = users.filter(u => u.department?.toString() === deptMap['ENG'].toString());
  for (const u of engUsers) {
    if (u.email !== 'manager@demo.com') {
      await User.findByIdAndUpdate(u._id, { reportingManager: userMap['manager@demo.com']._id });
    }
  }

  // ── 3. Employee Profiles ────────────────────────────────────────────────────
  console.log('🪪  Seeding employee profiles...');
  const deptNameMap = {};
  departments.forEach((d) => { deptNameMap[d._id.toString()] = d.name; });

  const empProfiles = users.map((u, i) => {
    const n = String(i + 1).padStart(2, '0');
    const deptName = deptNameMap[u.department?.toString()] || 'Engineering';
    const skills   = SKILLS_POOL[deptName] || SKILLS_POOL['Engineering'];
    const sal      = { basic: u.salary.basic, allowances: u.salary.allowances, city: u.address?.city, state: u.address?.state };
    const ctc      = annualCTC(sal);
    const slip     = buildPayslip({ ...sal, month: 10 });
    return {
      user: u._id,
      employeeType: rand(['full_time', 'full_time', 'full_time', 'contract']),
      workLocation: rand(['office', 'office', 'hybrid', 'remote']),
      status: 'active',
      performanceRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      skills: skills.slice(0, randInt(3, 6)),
      payrollDetails: {
        ctc, inHandSalary: slip.netSalary, taxRegime: 'new',
        panNumber: `ABCDE00${n}F`, uanNumber: `1000000000${n}`, pfNumber: `GJAHD00123450000000${n}`,
        esiNumber: slip.deductions.employeeStateInsurance > 0 ? `33000000000000${n}` : undefined,
      },
      leaveBalance: { annual: randInt(8, 18), sick: randInt(4, 8), casual: randInt(3, 8) },
      confirmationDate: new Date(u.dateOfJoining.getTime() + 180 * 86400000),
      goals: [
        { title: 'Complete Q3 FY 2026-27 OKRs', description: 'Hit all quarterly targets',            targetDate: dateOffset(30), status: 'in_progress', progress: randInt(40, 90) },
        { title: 'Skill certification',         description: 'Complete an online certification',      targetDate: dateOffset(60), status: 'in_progress', progress: randInt(20, 60) },
        { title: 'Team knowledge sharing',      description: 'Conduct 2 internal knowledge sessions', targetDate: dateOffset(90), status: 'pending',     progress: randInt(0, 30) },
      ],
    };
  });
  await Employee.insertMany(empProfiles);
  console.log(`   ✅ ${empProfiles.length} employee profiles created`);

  // ── 4. Attendance (last 60 days, IST office hours 9:30–18:30) ───────────────
  console.log('🕐 Seeding attendance records...');
  const attendanceRecords = [];
  const today = new Date(); today.setHours(0,0,0,0);

  for (const user of users) {
    for (let d = 59; d >= 0; d--) {
      const date = new Date(today); date.setDate(today.getDate() - d);
      const day  = date.getDay();
      if (day === 0 || day === 6) continue;          // weekends
      if (HOLIDAY_SET.has(ymd(date))) {               // public holidays
        attendanceRecords.push({ employee: user._id, date, totalHours: 0, status: 'holiday', workMode: 'office' });
        continue;
      }

      const rand100 = Math.random();
      let status, checkIn, checkOut, totalHours;

      if (rand100 < 0.04) {
        status = 'absent'; checkIn = null; checkOut = null; totalHours = 0;
      } else if (rand100 < 0.08) {
        status = 'on_leave'; checkIn = null; checkOut = null; totalHours = 0;
      } else {
        const isLate = Math.random() < 0.1;
        const ciHour = isLate ? randInt(9, 11) : 9;
        const ciMin  = isLate ? (ciHour === 9 ? randInt(45, 59) : randInt(0, 59)) : randInt(15, 44);
        const ciTime = new Date(date); ciTime.setHours(ciHour, ciMin, 0);
        const coHour = randInt(18, 20);
        const coMin  = randInt(0, 59);
        const coTime = new Date(date); coTime.setHours(coHour, coMin, 0);
        totalHours = parseFloat(((coTime - ciTime) / 3600000).toFixed(2));
        status  = isLate ? 'late' : 'present';
        checkIn = { time: ciTime, method: rand(['biometric', 'biometric', 'manual', 'qr']) };
        checkOut= { time: coTime, method: checkIn.method };
      }

      attendanceRecords.push({
        employee: user._id, date,
        ...(checkIn ? { checkIn, checkOut } : {}),
        totalHours, status,
        workMode: rand(['office','office','office','hybrid','remote']),
      });
    }
  }
  await Attendance.insertMany(attendanceRecords);
  console.log(`   ✅ ${attendanceRecords.length} attendance records created`);

  // ── 5. Payroll (last 6 months, Indian statutory deductions) ─────────────────
  console.log('💰 Seeding payroll records...');
  const payrollRecords = [];
  const now = new Date();

  for (const user of users) {
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const month = d.getMonth() + 1;
      const year  = d.getFullYear();
      const bonus = month === 10 ? Math.round(user.salary.basic * 0.5) : 0;   // Diwali bonus in October
      const slip  = buildPayslip({
        basic: user.salary.basic, allowances: user.salary.allowances,
        city: user.address?.city, state: user.address?.state, month, bonus,
      });

      payrollRecords.push({
        employee: user._id,
        payPeriod: { month, year, startDate: monthStart(year, month), endDate: monthEnd(year, month) },
        earnings: slip.earnings,
        deductions: slip.deductions,
        grossEarnings: slip.grossEarnings, totalDeductions: slip.totalDeductions, netSalary: slip.netSalary,
        taxDetails: slip.taxDetails,
        status: m === 0 ? 'processed' : 'paid',
        paymentDetails: { method: 'bank_transfer', paidAt: monthEnd(year, month) },
        attendanceSummary: { totalWorkingDays: 22, presentDays: randInt(19, 22), absentDays: randInt(0, 2), leaveDays: randInt(0, 1) },
      });
    }
  }
  await Payroll.insertMany(payrollRecords);
  console.log(`   ✅ ${payrollRecords.length} payroll records created`);

  // ── 6. Leaves ────────────────────────────────────────────────────────────────
  console.log('🏖️  Seeding leave records...');
  const leaveTypes = ['annual', 'sick', 'casual', 'annual', 'casual'];
  const leaveReasons = [
    'Family function in native place', 'Doctor appointment', 'Personal work', 'Cousin’s wedding',
    'Viral fever', 'Diwali vacation with family', 'Navratri celebrations', 'House shifting',
    'Child’s school annual function', 'Travel to hometown',
  ];
  const leaveRecords = [];

  for (const user of users) {
    const count = randInt(2, 5);
    for (let i = 0; i < count; i++) {
      const offset = randInt(-60, 30);
      const start  = dateOffset(offset);
      const days   = randInt(1, 4);
      const end    = new Date(start); end.setDate(start.getDate() + days - 1);
      const status = offset < -5 ? rand(['approved','approved','rejected']) : offset > 5 ? 'pending' : 'approved';

      leaveRecords.push({
        employee: user._id,
        leaveType: rand(leaveTypes),
        reason: rand(leaveReasons),
        startDate: start, endDate: end, totalDays: days,
        status,
        approvedBy: status !== 'pending' ? userMap['admin@demo.com']._id : undefined,
        approvedAt: status !== 'pending' ? new Date() : undefined,
        comments: status === 'rejected' ? 'Project release that week — please reschedule' : status === 'approved' ? 'Approved. Enjoy your time off!' : undefined,
      });
    }
  }
  await Leave.insertMany(leaveRecords);
  console.log(`   ✅ ${leaveRecords.length} leave records created`);

  // ── 7. Performance Reviews (Indian financial-year quarters) ─────────────────
  console.log('🎯 Seeding performance reviews...');
  const reviewPeriods = [
    { period: 'Q4 FY 2025-26', start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) },
    { period: 'Q1 FY 2026-27', start: new Date(2026, 3, 1), end: new Date(2026, 5, 30) },
    { period: 'Q2 FY 2026-27', start: new Date(2026, 6, 1), end: new Date(2026, 8, 30) },
  ];
  const perfRecords = [];

  for (const user of users.filter(u => u.role === 'employee')) {
    for (const { period, start, end } of reviewPeriods) {
      const qtr = period.split(' ')[0];
      const scores = {
        technical:     { score: randInt(3, 5), comments: rand(['Excellent technical skills', 'Good progress', 'Meets expectations', 'Outstanding performance']) },
        communication: { score: randInt(3, 5), comments: rand(['Clear communicator', 'Room for improvement', 'Very articulate', 'Effective in meetings']) },
        teamwork:      { score: randInt(3, 5), comments: rand(['Great team player', 'Collaborative', 'Helps others proactively', 'Could engage more']) },
        leadership:    { score: randInt(2, 5), comments: rand(['Shows leadership potential', 'Leads by example', 'Taking more ownership', 'Early stage']) },
        productivity:  { score: randInt(3, 5), comments: rand(['Consistently delivers on time', 'High output', 'Meets deadlines', 'Exceeds targets']) },
      };
      const avg = parseFloat((Object.values(scores).reduce((s, v) => s + v.score, 0) / 5).toFixed(1));

      perfRecords.push({
        employee: user._id,
        reviewer: userMap['manager@demo.com']._id,
        reviewCycle: { type: 'quarterly', period, startDate: start, endDate: end },
        ratings: scores,
        overallRating: avg,
        strengths: [rand(['Problem solving', 'Initiative', 'Technical depth', 'Communication', 'Reliability'])],
        areasOfImprovement: [rand(['Documentation', 'Time management', 'Cross-team collaboration', 'Public speaking'])],
        managerComments: `${user.firstName} has shown consistent performance in ${qtr}. Keep up the great work.`,
        status: 'completed',
        aiInsights: {
          summary: `${user.firstName} shows ${avg >= 4.5 ? 'exceptional' : avg >= 4 ? 'strong' : 'solid'} performance with an overall rating of ${avg}/5.`,
          recommendations: [
            avg < 4 ? 'Consider enrolling in skill enhancement programmes' : 'On track for promotion in the next appraisal cycle',
            'Regular 1:1 sessions recommended for continued growth',
          ],
        },
      });
    }
  }
  await Performance.insertMany(perfRecords);
  console.log(`   ✅ ${perfRecords.length} performance reviews created`);

  // ── 8. Jobs (salary = annual CTC in INR) ────────────────────────────────────
  console.log('💼 Seeding job listings...');
  const jobsData = [
    {
      title: 'Senior Full Stack Developer', department: deptMap['ENG'],
      description: 'We are looking for an experienced MERN developer to join our engineering team in Ahmedabad.',
      requirements: ['5+ years experience', 'React & Node.js expertise', 'MongoDB experience', 'AWS knowledge'],
      skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
      experience: { min: 5, max: 9 }, salary: { min: 1800000, max: 2800000, currency: 'INR' },
      location: 'Ahmedabad (Hybrid)', workType: 'full_time', workMode: 'hybrid',
      openings: 2, closingDate: dateOffset(30), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 14,
    },
    {
      title: 'Product Manager', department: deptMap['PRD'],
      description: 'Lead product strategy and roadmap for our HR and payroll platform for Indian SMEs.',
      requirements: ['3+ years in product management', 'Agile experience', 'Strong analytical skills'],
      skills: ['Agile', 'Jira', 'Roadmapping', 'User Research', 'OKRs'],
      experience: { min: 3, max: 7 }, salary: { min: 2000000, max: 3200000, currency: 'INR' },
      location: 'Hyderabad', workType: 'full_time', workMode: 'office',
      openings: 1, closingDate: dateOffset(21), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 9,
    },
    {
      title: 'HR Executive – Payroll & Compliance', department: deptMap['HR'],
      description: 'Handle payroll, PF/ESI filings and employee onboarding.',
      requirements: ['2+ years HR experience', 'Knowledge of Indian labour codes', 'PF, ESI and Professional Tax compliance'],
      skills: ['HRMS', 'Payroll', 'PF & ESI Compliance', 'Labour Codes'],
      experience: { min: 2, max: 5 }, salary: { min: 400000, max: 600000, currency: 'INR' },
      location: 'Ahmedabad', workType: 'full_time', workMode: 'office',
      openings: 1, closingDate: dateOffset(15), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 22,
    },
    {
      title: 'Business Development Executive', department: deptMap['SLS'],
      description: 'Drive B2B sales and build the pipeline across Maharashtra and Gujarat.',
      requirements: ['1+ year in B2B sales', 'Strong communication in English, Hindi and Gujarati/Marathi', 'CRM experience'],
      skills: ['CRM', 'B2B Sales', 'Pipeline Management', 'Negotiation'],
      experience: { min: 1, max: 3 }, salary: { min: 350000, max: 550000, currency: 'INR' },
      location: 'Mumbai', workType: 'full_time', workMode: 'hybrid',
      openings: 3, closingDate: dateOffset(45), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 31,
    },
    {
      title: 'DevOps Engineer', department: deptMap['ENG'],
      description: 'Own and scale our cloud infrastructure and CI/CD pipelines.',
      requirements: ['4+ years DevOps', 'Kubernetes & Docker', 'AWS/GCP expertise', 'Strong scripting skills'],
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
      experience: { min: 4, max: 8 }, salary: { min: 1600000, max: 2600000, currency: 'INR' },
      location: 'Pune / Remote (India)', workType: 'full_time', workMode: 'remote',
      openings: 1, closingDate: dateOffset(60), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 7,
    },
    {
      title: 'UI/UX Designer', department: deptMap['DSN'],
      description: 'Create user-centric designs for our web and mobile products.',
      requirements: ['3+ years UI/UX', 'Figma proficiency', 'Portfolio required'],
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      experience: { min: 3, max: 6 }, salary: { min: 900000, max: 1500000, currency: 'INR' },
      location: 'Pune', workType: 'full_time', workMode: 'hybrid',
      openings: 1, closingDate: dateOffset(0), status: 'closed',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: false, applicationCount: 18,
    },
  ];
  const jobs = await Job.insertMany(jobsData);
  console.log(`   ✅ ${jobs.length} jobs created`);

  // ── 9. Applications ──────────────────────────────────────────────────────────
  console.log('📋 Seeding job applications...');
  const firstNames = ['Nikhil','Pooja','Rahul','Siddharth','Farhan','Ishita','Varun','Neha','Kunal','Shruti','Manish','Tanvi','Yash','Anjali','Deepak','Krupa'];
  const lastNames  = ['Rao','Menon','Verma','Jain','Qureshi','Banerjee','Malhotra','Agarwal','Chauhan','Pandya','Gupta','Kulkarni','Thakkar','Mishra','Naidu','Vyas'];
  const companies  = ['TCS','Infosys','Wipro','HCLTech','Tech Mahindra','Zoho','Freshworks','Flipkart','LTIMindtree','Cognizant'];
  const locations  = ['Ahmedabad','Bengaluru','Pune','Hyderabad','Mumbai','Chennai','Noida','Vadodara','Surat','Gandhinagar'];
  const positions  = ['Software Engineer','Developer','Analyst','Manager','Specialist','Consultant','Lead','Associate'];
  const sources    = ['naukri','linkedin','referral','portal','agency'];

  const appRecords = [];
  for (const job of jobs.slice(0, 5)) {
    const count = randInt(6, 12);
    for (let i = 0; i < count; i++) {
      const score = randInt(42, 97);
      const rec   = score >= 80 ? 'strong_yes' : score >= 65 ? 'yes' : score >= 50 ? 'maybe' : 'no';
      const stage = score >= 80
        ? rand(['shortlisted','hr_interview','technical_interview','offer_sent','hired'])
        : score >= 65
        ? rand(['shortlisted','hr_interview','rejected'])
        : rand(['ai_screening','applied','rejected']);
      const currentSalary = Math.round(randInt(job.salary.min * 0.6, job.salary.max * 0.85) / 10000) * 10000;

      appRecords.push({
        job: job._id,
        candidate: {
          firstName: rand(firstNames), lastName: rand(lastNames),
          email: `candidate${appRecords.length + 1}@email.com`,
          phone: `+91 90000 2${String(randInt(1000, 9999))}`,
          currentPosition: rand(positions),
          currentCompany: rand(companies),
          currentLocation: rand(locations),
          totalExperience: randInt(1, 10),
          currentSalary,
          expectedSalary: Math.round(currentSalary * (1 + randInt(15, 40) / 100) / 10000) * 10000,
          noticePeriod: rand([15, 30, 30, 60, 60, 90]),
        },
        resumeUrl: 'uploads/resumes/sample-resume.pdf',
        stage,
        source: rand(sources),
        aiScreening: {
          score,
          summary: `Candidate demonstrates ${score >= 80 ? 'excellent' : score >= 65 ? 'good' : 'partial'} alignment with the ${job.title} role. ${score >= 80 ? 'Strong technical background with relevant project experience.' : score >= 65 ? 'Meets core requirements with some gaps in desired skills.' : 'Limited experience in key required areas.'}`,
          strengths: rand([['Strong communication','Relevant tech stack','Good portfolio'],['Leadership experience','Problem-solving skills','Team collaboration'],['Fast learner','Attention to detail','Industry knowledge']]),
          weaknesses: rand([['Limited cloud experience'],['No management experience'],['Long notice period']]),
          recommendation: rec,
          processedAt: new Date(),
        },
      });
    }
  }
  await Application.insertMany(appRecords);
  console.log(`   ✅ ${appRecords.length} applications created`);

  // ── 10. Notifications ────────────────────────────────────────────────────────
  console.log('🔔 Seeding notifications...');
  const notifData = [];
  const monthName = now.toLocaleString('en-IN', { month: 'long' });
  for (const user of users) {
    notifData.push(
      { user: user._id, title: 'Welcome!',           message: `Welcome to SmartHR Nexus, ${user.firstName}! Your account is ready.`, type: 'system',      read: true  },
      { user: user._id, title: 'Payslip Ready',      message: `Your payslip for ${monthName} is available (includes Diwali bonus).`,  type: 'payroll',     read: false },
      { user: user._id, title: 'Holiday',            message: 'Office closed for Dussehra on 20 October and Diwali week from 8–11 November.', type: 'system', read: false },
      { user: user._id, title: 'Performance Review', message: 'Your Q2 FY 2026-27 performance review has been submitted.',           type: 'performance', read: false },
    );
    if (user.role === 'admin') {
      notifData.push({ user: user._id, title: 'New Applications', message: '14 new applications received for Senior Full Stack Developer.', type: 'recruitment', read: false });
      notifData.push({ user: user._id, title: 'Compliance Due',   message: 'PF and ESI challans for this month are due by the 15th.',             type: 'payroll',     read: false });
    }
    if (user.role === 'senior_manager') {
      notifData.push({ user: user._id, title: 'Leave Requests',   message: '3 leave requests pending your approval.',                         type: 'leave',       read: false });
    }
    if (user.role === 'hr_recruiter') {
      notifData.push({ user: user._id, title: 'AI Screening Done', message: '9 resumes auto-screened for Product Manager role.',              type: 'recruitment', read: false });
    }
  }
  await Notification.insertMany(notifData);
  console.log(`   ✅ ${notifData.length} notifications created`);

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log('🎉 Seeding complete!\n');
  console.log('📊 Database Summary:');
  console.log(`   Departments:       ${departments.length}`);
  console.log(`   Users:             ${users.length}`);
  console.log(`   Employee Profiles: ${empProfiles.length}`);
  console.log(`   Attendance:        ${attendanceRecords.length}`);
  console.log(`   Payroll Records:   ${payrollRecords.length}`);
  console.log(`   Leave Records:     ${leaveRecords.length}`);
  console.log(`   Perf Reviews:      ${perfRecords.length}`);
  console.log(`   Jobs:              ${jobs.length}`);
  console.log(`   Applications:      ${appRecords.length}`);
  console.log(`   Notifications:     ${notifData.length}`);
  console.log('\n🔑 Demo Login Credentials:');
  console.log('   Admin (Pallavi Jain)         admin@demo.com      Admin@1234');
  console.log('   Senior Manager (Rohan Mehta) manager@demo.com    Manager@1234');
  console.log('   HR Recruiter (Priya Sharma)  hr@demo.com         HR@12345');
  console.log('   Employee (Aarav Shah)        employee@demo.com   Employee@1234\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeder failed:', err.message);
  process.exit(1);
});
