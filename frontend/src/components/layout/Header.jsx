import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { logoutUser, selectUser } from '@/store/slices/authSlice';
import { markAllRead } from '@/store/slices/notificationSlice';
import clsx from 'clsx';
import { formatDateIN, financialYearLabel } from '@/utils/india';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { unreadCount, list: notifications } = useSelector((s) => s.notifications);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin:    'Super Admin',
      admin:          'Admin',
      senior_manager: 'Senior Manager',
      hr_recruiter:   'HR Recruiter',
      employee:       'Employee',
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin:    'badge-danger',
      admin:          'badge-primary',
      senior_manager: 'badge-warning',
      hr_recruiter:   'badge-accent',
      employee:       'badge-neutral',
    };
    return colors[role] || 'badge-neutral';
  };

  return (
    <header className="h-16 bg-surface-900/80 backdrop-blur-sm border-b border-white/5 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
      {/* Sidebar toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="btn-ghost p-2"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search employees, jobs, reports..."
          className="w-full bg-surface-800/60 border border-white/10 text-slate-300 placeholder-slate-600
                     rounded-xl pl-10 pr-4 py-2 text-sm transition-all duration-200
                     focus:outline-none focus:border-primary-500/50 focus:bg-surface-800"
        />
        {searchQuery && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 bg-surface-700 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Today (IST) · Indian financial year */}
        <span className="hidden lg:inline text-[11px] text-slate-500 mr-1 whitespace-nowrap">
          {formatDateIN(new Date())} · IST · {financialYearLabel()}
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="btn-ghost p-2 relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-white text-[9px] font-bold rounded-full flex-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-surface-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="flex-between px-4 py-3 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllRead())}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex-center flex-col gap-2 py-10 text-slate-500">
                      <Bell className="w-6 h-6 opacity-30" />
                      <p className="text-xs">No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((n, i) => (
                      <div
                        key={i}
                        className={clsx(
                          'px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer',
                          !n.read && 'bg-primary-500/5'
                        )}
                      >
                        <p className="text-xs text-slate-300 leading-relaxed">{n.message || n.text}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{n.time || 'Just now'}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-white leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{getRoleLabel(user?.role)}</p>
            </div>
            <ChevronDown className={clsx('w-3 h-3 text-slate-500 transition-transform', showUserMenu && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 bg-surface-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs font-medium text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{user?.email}</p>
                  <span className={clsx('badge mt-2 text-[10px]', getRoleBadgeColor(user?.role))}>
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { navigate('/dashboard/employee/profile'); setShowUserMenu(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <User className="w-3.5 h-3.5" /> My Profile
                  </button>
                  <button
                    onClick={() => { navigate('/dashboard/admin/settings'); setShowUserMenu(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <hr className="border-white/5 my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-danger-400 hover:bg-danger-500/10 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
