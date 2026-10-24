import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, IndianRupee, Clock, TrendingUp, UserCheck,
  Briefcase, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight,
  Activity, Target,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { dashboardAPI } from '@/services/api';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import AttendanceLive from '@/components/dashboard/AttendanceLive';
import TopPerformers from '@/components/dashboard/TopPerformers';
import { formatINRShort, formatDateLongIN, financialYearLabel } from '@/utils/india';

const ATTENDANCE_DATA = [
  { month: 'Apr', present: 92, absent: 8, leave: 12 },
  { month: 'May', present: 88, absent: 12, leave: 15 },
  { month: 'Jun', present: 94, absent: 6, leave: 10 },
  { month: 'Jul', present: 91, absent: 9, leave: 11 },
  { month: 'Aug', present: 87, absent: 13, leave: 14 },
  { month: 'Sep', present: 95, absent: 5, leave: 8 },
];

const PAYROLL_DATA = [
  { month: 'Apr', amount: 362000000 },
  { month: 'May', amount: 366500000 },
  { month: 'Jun', amount: 359800000 },
  { month: 'Jul', amount: 371200000 },
  { month: 'Aug', amount: 376400000 },
  { month: 'Sep', amount: 383000000 },
];

const DEPT_DATA = [
  { name: 'Engineering', value: 38, color: '#6366f1' },
  { name: 'Sales',       value: 22, color: '#10b981' },
  { name: 'Marketing',   value: 15, color: '#f59e0b' },
  { name: 'HR',          value: 10, color: '#ef4444' },
  { name: 'Finance',     value: 15, color: '#8b5cf6' },
];

const STATS = [
  { label: 'Total Employees',    value: '4,821',  change: '+12%',  up: true,  icon: Users,      color: 'text-primary-400', bg: 'bg-primary-500/10' },
  { label: 'Monthly Payroll',    value: '₹38.3 Cr', change: '+1.8%', up: true,  icon: IndianRupee, color: 'text-accent-400',  bg: 'bg-accent-500/10'  },
  { label: 'Present Today',      value: '4,412',  change: '-1.4%', up: false, icon: Clock,      color: 'text-warning-400', bg: 'bg-warning-500/10' },
  { label: 'Open Positions',     value: '47',     change: '+8',    up: true,  icon: Briefcase,  color: 'text-danger-400',  bg: 'bg-danger-500/10'  },
];

const formatCurrency = (v) => formatINRShort(v);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 10000 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAdminStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div {...fadeUp(0)} className="flex-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            {formatDateLongIN(new Date())} · {financialYearLabel()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-accent-400 bg-accent-500/10 border border-accent-500/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse-slow" />
            Live · Real-time
          </span>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} {...fadeUp(i * 0.08)}>
            <StatCard {...stat} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Attendance trend */}
        <motion.div {...fadeUp(0.2)} className="xl:col-span-2 glass-card p-5">
          <div className="flex-between mb-5">
            <div>
              <h3 className="font-semibold text-white text-sm">Attendance Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
            </div>
            <Activity className="w-4 h-4 text-primary-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ATTENDANCE_DATA}>
              <defs>
                <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="present" stroke="#6366f1" fill="url(#gPresent)" strokeWidth={2} name="Present" />
              <Area type="monotone" dataKey="absent"  stroke="#ef4444" fill="url(#gAbsent)"  strokeWidth={2} name="Absent" />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '8px' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department breakdown */}
        <motion.div {...fadeUp(0.25)} className="glass-card p-5">
          <div className="flex-between mb-5">
            <div>
              <h3 className="font-semibold text-white text-sm">Dept. Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">By headcount %</p>
            </div>
            <Users className="w-4 h-4 text-accent-400" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={DEPT_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {DEPT_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {DEPT_DATA.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[10px] text-slate-400 truncate">{d.name}</span>
                <span className="text-[10px] text-slate-500 ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Payroll + Activity + Performers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Payroll bar chart */}
        <motion.div {...fadeUp(0.3)} className="glass-card p-5">
          <div className="flex-between mb-5">
            <div>
              <h3 className="font-semibold text-white text-sm">Payroll Disbursed</h3>
              <p className="text-xs text-slate-500 mt-0.5">Apr – Sep · {financialYearLabel()}</p>
            </div>
            <IndianRupee className="w-4 h-4 text-warning-400" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PAYROLL_DATA} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatCurrency} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" name="Payroll" radius={[4, 4, 0, 0]}>
                {PAYROLL_DATA.map((_, i) => (
                  <Cell key={i} fill={i === PAYROLL_DATA.length - 1 ? '#6366f1' : 'rgba(99,102,241,0.35)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent activity */}
        <motion.div {...fadeUp(0.35)} className="glass-card p-5">
          <RecentActivity />
        </motion.div>

        {/* Top performers */}
        <motion.div {...fadeUp(0.4)} className="glass-card p-5">
          <TopPerformers />
        </motion.div>
      </div>

      {/* Live attendance */}
      <motion.div {...fadeUp(0.45)}>
        <AttendanceLive />
      </motion.div>
    </div>
  );
}
