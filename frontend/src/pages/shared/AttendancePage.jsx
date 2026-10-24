import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, CheckCircle, XCircle, AlertTriangle, Wifi, Filter, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { formatDateLongIN } from '@/utils/india';

const WEEKLY = [
  { day:'Mon', present:142, late:8,  absent:4  },
  { day:'Tue', present:148, late:5,  absent:1  },
  { day:'Wed', present:145, late:9,  absent:0  },
  { day:'Thu', present:140, late:11, absent:3  },
  { day:'Fri', present:138, late:6,  absent:10 },
];

const RECORDS = [
  { id:'EMP00001', name:'Jensi Patel',   dept:'HR',          checkIn:'09:25 AM', checkOut:'06:40 PM', hours:9.25, status:'present', mode:'office' },
  { id:'EMP00002', name:'Rohan Mehta',   dept:'Engineering', checkIn:'09:32 AM', checkOut:'07:30 PM', hours:9.97, status:'present', mode:'office' },
  { id:'EMP00003', name:'Priya Sharma',  dept:'HR',          checkIn:'10:05 AM', checkOut:'06:35 PM', hours:8.5,  status:'late',    mode:'office' },
  { id:'EMP00004', name:'Aarav Shah',    dept:'Engineering', checkIn:'09:30 AM', checkOut:'—',        hours:null, status:'present', mode:'remote' },
  { id:'EMP00005', name:'Ananya Iyer',   dept:'Engineering', checkIn:'09:15 AM', checkOut:'06:15 PM', hours:9.0,  status:'present', mode:'hybrid' },
  { id:'EMP00006', name:'Vikram Singh',  dept:'Sales',       checkIn:'—',        checkOut:'—',        hours:0,    status:'absent',  mode:'—'      },
  { id:'EMP00007', name:'Sneha Desai',   dept:'Marketing',   checkIn:'09:50 AM', checkOut:'06:10 PM', hours:8.3,  status:'late',    mode:'remote' },
  { id:'EMP00008', name:'Karan Joshi',   dept:'Finance',     checkIn:'09:20 AM', checkOut:'06:25 PM', hours:9.1,  status:'present', mode:'office' },
  { id:'EMP00009', name:'Diya Reddy',    dept:'Product',     checkIn:'—',        checkOut:'—',        hours:0,    status:'on_leave',mode:'—'      },
  { id:'EMP00010', name:'Arjun Nair',    dept:'Design',      checkIn:'09:30 AM', checkOut:'06:30 PM', hours:9.0,  status:'present', mode:'hybrid' },
];

const STATUS_MAP = {
  present:  { label:'Present',  cls:'badge-success' },
  late:     { label:'Late',     cls:'badge-warning' },
  absent:   { label:'Absent',   cls:'badge-danger'  },
  on_leave: { label:'On Leave', cls:'badge-primary' },
};

export default function AttendancePage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const today = `${formatDateLongIN(new Date())} · IST`;

  const counts = {
    present:  RECORDS.filter(r=>r.status==='present').length,
    late:     RECORDS.filter(r=>r.status==='late').length,
    absent:   RECORDS.filter(r=>r.status==='absent').length,
    on_leave: RECORDS.filter(r=>r.status==='on_leave').length,
    remote:   RECORDS.filter(r=>r.mode==='remote'||r.mode==='hybrid').length,
  };

  const filtered = RECORDS.filter(r =>
    (filter === 'all' || r.status === filter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.dept.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Attendance Tracker</h1>
          <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse-slow"/>Live · {today}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary text-xs"><Calendar className="w-3.5 h-3.5"/>Date Range</button>
          <button className="btn-secondary text-xs"><Download className="w-3.5 h-3.5"/>Export</button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label:'Present',  value:counts.present,  icon:CheckCircle, color:'text-accent-400',   bg:'bg-accent-500/10',   filter:'present'  },
          { label:'Late',     value:counts.late,     icon:AlertTriangle,color:'text-warning-400', bg:'bg-warning-500/10',  filter:'late'     },
          { label:'Absent',   value:counts.absent,   icon:XCircle,     color:'text-danger-400',   bg:'bg-danger-500/10',   filter:'absent'   },
          { label:'On Leave', value:counts.on_leave, icon:Calendar,    color:'text-primary-400',  bg:'bg-primary-500/10',  filter:'on_leave' },
          { label:'Remote/Hybrid',value:counts.remote,icon:Wifi,       color:'text-slate-300',    bg:'bg-white/5',         filter:'all'      },
        ].map(s => (
          <motion.button key={s.label} initial={{opacity:0}} animate={{opacity:1}}
            onClick={()=>setFilter(filter===s.filter?'all':s.filter)}
            className={clsx('stat-card text-left transition-all',filter===s.filter&&'border-primary-500/30')}>
            <div className={clsx('w-8 h-8 rounded-lg flex-center', s.bg)}>
              <s.icon className={clsx('w-4 h-4',s.color)}/>
            </div>
            <div>
              <p className="text-xl font-display font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Weekly chart */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}} className="glass-card p-5">
        <h3 className="font-semibold text-white text-sm mb-4">This Week's Attendance</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={WEEKLY} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="day" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',fontSize:'11px'}}/>
            <Bar dataKey="present" name="Present" stackId="a" fill="#10b981" radius={[0,0,0,0]}/>
            <Bar dataKey="late"    name="Late"    stackId="a" fill="#f59e0b"/>
            <Bar dataKey="absent"  name="Absent"  stackId="a" fill="#ef4444" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Table */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex gap-3 flex-wrap">
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search employee or department..." className="input-field py-2 text-xs flex-1 min-w-48"/>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="input-field w-auto py-2 text-xs">
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Employee</th><th>Department</th><th>Check In</th>
              <th>Check Out</th><th>Hours</th><th>Mode</th><th>Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => {
                const s = STATUS_MAP[r.status];
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-white">{r.name.split(' ').map(n=>n[0]).join('')}</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{r.name}</p>
                          <p className="text-[10px] text-slate-500">{r.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-400 text-xs">{r.dept}</td>
                    <td className="text-xs"><span className={r.checkIn==='—'?'text-slate-600':'text-slate-300'}>{r.checkIn}</span></td>
                    <td className="text-xs"><span className={r.checkOut==='—'?'text-slate-600':'text-slate-300'}>{r.checkOut}</span></td>
                    <td className="text-xs">{r.hours ? <span className="text-accent-400">{r.hours}h</span> : <span className="text-slate-600">—</span>}</td>
                    <td className="text-xs">
                      {r.mode==='remote'?<span className="flex items-center gap-1 text-primary-400"><Wifi className="w-3 h-3"/>Remote</span>
                       :r.mode==='hybrid'?<span className="flex items-center gap-1 text-warning-400"><Wifi className="w-3 h-3"/>Hybrid</span>
                       :r.mode==='office'?<span className="text-slate-400">Office</span>
                       :<span className="text-slate-600">—</span>}
                    </td>
                    <td><span className={clsx('badge text-[10px]', s.cls)}>{s.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
