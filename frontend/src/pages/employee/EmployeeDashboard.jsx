import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Calendar, IndianRupee, Target, TrendingUp, Sun, Coffee, Sunset, PartyPopper } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/authSlice';
import { attendanceAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { formatINR, formatDateIN, formatDateLongIN, formatTimeIN, upcomingHolidays, daysUntil } from '@/utils/india';

const getGreeting = () => {
  // Hour of day in IST (Asia/Kolkata)
  const h = Number(new Date().toLocaleString('en-IN', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }));
  if (h < 12) return { text: 'Good Morning', icon: Sun };
  if (h < 17) return { text: 'Good Afternoon', icon: Coffee };
  return { text: 'Good Evening', icon: Sunset };
};

const QUICK_STATS = [
  { label: 'Days Present',   value: '21', sub: 'This month',   icon: CheckCircle, color: 'text-accent-400',  bg: 'bg-accent-500/10'  },
  { label: 'Leave Balance',  value: '14', sub: 'Days remaining',icon: Calendar,   color: 'text-primary-400', bg: 'bg-primary-500/10' },
  { label: 'Performance',    value: '4.6',sub: 'Out of 5.0',   icon: TrendingUp,  color: 'text-warning-400', bg: 'bg-warning-500/10' },
  { label: 'Net Salary',     value: formatINR(68000), sub: 'Last month',icon: IndianRupee, color: 'text-accent-400',  bg: 'bg-accent-500/10'  },
];

