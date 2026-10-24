import { UserPlus, IndianRupee, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import clsx from 'clsx';

const ACTIVITIES = [
  { icon: UserPlus,    color: 'text-primary-400 bg-primary-500/10', text: 'New employee Riya Bhatt onboarded',   time: '5m ago'  },
  { icon: IndianRupee, color: 'text-accent-400  bg-accent-500/10',  text: 'Sep payroll processed – ₹38.3 Cr',     time: '1h ago'  },
  { icon: CheckCircle, color: 'text-accent-400  bg-accent-500/10',  text: 'Earned Leave (EL) approved for Sneha Desai',       time: '2h ago'  },
  { icon: FileText,    color: 'text-warning-400 bg-warning-500/10', text: '14 resumes AI-screened for Dev role', time: '3h ago'  },
  { icon: AlertCircle, color: 'text-danger-400  bg-danger-500/10',  text: 'Late mark flagged: 3 employees',     time: '4h ago'  },
  { icon: Clock,       color: 'text-slate-400   bg-white/5',        text: 'Half-yearly appraisals (Apr–Sep) due soon',    time: '1d ago'  },
];

export default function RecentActivity() {
  return (
    <>
      <div className="flex-between mb-4">
        <h3 className="font-semibold text-white text-sm">Recent Activity</h3>
        <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View all</button>
      </div>
      <div className="space-y-3">
        {ACTIVITIES.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className={clsx('w-7 h-7 rounded-lg flex-center flex-shrink-0 mt-0.5', a.color.split(' ')[1])}>
                <Icon className={clsx('w-3.5 h-3.5', a.color.split(' ')[0])} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 leading-relaxed">{a.text}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
