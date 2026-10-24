import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Download, FileText, Users, Clock, IndianRupee, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatNumberIN, financialYearLabel } from '@/utils/india';

const REPORTS = [
  { icon:Users,     title:'Headcount Report',       desc:'Total employees by dept, role & status',         color:'text-primary-400', bg:'bg-primary-500/10' },
  { icon:Clock,     title:'Attendance Report',       desc:'Monthly attendance summary with trends',         color:'text-accent-400',  bg:'bg-accent-500/10'  },
  { icon:IndianRupee,title:'Payroll Summary',        desc:'Salary disbursement with PF, ESI, PT & TDS',     color:'text-warning-400', bg:'bg-warning-500/10' },
  { icon:Target,    title:'Performance Report',      desc:'Quarterly ratings and goal achievement (FY)',       color:'text-purple-400',  bg:'bg-purple-500/10'  },
  { icon:FileText,  title:'Leave Analytics',         desc:'EL, CL & SL utilisation and balance report',        color:'text-blue-400',    bg:'bg-blue-500/10'    },
  { icon:BarChart2, title:'Recruitment Analytics',   desc:'Hiring funnel, time-to-hire, source analysis',  color:'text-orange-400',  bg:'bg-orange-500/10'  },
];

const GROWTH = [
  {month:'Apr',employees:4718},{month:'May',employees:4752},{month:'Jun',employees:4706},
  {month:'Jul',employees:4774},{month:'Aug',employees:4796},{month:'Sep',employees:4821},
];

const DEPT_DIST = [
  {name:'Engineering',value:38,fill:'#6366f1'},{name:'Sales',value:22,fill:'#10b981'},
  {name:'Marketing',value:15,fill:'#f59e0b'},{name:'HR',value:10,fill:'#ef4444'},
  {name:'Finance',value:12,fill:'#8b5cf6'},{name:'Others',value:12,fill:'#64748b'},
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(null);
  const handleDownload = (title) => {
    setDownloading(title);
    setTimeout(()=>setDownloading(null), 1500);
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Company-wide insights and data exports · {financialYearLabel()}</p>
        </div>
        <button className="btn-primary text-xs"><Download className="w-3.5 h-3.5"/>Export All</button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}} className="glass-card p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Headcount Growth · Apr – Sep</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={GROWTH}>
              <defs>
                <linearGradient id="gEmp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis domain={[4600,4900]} tickFormatter={v=>formatNumberIN(v)} tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={v=>[formatNumberIN(v), 'Employees']} contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',fontSize:'11px'}}/>
              <Area type="monotone" dataKey="employees" name="Employees" stroke="#6366f1" fill="url(#gEmp)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}} className="glass-card p-5">
          <h3 className="font-semibold text-white text-sm mb-3">Department Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart>
                <Pie data={DEPT_DIST} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                  {DEPT_DIST.map((e,i)=><Cell key={i} fill={e.fill} stroke="transparent"/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {DEPT_DIST.map(d=>(
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:d.fill}}/>
                  <span className="text-[11px] text-slate-400 flex-1 truncate">{d.name}</span>
                  <span className="text-[11px] text-slate-500">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Report download cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((r,i) => (
          <motion.div key={r.title} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.1+i*0.06}}
            className="glass-card-hover p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex-center flex-shrink-0 ${r.bg}`}>
                <r.icon className={`w-5 h-5 ${r.color}`}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{r.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>handleDownload(r.title+' PDF')}
                className={`btn-secondary text-xs flex-1 justify-center ${downloading===r.title+' PDF'?'opacity-60':''}`}>
                <Download className="w-3 h-3"/>
                {downloading===r.title+' PDF' ? 'Generating...' : 'PDF'}
              </button>
              <button onClick={()=>handleDownload(r.title+' Excel')}
                className={`btn-secondary text-xs flex-1 justify-center ${downloading===r.title+' Excel'?'opacity-60':''}`}>
                <Download className="w-3 h-3"/>
                {downloading===r.title+' Excel' ? 'Generating...' : 'Excel'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
