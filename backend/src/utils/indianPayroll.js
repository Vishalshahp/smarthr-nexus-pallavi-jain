/**
 * Indian payroll calculator (monthly)
 *
 * - Salary structure: Basic, HRA (50% of basic in metros, 40% elsewhere), Conveyance,
 *   Medical, Special Allowance (balance)
 * - Provident Fund: employee 12% of basic, on wages up to ₹15,000 (statutory ceiling)
 * - ESI: employee 0.75%, employer 3.25%, only when gross pay is ₹21,000/month or less
 * - Professional Tax: by state
 * - Income tax (TDS): new tax regime FY 2026-27 — slabs 0/5/10/15/20/25/30%,
 *   ₹75,000 standard deduction, no tax up to ₹12 lakh taxable income (rebate) with
 *   marginal relief just above it, plus 4% health & education cess.
 *   (Surcharge for incomes above ₹50 lakh is not modelled.)
 */

const METRO_CITIES = ['Mumbai', 'Delhi', 'New Delhi', 'Kolkata', 'Chennai'];
const STANDARD_DEDUCTION = 75000;
const REBATE_LIMIT = 1200000;
const SLABS = [
  [400000, 0],
  [800000, 0.05],
  [1200000, 0.10],
  [1600000, 0.15],
  [2000000, 0.20],
  [2400000, 0.25],
  [Infinity, 0.30],
];
const PF_WAGE_CEILING = 15000;
const ESI_LIMIT = 21000;

function slabTax(taxable) {
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of SLABS) {
    if (taxable > prev) tax += (Math.min(taxable, limit) - prev) * rate;
    prev = limit;
  }
  return tax;
}

/** Annual income tax (incl. cess) under the new regime for an annual salary */
function annualIncomeTax(annualGross) {
  const taxable = Math.max(0, annualGross - STANDARD_DEDUCTION);
  let tax = slabTax(taxable);
  if (taxable <= REBATE_LIMIT) tax = 0;                 // rebate: no tax up to ₹12 lakh
  else tax = Math.min(tax, taxable - REBATE_LIMIT);     // marginal relief
  return { taxable, tax: Math.round(tax * 1.04) };      // + 4% cess
}

/** Monthly Professional Tax by state (month: 1-12) */
function professionalTax(state, monthlyGross, month) {
  switch (state) {
    case 'Gujarat':     return monthlyGross >= 12000 ? 200 : 0;
    case 'Maharashtra': if (monthlyGross <= 7500) return 0; if (monthlyGross <= 10000) return 175; return month === 2 ? 300 : 200;
    case 'Karnataka':   return monthlyGross >= 25000 ? 200 : 0;
    case 'Telangana':   if (monthlyGross > 20000) return 200; if (monthlyGross > 15000) return 150; return 0;
    case 'Delhi':       return 0;
    default:            return 200;
  }
}

/**
 * Build one month's payslip.
 * @param {{basic:number, allowances:number, city?:string, state?:string, month:number, bonus?:number}} p
 */
function buildPayslip({ basic, allowances, city = 'Ahmedabad', state = 'Gujarat', month, bonus = 0 }) {
  const hra = Math.round(basic * (METRO_CITIES.includes(city) ? 0.5 : 0.4));
  const conveyance = 1600;
  const medical = 1250;
  const special = Math.max(0, allowances - hra - conveyance - medical);
  const fixedGross = basic + hra + conveyance + medical + special;
  const gross = fixedGross + bonus;

  const pf = Math.round(Math.min(basic, PF_WAGE_CEILING) * 0.12);
  const esi = fixedGross <= ESI_LIMIT ? Math.ceil(fixedGross * 0.0075) : 0; // annual bonus is outside ESI wages
  const pt = professionalTax(state, gross, month);
  // TDS: regular monthly share of annual tax, plus the full extra tax caused by a bonus in its month
  const { taxable, tax } = annualIncomeTax(fixedGross * 12);
  const extraOnBonus = bonus > 0 ? annualIncomeTax(fixedGross * 12 + bonus).tax - tax : 0;
  const tds = Math.round(tax / 12) + extraOnBonus;

  const totalDeductions = pf + esi + pt + tds;
  return {
    earnings: {
      basicSalary: basic, houseRentAllowance: hra, conveyanceAllowance: conveyance,
      medicalAllowance: medical, specialAllowance: special, performanceBonus: bonus,
    },
    deductions: { providentFund: pf, employeeStateInsurance: esi, professionalTax: pt, incomeTax: tds },
    grossEarnings: gross,
    totalDeductions,
    netSalary: gross - totalDeductions,
    taxDetails: { taxableIncome: taxable, taxSlab: 'New regime FY 2026-27', tds },
    employerContributions: {
      providentFund: pf,
      employeeStateInsurance: fixedGross <= ESI_LIMIT ? Math.ceil(fixedGross * 0.0325) : 0,
    },
  };
}

/** Annual CTC = 12 x fixed gross + employer PF (+ employer ESI) */
function annualCTC({ basic, allowances, city, state }) {
  const p = buildPayslip({ basic, allowances, city, state, month: 4 });
  return (p.grossEarnings + p.employerContributions.providentFund + p.employerContributions.employeeStateInsurance) * 12;
}

/** Indian financial year label for a date: "FY 2026-27" */
function financialYear(d = new Date()) {
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `FY ${y}-${String((y + 1) % 100).padStart(2, '0')}`;
}

module.exports = { buildPayslip, annualCTC, annualIncomeTax, professionalTax, financialYear, METRO_CITIES };
