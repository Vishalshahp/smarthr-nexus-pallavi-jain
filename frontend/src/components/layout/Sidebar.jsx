import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, LayoutDashboard, Users, Clock, IndianRupee, BarChart2,
  Briefcase, Settings, ChevronLeft, ChevronRight, LogOut,
  Target, UserCheck, FileText, Building2, Bell, Calendar,
  TrendingUp, Search, User,
} from 'lucide-react';
import { logoutUser, selectUser } from '@/store/slices/authSlice';
import { toggleSidebarCollapse } from '@/store/slices/uiSlice';
import clsx from 'clsx';
import { DEVELOPER_NAME } from '@/utils/india';

const NAV_CONFIG = {
  super_admin: [
    { group: 'Overview',    items: [{ to: '/dashboard/admin',              icon: LayoutDashboard, label: 'Dashboard'    }] },
    { group: 'Management',  items: [
      { to: '/dashboard/admin/employees',   icon: Users,        label: 'Employees'    },
      { to: '/dashboard/admin/departments', icon: Building2,    label: 'Departments'  },
      { to: '/dashboard/admin/payroll',     icon: IndianRupee,  label: 'Payroll'      },
    ]},
    { group: 'HR & Talent', items: [
      { to: '/dashboard/recruiter/jobs',    icon: Briefcase,    label: 'Jobs'         },
      { to: '/dashboard/recruiter/pipeline',icon: UserCheck,    label: 'Pipeline'     },
    ]},
    { group: 'Analytics',   items: [
      { to: '/dashboard/attendance',        icon: Clock,        label: 'Attendance'   },
      { to: '/dashboard/performance',       icon: Target,       label: 'Performance'  },
      { to: '/dashboard/reports',           icon: BarChart2,    label: 'Reports'      },
    ]},
    { group: 'System',      items: [{ to: '/dashboard/admin/settings',     icon: Settings,     label: 'Settings'     }] },
  ],
  admin: [
    { group: 'Overview',    items: [{ to: '/dashboard/admin',              icon: LayoutDashboard, label: 'Dashboard'    }] },
    { group: 'Management',  items: [
      { to: '/dashboard/admin/employees',   icon: Users,        label: 'Employees'    },
      { to: '/dashboard/admin/departments', icon: Building2,    label: 'Departments'  },
      { to: '/dashboard/admin/payroll',     icon: IndianRupee,  label: 'Payroll'      },
    ]},
    { group: 'Analytics',   items: [
      { to: '/dashboard/attendance',        icon: Clock,        label: 'Attendance'   },
      { to: '/dashboard/performance',       icon: Target,       label: 'Performance'  },
      { to: '/dashboard/reports',           icon: BarChart2,    label: 'Reports'      },
    ]},
  ],
  senior_manager: [
    { group: 'Overview',    items: [{ to: '/dashboard/manager',            icon: LayoutDashboard, label: 'Dashboard'    }] },
    { group: 'Team',        items: [
      { to: '/dashboard/manager/performance', icon: TrendingUp,  label: 'Performance'  },
      { to: '/dashboard/manager/leaves',     icon: Calendar,    label: 'Leave Approvals' },
      { to: '/dashboard/attendance',         icon: Clock,       label: 'Attendance'   },
    ]},
    { group: 'Recruitment', items: [
      { to: '/dashboard/recruiter/jobs',     icon: Briefcase,   label: 'Job Openings' },
      { to: '/dashboard/recruiter/pipeline', icon: UserCheck,   label: 'Pipeline'     },
    ]},
    { group: 'Analytics',   items: [{ to: '/dashboard/reports', icon: BarChart2, label: 'Reports' }] },
  ],
  hr_recruiter: [
    { group: 'Overview',    items: [{ to: '/dashboard/recruiter',           icon: LayoutDashboard, label: 'Dashboard'    }] },
    { group: 'Recruitment', items: [
      { to: '/dashboard/recruiter/jobs',    icon: Briefcase,    label: 'Job Listings' },
      { to: '/dashboard/recruiter/pipeline',icon: UserCheck,    label: 'Candidate Pipeline' },
    ]},
    { group: 'HR Ops',      items: [
      { to: '/dashboard/attendance',        icon: Clock,        label: 'Attendance'   },
      { to: '/dashboard/performance',       icon: Target,       label: 'Performance'  },
    ]},
  ],
  employee: [
    { group: 'My Workspace', items: [{ to: '/dashboard/employee',          icon: LayoutDashboard, label: 'Dashboard'    }] },
    { group: 'My Data',     items: [
      { to: '/dashboard/employee/attendance', icon: Clock,      label: 'Attendance'   },
      { to: '/dashboard/employee/payslips',   icon: IndianRupee, label: 'Payslips'    },
      { to: '/dashboard/employee/performance',icon: Target,     label: 'Performance'  },
      { to: '/dashboard/employee/leaves',     icon: Calendar,   label: 'Leaves'       },
      { to: '/dashboard/employee/profile',    icon: User,       label: 'My Profile'   },
    ]},
  ],
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { sidebarOpen, sidebarCollapsed } = useSelector((s) => s.ui);
  const { unreadCount } = useSelector((s) => s.notifications);

  const navItems = NAV_CONFIG[user?.role] || NAV_CONFIG.employee;

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => navigate('/login'));
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={clsx(
            'fixed left-0 top-0 h-full z-30 flex flex-col',
            'bg-surface-900 border-r border-white/5',
            'transition-all duration-300',
            sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex-center flex-shrink-0 shadow-glow-primary">
              <Zap className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
                <p className="font-display font-bold text-sm text-white truncate">SmartHR Nexus</p>
                <p className="text-[10px] text-slate-500 truncate">AI Workforce Platform</p>
              </motion.div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 no-scrollbar space-y-4">
            {navItems.map((group) => (
              <div key={group.group}>
                {!sidebarCollapsed && (
                  <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                    {group.group}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to.split('/').length <= 3}
                        className={({ isActive }) =>
                          clsx('nav-link', isActive && 'active', sidebarCollapsed && 'justify-center px-2')
                        }
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User footer */}
          <div className="border-t border-white/5 p-2 flex-shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role?.replace(/_/g, ' ')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-danger-400 transition-colors p-1"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex-center p-2.5 text-slate-500 hover:text-danger-400 hover:bg-danger-500/10 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => dispatch(toggleSidebarCollapse())}
              className="hidden lg:flex w-full items-center justify-center mt-1 p-2 text-slate-600 hover:text-slate-300 hover:bg-white/5 rounded-xl transition-all text-xs gap-1"
            >
              {sidebarCollapsed
                ? <ChevronRight className="w-3.5 h-3.5" />
                : <><ChevronLeft className="w-3.5 h-3.5" /><span>Collapse</span></>
              }
            </button>

            {/* Developer credit */}
            {!sidebarCollapsed && (
              <p className="px-2 pt-1.5 pb-0.5 text-center text-[10px] text-slate-600 truncate">
                Developed by <span className="text-slate-400">{DEVELOPER_NAME}</span>
              </p>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
