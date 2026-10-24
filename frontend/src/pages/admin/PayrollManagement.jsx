import { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Download, CheckCircle, Clock, Filter, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import clsx from 'clsx';
import { formatINR, formatINRShort, financialYearLabel } from '@/utils/india';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();

const PAYROLL_DATA = [
  { month: 'Apr', gross: 362000000, net: 311300000, employees: 4718 },
  { month: 'May', gross: 366500000, net: 315200000, employees: 4752 },
  { month: 'Jun', gross: 359800000, net: 309400000, employees: 4706 },
  { month: 'Jul', gross: 371200000, net: 319200000, employees: 4774 },
  { month: 'Aug', gross: 376400000, net: 323700000, employees: 4796 },
  { month: 'Sep', gross: 383000000, net: 329400000, employees: 4821 },
];

// Monthly salary structure in ₹ (PF 12% of basic capped at ₹15,000 wage ceiling,
// ESI only when gross ≤ ₹21,000, Gujarat PT ₹200, TDS under the new tax regime)
const EMPLOYEES = [
  { id:'EMP00001', name:'Jensi Patel',   dept:'HR',          basic:75000,  hra:30000, conv:1600, med:1250, special:42150, pf:1800, esi:0,   pt:200, tax:12567, gross:150000, net:135433, status:'paid'      },
  { id:'EMP00002', name:'Rohan Mehta',   dept:'Engineering', basic:100000, hra:50000, conv:1600, med:1250, special:47150, pf:1800, esi:0,   pt:200, tax:24375, gross:200000, net:173625, status:'paid'      },
  { id:'EMP00003', name:'Priya Sharma',  dept:'HR',          basic:25000,  hra:10000, conv:1600, med:1250, special:12150, pf:1800, esi:0,   pt:200, tax:0,     gross:50000,  net:48000,  status:'paid'      },
  { id:'EMP00004', name:'Aarav Shah',    dept:'Engineering', basic:35000,  hra:14000, conv:1600, med:1250, special:18150, pf:1800, esi:0,   pt:200, tax:0,     gross:70000,  net:68000,  status:'processed' },
  { id:'EMP00005', name:'Ananya Iyer',   dept:'Engineering', basic:60000,  hra:30000, conv:1600, med:1250, special:27150, pf:1800, esi:0,   pt:200, tax:7345,  gross:120000, net:110655, status:'paid'      },
  { id:'EMP00006', name:'Vikram Singh',  dept:'Sales',       basic:32500,  hra:16250, conv:1600, med:1250, special:13400, pf:1800, esi:0,   pt:200, tax:0,     gross:65000,  net:63000,  status:'paid'      },
  { id:'EMP00007', name:'Sneha Desai',   dept:'Marketing',   basic:27500,  hra:11000, conv:1600, med:1250, special:13650, pf:1800, esi:0,   pt:200, tax:0,     gross:55000,  net:53000,  status:'processed' },
  { id:'EMP00008', name:'Karan Joshi',   dept:'Finance',     basic:37500,  hra:15000, conv:1600, med:1250, special:19650, pf:1800, esi:0,   pt:200, tax:0,     gross:75000,  net:73000,  status:'paid'      },
  { id:'EMP00016', name:'Ramesh Parmar', dept:'Operations',  basic:9000,   hra:3600,  conv:1600, med:1250, special:2550,  pf:1080, esi:135, pt:200, tax:0,     gross:18000,  net:16585,  status:'paid'      },
];

const STATUS_MAP = { paid:'badge-success', processed:'badge-warning', draft:'badge-neutral' };

const fmt = (n) => formatINR(n);

export default function PayrollManagement() {
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear]  = useState(now.getFullYear());
  const [search, setSearch]         = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);

  const filtered = EMPLOYEES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalGross = filtered.reduce((s, e) => s + e.gross, 0);
  const totalNet   = filtered.reduce((s, e) => s + e.net,   0);
  const totalPF    = filtered.reduce((s, e) => s + e.pf,    0);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="flex-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Payroll Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">{MONTHS[selectedMonth]} {selectedYear} · {financialYearLabel(new Date(selectedYear, selectedMonth, 1))} · {filtered.length} employees</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={selectedMonth} onChange={e => setSelectedMonth(+e.target.value)}
            className="input-field w-auto py-2 text-xs">
            {MONTHS.map((m,i) => <option key={m} value={i}>{m} {selectedYear}</option>)}
          </select>
          <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5"/>Export</button>
          <button className="btn-primary text-xs"><CheckCircle className="w-3.5 h-3.5"/>Run Payroll</button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Gross',   value: fmt(totalGross), icon: IndianRupee,  color:'text-primary-400', bg:'bg-primary-500/10' },
          { label:'Total Net Pay', value: fmt(totalNet),   icon: TrendingUp,   color:'text-accent-400',  bg:'bg-accent-500/10'  },
          { label:'Total PF',      value: fmt(totalPF),    icon: AlertCircle,  color:'text-warning-400', bg:'bg-warning-500/10' },
          { label:'Employees',     value: filtered.length, icon: Users,        color:'text-slate-300',   bg:'bg-white/5'        },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
            className="stat-card">
            <div className={clsx('w-9 h-9 rounded-xl flex-center', s.bg)}>
              <s.icon className={clsx('w-4 h-4', s.color)} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="glass-card p-5">
        <h3 className="font-semibold text-white text-sm mb-4">6-Month Payroll Trend · Apr – Sep ({financialYearLabel()})</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={PAYROLL_DATA} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>formatINRShort(v)} tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={v=>[formatINRShort(v)]} contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',fontSize:'12px'}}/>
            <Bar dataKey="gross" name="Gross" radius={[4,4,0,0]} fill="rgba(99,102,241,0.4)" />
            <Bar dataKey="net"   name="Net"   radius={[4,4,0,0]} fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Table */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search employee..." className="input-field py-2 text-xs flex-1"/>
          <button className="btn-secondary text-xs"><Filter className="w-3.5 h-3.5"/>Filter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Employee</th><th>Dept</th><th>Basic</th><th>Gross</th>
              <th>Deductions</th><th>Net Pay</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className="group cursor-pointer" onClick={()=>setSelectedEmp(emp)}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500/40 to-accent-500/40 flex-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-white">{emp.name.split(' ').map(n=>n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-400 text-xs">{emp.dept}</td>
                  <td className="text-slate-300 text-xs">{fmt(emp.basic)}</td>
                  <td className="text-slate-300 text-xs font-medium">{fmt(emp.gross)}</td>
                  <td className="text-danger-400 text-xs">-{fmt(emp.pf+emp.esi+emp.pt+emp.tax)}</td>
                  <td className="text-accent-400 text-xs font-bold">{fmt(emp.net)}</td>
                  <td><span className={clsx('badge text-[10px]', STATUS_MAP[emp.status])}>{emp.status}</span></td>
                  <td>
                    <button className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      <Download className="w-3.5 h-3.5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payslip Detail Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex-center p-4" onClick={()=>setSelectedEmp(null)}>
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-md p-6"
            onClick={e=>e.stopPropagation()}>
            <div className="flex-between mb-5">
              <div>
                <h3 className="font-display font-bold text-white">Payslip — {MONTHS[selectedMonth]} {selectedYear}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEmp.id} · {selectedEmp.dept}</p>
              </div>
              <button onClick={()=>setSelectedEmp(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex-center">
                <span className="text-sm font-bold text-white">{selectedEmp.name.split(' ').map(n=>n[0]).join('')}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{selectedEmp.name}</p>
                <p className="text-xs text-slate-400">{selectedEmp.dept}</p>
              </div>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Earnings</p>
              {[['Basic Salary',fmt(selectedEmp.basic)],['HRA',fmt(selectedEmp.hra)],['Conveyance',fmt(selectedEmp.conv)],['Medical',fmt(selectedEmp.med)],['Special Allowance',fmt(selectedEmp.special)]].map(([l,v])=>(
                <div key={l} className="flex-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">{l}</span><span className="text-slate-200">{v}</span>
                </div>
              ))}
              <div className="flex-between text-xs py-2 font-bold">
                <span className="text-white">Gross Earnings</span><span className="text-primary-400">{fmt(selectedEmp.gross)}</span>
              </div>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Deductions</p>
              {[['Provident Fund',fmt(selectedEmp.pf)],['ESI',fmt(selectedEmp.esi)],['Professional Tax',fmt(selectedEmp.pt)],['Income Tax (TDS, New Regime)',fmt(selectedEmp.tax)]].map(([l,v])=>(
                <div key={l} className="flex-between text-xs py-1.5 border-b border-white/5">
                  <span className="text-slate-400">{l}</span><span className="text-danger-400">-{v}</span>
                </div>
              ))}
            </div>
            <div className="flex-between p-4 bg-accent-500/10 border border-accent-500/20 rounded-xl">
              <span className="font-bold text-white">Net Take-Home</span>
              <span className="text-2xl font-display font-bold text-accent-400">{fmt(selectedEmp.net)}</span>
            </div>
            <button className="btn-primary w-full justify-center mt-4 text-xs">
              <Download className="w-3.5 h-3.5"/>Download PDF Payslip
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
