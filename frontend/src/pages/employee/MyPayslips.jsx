import { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Download, Eye, TrendingUp, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { formatINR, formatINRShort, formatLPA, financialYearLabel, monthNameIN, COMPANY } from '@/utils/india';

// Demo employee (sample masked identifiers only)
const EMPLOYEE = { name:'Aarav Shah', id:'EMP00004', designation:'Frontend Developer', pan:'ABCDE••••F', uan:'1000 0000 0004' };

// Monthly salary structure for Aarav Shah — gross ₹70,000 (FY 2026-27, new tax regime)
// Earnings: Basic, HRA, Conveyance, Medical, Special (+ Bonus if any)
// Deductions: PF (12% of ₹15,000 wage ceiling), ESI (nil — gross above ₹21,000), Professional Tax (Gujarat ₹200), TDS (nil — taxable income under ₹12 lakh, Sec 87A rebate)
const STRUCTURE = { basic:35000, hra:14000, conv:1600, med:1250, special:18150, bonus:0, pf:1800, esi:0, pt:200, tds:0 };
const EMPLOYER_PF = 1800;
const makeSlip = (year, month, status) => {
  const x = STRUCTURE;
  const gross = x.basic + x.hra + x.conv + x.med + x.special + x.bonus;
  const deductions = x.pf + x.esi + x.pt + x.tds;
  return { ...x, year, monthNum: month, month: `${monthNameIN(month)} ${year}`, gross, deductions, net: gross - deductions, status };
};

const PAYSLIPS = [
  makeSlip(2026, 9, 'processed'),
  makeSlip(2026, 8, 'paid'),
  makeSlip(2026, 7, 'paid'),
  makeSlip(2026, 6, 'paid'),
  makeSlip(2026, 5, 'paid'),
  makeSlip(2026, 4, 'paid'),
];

const MONTHLY_GROSS = PAYSLIPS[0].gross;                       // ₹70,000
const ANNUAL_CTC    = (MONTHLY_GROSS + EMPLOYER_PF) * 12;      // ₹8,61,600 ≈ ₹8.6 LPA
const FY_LABEL      = financialYearLabel(new Date(PAYSLIPS[0].year, PAYSLIPS[0].monthNum - 1, 1));
const TDS_YTD       = PAYSLIPS.reduce((s, p) => s + p.tds, 0);

const CHART_DATA = PAYSLIPS.slice().reverse().map(p => ({ month: monthNameIN(p.monthNum, 'short'), gross: p.gross, net: p.net }));
const fmt = n => formatINR(n);

export default function MyPayslips() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
        <h1 className="font-display text-2xl font-bold text-white">My Payslips</h1>
        <p className="text-slate-400 text-sm mt-0.5">Salary history and payment details · {FY_LABEL} · New tax regime</p>
      </motion.div>

      {/* CTC summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Monthly Gross',     value:fmt(MONTHLY_GROSS),   color:'text-primary-400', bg:'bg-primary-500/10' },
          { label:'In-Hand Salary',    value:fmt(PAYSLIPS[0].net), color:'text-accent-400',  bg:'bg-accent-500/10'  },
          { label:'Annual CTC',        value:formatLPA(ANNUAL_CTC),color:'text-warning-400', bg:'bg-warning-500/10' },
          { label:`TDS YTD · ${FY_LABEL}`, value:fmt(TDS_YTD),     color:'text-danger-400',  bg:'bg-danger-500/10'  },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}} className="stat-card">
            <div className={`w-8 h-8 rounded-lg flex-center ${s.bg}`}><IndianRupee className={`w-4 h-4 ${s.color}`}/></div>
            <div>
              <p className="text-xl font-display font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}} className="glass-card p-5">
        <h3 className="font-semibold text-white text-sm mb-4">Salary Trend · {FY_LABEL} (Apr – Sep)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={CHART_DATA} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>formatINRShort(v)} width={52} tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={v=>[fmt(v)]} contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',fontSize:'11px'}}/>
            <Bar dataKey="gross" name="Gross" fill="rgba(99,102,241,0.35)" radius={[4,4,0,0]}/>
            <Bar dataKey="net"   name="Net"   fill="#6366f1"              radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Payslip list */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-semibold text-white text-sm">Payslip History</h3>
        </div>
        <div className="divide-y divide-white/5">
          {PAYSLIPS.map((p,i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary-400"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{p.month}</p>
                <p className="text-xs text-slate-500">Gross: {fmt(p.gross)} · Deductions: {fmt(p.deductions)}</p>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-bold text-accent-400">{fmt(p.net)}</p>
                <span className={`badge text-[10px] ${p.status==='paid'?'badge-success':'badge-warning'}`}>{p.status}</span>
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={()=>setSelected(p)} className="btn-ghost p-1.5"><Eye className="w-3.5 h-3.5"/></button>
                <button className="btn-ghost p-1.5"><Download className="w-3.5 h-3.5"/></button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Payslip modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex-center p-4" onClick={()=>setSelected(null)}>
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto"
            onClick={e=>e.stopPropagation()}>
            <div className="flex-between mb-1">
              <h3 className="font-display font-bold text-white">Payslip — {selected.month}</h3>
              <button onClick={()=>setSelected(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-[10px] text-slate-500 mb-3">
              {COMPANY.name} · {financialYearLabel(new Date(selected.year, selected.monthNum - 1, 1))} · New tax regime
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 p-3 bg-surface-800/60 border border-white/5 rounded-xl mb-4 text-[10px]">
              {[['Employee',EMPLOYEE.name],['Emp. ID',EMPLOYEE.id],['PAN',EMPLOYEE.pan],['UAN',EMPLOYEE.uan]].map(([l,v])=>(
                <div key={l}>
                  <p className="text-slate-500">{l}</p>
                  <p className="text-slate-200 font-medium font-mono">{v}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Earnings</p>
              {[['Basic',selected.basic],['HRA',selected.hra],['Conveyance Allowance',selected.conv],['Medical Allowance',selected.med],['Special Allowance',selected.special],
                ...(selected.bonus > 0 ? [['Bonus',selected.bonus]] : [])].map(([l,v])=>(
                <div key={l} className="flex-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">{l}</span><span className="text-slate-200">{fmt(v)}</span>
                </div>
              ))}
              <div className="flex-between py-2 text-xs font-bold">
                <span className="text-white">Gross Earnings</span><span className="text-primary-400">{fmt(selected.gross)}</span>
              </div>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Deductions</p>
              {[['Provident Fund (PF)',selected.pf],['ESI',selected.esi],['Professional Tax',selected.pt],['Income Tax (TDS)',selected.tds]].map(([l,v])=>(
                <div key={l} className="flex-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">{l}</span>
                  <span className={v > 0 ? 'text-danger-400' : 'text-slate-500'}>{v > 0 ? `-${fmt(v)}` : fmt(0)}</span>
                </div>
              ))}
              <div className="flex-between py-2 text-xs font-bold">
                <span className="text-white">Total Deductions</span><span className="text-danger-400">-{fmt(selected.deductions)}</span>
              </div>
              {selected.tds === 0 && (
                <p className="text-[10px] text-slate-500">TDS nil: taxable income is under ₹12 lakh, so the Sec 87A rebate applies (new regime). ESI not applicable as gross is above ₹21,000.</p>
              )}
            </div>
            <div className="flex-between p-3 bg-accent-500/10 border border-accent-500/20 rounded-xl mb-4">
              <span className="text-sm font-bold text-white">Net Pay</span>
              <span className="text-xl font-display font-bold text-accent-400">{fmt(selected.net)}</span>
            </div>
            <button className="btn-primary w-full justify-center text-xs"><Download className="w-3.5 h-3.5"/>Download PDF</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
