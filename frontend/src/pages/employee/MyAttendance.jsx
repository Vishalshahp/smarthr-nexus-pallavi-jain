import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Calendar, TrendingUp, Wifi } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import clsx from 'clsx';
import { formatDateIN, holidayOn } from '@/utils/india';

const MONTH_DATA = [
  { day:'2026-09-01', checkIn:'09:00',checkOut:'18:05',hours:9.1, status:'present', mode:'office' },
  { day:'2026-09-02', checkIn:'09:12',checkOut:'18:30',hours:9.3, status:'late',    mode:'office' },
  { day:'2026-09-03', checkIn:'09:00',checkOut:'17:55',hours:8.9, status:'present', mode:'remote' },
  { day:'2026-09-04', checkIn:'—',    checkOut:'—',    hours:0,   status:'holiday', mode:'—'      },
  { day:'2026-09-07', checkIn:'08:50',checkOut:'18:10',hours:9.3, status:'present', mode:'office' },
  { day:'2026-09-08', checkIn:'09:00',checkOut:'18:00',hours:9.0, status:'present', mode:'hybrid' },
  { day:'2026-09-09', checkIn:'—',    checkOut:'—',    hours:0,   status:'absent',  mode:'—'      },
  { day:'2026-09-10', checkIn:'09:05',checkOut:'18:00',hours:8.9, status:'present', mode:'remote' },
  { day:'2026-09-11', checkIn:'09:00',checkOut:'18:15',hours:9.2, status:'present', mode:'office' },
  { day:'2026-09-14', checkIn:'08:45',checkOut:'17:45',hours:9.0, status:'present', mode:'office' },
  { day:'2026-09-15', checkIn:'—',    checkOut:'—',    hours:0,   status:'holiday', mode:'—'      },
  { day:'2026-09-16', checkIn:'09:20',checkOut:'18:30',hours:9.2, status:'late',    mode:'hybrid' },
];

const WEEKLY_HOURS = [
  {week:'Aug W4',hours:44.5},{week:'Sep W1',hours:36.2},{week:'Sep W2',hours:37.4},
  {week:'Sep W3',hours:36.0},{week:'Sep W4',hours:45.1},
];

const STATUS_MAP = {
  present: { cls:'badge-success', label:'Present' },
  late:    { cls:'badge-warning', label:'Late'    },
  absent:  { cls:'badge-danger',  label:'Absent'  },
  holiday: { cls:'badge-primary', label:'Holiday' },
};

export default function MyAttendance() {
  const present  = MONTH_DATA.filter(d=>d.status==='present').length;
  const late     = MONTH_DATA.filter(d=>d.status==='late').length;
  const absent   = MONTH_DATA.filter(d=>d.status==='absent').length;
  const totalHrs = MONTH_DATA.reduce((s,d)=>s+d.hours,0).toFixed(1);

  return (
    <div className="space-y-5">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
        <h1 className="font-display text-2xl font-bold text-white">My Attendance</h1>
        <p className="text-slate-400 text-sm mt-0.5">September 2026 · Personal attendance record (IST)</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Present Days',  value:present,  icon:CheckCircle, color:'text-accent-400',  bg:'bg-accent-500/10'  },
          { label:'Late Check-ins',value:late,     icon:Clock,       color:'text-warning-400', bg:'bg-warning-500/10' },
          { label:'Absent Days',   value:absent,   icon:XCircle,     color:'text-danger-400',  bg:'bg-danger-500/10'  },
          { label:'Total Hours',   value:totalHrs, icon:TrendingUp,  color:'text-primary-400', bg:'bg-primary-500/10' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}} className="stat-card">
            <div className={`w-9 h-9 rounded-xl flex-center ${s.bg}`}><s.icon className={`w-4 h-4 ${s.color}`}/></div>
            <div>
              <p className="text-2xl font-display font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="glass-card p-5">
        <h3 className="font-semibold text-white text-sm mb-4">Weekly Hours</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={WEEKLY_HOURS} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="week" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis domain={[30,50]} tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',fontSize:'11px'}}/>
            <Bar dataKey="hours" name="Hours" radius={[6,6,0,0]}>
              {WEEKLY_HOURS.map((_,i)=><Cell key={i} fill={i===WEEKLY_HOURS.length-1?'#6366f1':'rgba(99,102,241,0.4)'}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5"><h3 className="font-semibold text-white text-sm">Daily Attendance Log</h3></div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Mode</th><th>Status</th></tr></thead>
            <tbody>
              {MONTH_DATA.map((d,i) => (
                <tr key={i}>
                  <td className="text-slate-300 font-medium text-xs">
                    {formatDateIN(d.day, { weekday:'short', year: undefined })}
                    {d.status==='holiday' && holidayOn(d.day) && <span className="block text-[10px] text-primary-400 font-normal">{holidayOn(d.day).name}</span>}
                  </td>
                  <td className="text-xs"><span className={d.checkIn==='—'?'text-slate-600':'text-slate-300'}>{d.checkIn}</span></td>
                  <td className="text-xs"><span className={d.checkOut==='—'?'text-slate-600':'text-slate-300'}>{d.checkOut}</span></td>
                  <td className="text-xs">{d.hours>0?<span className="text-accent-400">{d.hours}h</span>:<span className="text-slate-600">—</span>}</td>
                  <td className="text-xs">
                    {d.mode==='remote'?<span className="flex items-center gap-1 text-primary-400 text-[11px]"><Wifi className="w-3 h-3"/>Remote</span>
                     :d.mode==='hybrid'?<span className="flex items-center gap-1 text-warning-400 text-[11px]"><Wifi className="w-3 h-3"/>Hybrid</span>
                     :d.mode==='office'?<span className="text-slate-400 text-[11px]">Office</span>
                     :<span className="text-slate-600 text-[11px]">—</span>}
                  </td>
                  <td>{d.status in STATUS_MAP && <span className={clsx('badge text-[10px]', STATUS_MAP[d.status].cls)}>{STATUS_MAP[d.status].label}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
