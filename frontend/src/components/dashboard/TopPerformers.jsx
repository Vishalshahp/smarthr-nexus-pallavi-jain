import { Star, TrendingUp } from 'lucide-react';

const PERFORMERS = [
  { name: 'Ananya Iyer',    role: 'Senior Dev',     dept: 'Engineering', score: 4.9, change: '+0.2' },
  { name: 'Meera Kapoor',   role: 'Sales Manager',  dept: 'Sales',       score: 4.8, change: '+0.1' },
  { name: 'Arjun Nair',     role: 'UI/UX Designer', dept: 'Design',      score: 4.7, change: '+0.3' },
  { name: 'Aditya Kulkarni', role: 'DevOps Eng.',   dept: 'Engineering', score: 4.7, change: '0.0'  },
  { name: 'Priya Sharma',   role: 'HR Recruiter',   dept: 'HR',          score: 4.6, change: '+0.1' },
];

const COLORS = ['from-yellow-400 to-orange-400', 'from-slate-300 to-slate-400', 'from-orange-600 to-amber-600'];

export default function TopPerformers() {
  return (
    <>
      <div className="flex-between mb-4">
        <h3 className="font-semibold text-white text-sm">Top Performers</h3>
        <TrendingUp className="w-4 h-4 text-warning-400" />
      </div>
      <div className="space-y-3">
        {PERFORMERS.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${COLORS[i] || 'from-primary-500 to-accent-500'} flex-center flex-shrink-0`}>
              <span className="text-[10px] font-bold text-white">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{p.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{p.role} · {p.dept}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 justify-end">
                <Star className="w-3 h-3 text-warning-400 fill-warning-400" />
                <span className="text-xs font-semibold text-white">{p.score}</span>
              </div>
              <span className="text-[10px] text-accent-400">{p.change}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
