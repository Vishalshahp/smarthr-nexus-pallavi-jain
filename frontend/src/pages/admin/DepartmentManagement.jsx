import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, IndianRupee, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import clsx from 'clsx';
import { formatINRShort, financialYearLabel } from '@/utils/india';

const DEPARTMENTS = [
  { id:1, name:'Engineering',     code:'ENG', head:'Rohan Mehta',   employees:38, budget:45000000, spent:32760000, location:'Bengaluru · Floor 3', color:'#6366f1' },
  { id:2, name:'Human Resources', code:'HR',  head:'Jensi Patel',   employees:10, budget:8500000,  spent:6480000,  location:'Ahmedabad · Floor 1', color:'#10b981' },
  { id:3, name:'Sales',           code:'SLS', head:'Meera Kapoor',  employees:22, budget:22000000, spent:17970000, location:'Mumbai · Floor 2',    color:'#f59e0b' },
  { id:4, name:'Marketing',       code:'MKT', head:'—',             employees:15, budget:15000000, spent:11160000, location:'Ahmedabad · Floor 2', color:'#8b5cf6' },
  { id:5, name:'Finance',         code:'FIN', head:'Karan Joshi',   employees:12, budget:12000000, spent:8750000,  location:'Ahmedabad · Floor 4', color:'#ef4444' },
  { id:6, name:'Product',         code:'PRD', head:'Diya Reddy',    employees:10, budget:11000000, spent:7700000,  location:'Hyderabad · Floor 3', color:'#06b6d4' },
  { id:7, name:'Design',          code:'DSN', head:'Arjun Nair',    employees:8,  budget:7200000,  spent:5040000,  location:'Pune · Floor 3',      color:'#f97316' },
  { id:8, name:'Operations',      code:'OPS', head:'Harsh Trivedi', employees:14, budget:9000000,  spent:7020000,  location:'Ahmedabad · Floor 1', color:'#84cc16' },
];

// Annual budgets for the current Indian financial year (April – March)
const fmt = (n) => formatINRShort(n);

export default function DepartmentManagement() {
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const pieData = DEPARTMENTS.map(d => ({ name: d.name, value: d.employees, fill: d.color }));
  const totalEmployees = DEPARTMENTS.reduce((s,d) => s+d.employees, 0);
  const totalBudget    = DEPARTMENTS.reduce((s,d) => s+d.budget, 0);

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Department Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">{DEPARTMENTS.length} departments · {totalEmployees} total employees</p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="btn-primary text-xs">
          <Plus className="w-3.5 h-3.5"/>Add Department
        </button>
      </motion.div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}} className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-white text-sm mb-4">Budget Overview · {financialYearLabel()}</h3>
          <div className="space-y-3">
            {DEPARTMENTS.map(d => {
              const pct = Math.round((d.spent / d.budget) * 100);
              return (
                <div key={d.id} className="flex items-center gap-3">
                  <div className="w-16 text-[10px] text-slate-400 flex-shrink-0">{d.code}</div>
                  <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width:`${pct}%`, background: d.color, opacity: pct > 90 ? 1 : 0.7 }} />
                  </div>
                  <div className="w-36 text-right text-[10px] text-slate-400 flex-shrink-0">
                    {fmt(d.spent)} / {fmt(d.budget)} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}} className="glass-card p-5">
          <h3 className="font-semibold text-white text-sm mb-3">Headcount Split</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                {pieData.map((e,i) => <Cell key={i} fill={e.fill} stroke="transparent"/>)}
              </Pie>
              <Tooltip formatter={v=>[`${v} employees`]} contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',fontSize:'11px'}}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {DEPARTMENTS.slice(0,6).map(d => (
              <div key={d.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:d.color}}/>
                <span className="text-[10px] text-slate-400 truncate">{d.code}</span>
                <span className="text-[10px] text-slate-600 ml-auto">{d.employees}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Department cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {DEPARTMENTS.map((dept, i) => {
          const pct = Math.round((dept.spent / dept.budget) * 100);
          return (
            <motion.div key={dept.id} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.1+i*0.05}}
              className="glass-card-hover p-4 cursor-pointer" onClick={()=>setSelected(dept)}>
              <div className="flex-between mb-3">
                <div className="w-10 h-10 rounded-xl flex-center" style={{background:`${dept.color}20`,border:`1px solid ${dept.color}30`}}>
                  <Building2 className="w-5 h-5" style={{color:dept.color}}/>
                </div>
                <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-full">{dept.code}</span>
              </div>
              <h4 className="font-semibold text-white text-sm mb-0.5">{dept.name}</h4>
              <p className="text-[10px] text-slate-500 mb-3">{dept.location}</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5"/>{dept.employees}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <IndianRupee className="w-3.5 h-3.5"/>{fmt(dept.budget)}
                </div>
              </div>
              <div>
                <div className="flex-between text-[10px] text-slate-500 mb-1">
                  <span>Budget used</span><span style={{color:pct>90?'#ef4444':'#10b981'}}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${pct}%`,background:dept.color}}/>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Head: <span className="text-slate-300">{dept.head}</span></p>
            </motion.div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex-center p-4" onClick={()=>setSelected(null)}>
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="bg-surface-900 border border-white/10 rounded-2xl w-full max-w-sm p-6"
            onClick={e=>e.stopPropagation()}>
            <div className="flex-between mb-5">
              <h3 className="font-display font-bold text-white">{selected.name}</h3>
              <button onClick={()=>setSelected(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              {[
                ['Code', selected.code], ['Head', selected.head], ['Location', selected.location],
                ['Employees', selected.employees], [`Annual Budget (${financialYearLabel()})`, fmt(selected.budget)],
                ['Spent', fmt(selected.spent)], ['Remaining', fmt(selected.budget-selected.spent)],
              ].map(([l,v]) => (
                <div key={l} className="flex-between py-2 border-b border-white/5 text-xs">
                  <span className="text-slate-400">{l}</span>
                  <span className="text-white font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn-secondary text-xs flex-1 justify-center"><Edit className="w-3.5 h-3.5"/>Edit</button>
              <button className="btn-danger text-xs flex-1 justify-center"><Trash2 className="w-3.5 h-3.5"/>Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