export default function EmployeeDashboard() {
  const user = useSelector(selectUser);
  const greeting = getGreeting();
  const GreetIcon = greeting.icon;

  const [checkInState, setCheckInState] = useState({ isIn: false, time: null, loading: false });
  const [elapsed, setElapsed] = useState('');
  const [attendancePercent] = useState(87);

  // Live timer when checked in
  useEffect(() => {
    if (!checkInState.isIn || !checkInState.time) return;
    const tick = () => {
      const diff = Date.now() - new Date(checkInState.time).getTime();
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [checkInState]);

  // Fetch today's attendance
  useEffect(() => {
    attendanceAPI.getToday()
      .then(({ data }) => {
        if (data.data?.checkIn && !data.data?.checkOut) {
          setCheckInState({ isIn: true, time: data.data.checkIn.time, loading: false });
        }
      })
      .catch(() => {});
  }, []);

  const handleCheckIn = async () => {
    setCheckInState((s) => ({ ...s, loading: true }));
    try {
      await attendanceAPI.checkIn({ method: 'manual' });
      const now = new Date();
      setCheckInState({ isIn: true, time: now, loading: false });
      toast.success(`Checked in at ${formatTimeIN(now)}`);
    } catch {
      setCheckInState((s) => ({ ...s, loading: false }));
      toast.error('Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    setCheckInState((s) => ({ ...s, loading: true }));
    try {
      await attendanceAPI.checkOut({ method: 'manual' });
      setCheckInState({ isIn: false, time: null, loading: false });
      toast.success('Checked out successfully!');
    } catch {
      setCheckInState((s) => ({ ...s, loading: false }));
      toast.error('Check-out failed');
    }
  };

  const radialData = [{ value: attendancePercent, fill: '#6366f1' }];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex-center">
            <GreetIcon className="w-5 h-5 text-warning-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              {greeting.text}, {user?.firstName}!
            </h1>
            <p className="text-slate-400 text-sm">
              {formatDateLongIN()}
            </p>
          </div>
        </div>
        {/* Check-in/out button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={checkInState.isIn ? handleCheckOut : handleCheckIn}
          disabled={checkInState.loading}
          className={clsx(
            'flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold text-sm transition-all duration-300',
            checkInState.isIn
              ? 'bg-danger-600 hover:bg-danger-500 text-white shadow-lg shadow-danger-500/20'
              : 'bg-accent-500 hover:bg-accent-400 text-white shadow-lg shadow-accent-500/20',
            checkInState.loading && 'opacity-60 cursor-not-allowed'
          )}
        >
          <div className={clsx('w-2.5 h-2.5 rounded-full', checkInState.isIn ? 'bg-white animate-pulse' : 'bg-white')} />
          {checkInState.loading ? 'Processing...' : checkInState.isIn ? `Check Out  ${elapsed}` : 'Check In'}
          <Clock className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="stat-card"
            >
              <div className={clsx('w-9 h-9 rounded-xl flex-center', s.bg)}>
                <Icon className={clsx('w-4 h-4', s.color)} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-[10px] text-slate-600">{s.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance ring */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 flex flex-col items-center"
        >
          <h3 className="font-semibold text-white text-sm mb-4 self-start">Monthly Attendance</h3>
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'rgba(255,255,255,0.04)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-4">
            <p className="text-3xl font-display font-bold text-white">{attendancePercent}%</p>
            <p className="text-xs text-slate-500">Attendance Rate</p>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-4 border-t border-white/5">
            {[
              { label: 'Present', value: '21', color: 'text-accent-400'  },
              { label: 'Absent',  value: '2',  color: 'text-danger-400'  },
              { label: 'Leave',   value: '1',  color: 'text-warning-400' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className={clsx('text-base font-bold', item.color)}>{item.value}</p>
                <p className="text-[10px] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming schedule */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-white text-sm mb-4">This Week</h3>
          <div className="space-y-2.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
              const isToday = i === new Date().getDay() - 1;
              const status = i < new Date().getDay() - 1 ? 'done' : isToday ? 'today' : 'upcoming';
              return (
                <div key={day} className={clsx('flex items-center gap-3 p-2.5 rounded-xl transition-all',
                  isToday ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-white/5'
                )}>
                  <div className={clsx('w-8 h-8 rounded-lg flex-center text-xs font-semibold flex-shrink-0',
                    status === 'done' ? 'bg-accent-500/10 text-accent-400' :
                    status === 'today' ? 'bg-primary-600 text-white' :
                    'bg-surface-700 text-slate-400'
                  )}>
                    {status === 'done' ? '✓' : day[0]}
                  </div>
                  <div className="flex-1">
                    <p className={clsx('text-xs font-medium', isToday ? 'text-white' : 'text-slate-400')}>{day}</p>
                    <p className="text-[10px] text-slate-600">09:00 – 18:00</p>
                  </div>
                  {isToday && <span className="badge-primary badge text-[10px]">Today</span>}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Goals progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex-between mb-4">
            <h3 className="font-semibold text-white text-sm">My Goals</h3>
            <Target className="w-4 h-4 text-primary-400" />
          </div>
          <div className="space-y-4">
            {[
              { title: 'Complete Q3 FY 2026-27 project', progress: 78, due: '31 Dec' },
              { title: 'Finish React course',    progress: 55, due: '15 Jan' },
              { title: 'Mid-year performance review', progress: 30, due: '30 Oct' },
              { title: 'Team documentation',     progress: 90, due: '20 Dec' },
            ].map((goal, i) => (
              <div key={i}>
                <div className="flex-between mb-1.5">
                  <p className="text-xs text-slate-300 truncate pr-2">{goal.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-slate-500">{goal.due}</span>
                    <span className="text-[10px] font-semibold text-primary-400">{goal.progress}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: goal.progress >= 80 ? '#10b981' : goal.progress >= 50 ? '#6366f1' : '#f59e0b' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming holidays */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="glass-card p-5"
      >
        <div className="flex-between mb-4">
          <h3 className="font-semibold text-white text-sm">Upcoming Holidays</h3>
          <PartyPopper className="w-4 h-4 text-warning-400" />
        </div>
        {upcomingHolidays(4).length === 0 ? (
          <p className="text-xs text-slate-500">No more company holidays this year.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingHolidays(4).map((h, i) => {
              const n = daysUntil(h.date);
              return (
                <div key={h.date} className={clsx('p-3 rounded-xl border',
                  i === 0 ? 'bg-warning-500/10 border-warning-500/20' : 'bg-surface-800/60 border-white/5'
                )}>
                  <p className={clsx('text-[10px] font-semibold', i === 0 ? 'text-warning-400' : 'text-primary-400')}>
                    {n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `in ${n} days`}
                  </p>
                  <p className="text-xs font-medium text-white mt-1 truncate" title={h.name}>{h.name}</p>
                  <p className="text-[10px] text-slate-500">{formatDateIN(h.date, { weekday: 'short', year: undefined })}</p>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
