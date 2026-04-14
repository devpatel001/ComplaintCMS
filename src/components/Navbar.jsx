import React, { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  List,
  Shield,
  Menu,
  X,
  LogOut,
  LogIn,
  Bell,
  User,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';

import { Brain } from 'lucide-react'; // Ensure Brain icon is imported above

const getNavItems = (currentUser) => {
  const items = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/submit', label: 'Submit Complaint', icon: FilePlus },
    { to: '/complaints', label: 'View Complaints', icon: List },
    { to: '/admin', label: 'Admin Panel', icon: Shield }
  ];

  if (currentUser?.role === 'admin') {
    items.push({ to: '/analytics', label: 'AI Deep Analytics', icon: Brain });
  }

  return items;
};

export default function Navbar() {
  const { currentUser, logout, notifications, markNotificationsAsRead } = useComplaints();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const myNotifications = React.useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => n.target === currentUser.email || (currentUser.role === 'admin' && n.target === 'admin'));
  }, [notifications, currentUser]);

  const unreadCount = myNotifications.filter(n => !n.read).length;

  const handleOpenNotifications = () => {
    setNotifMenuOpen(!notifMenuOpen);
    if (!notifMenuOpen && unreadCount > 0) {
      if (currentUser?.role === 'admin') markNotificationsAsRead('admin');
      markNotificationsAsRead(currentUser?.email);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="glass-strong fixed top-0 left-0 right-0 z-50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center glow-blue">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold gradient-text">ComplaintCMS</span>
                <span className="block text-xs text-slate-400 -mt-0.5 leading-none">AI-Powered Management</span>
              </div>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {getNavItems(currentUser).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              
              {/* Notifications Center */}
              {currentUser && (
                <div className="relative">
                  <button onClick={handleOpenNotifications} className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-900 rounded-full pulse-dot" />
                    )}
                  </button>
                  
                  {notifMenuOpen && (
                    <div className="absolute right-0 top-11 w-80 sm:w-96 glass rounded-2xl border border-slate-600/50 shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[400px]">
                      <div className="p-3 border-b border-slate-700/50 bg-slate-800/80 flex items-center justify-between">
                         <h3 className="text-sm font-bold text-white">Notifications Centre</h3>
                         <span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded-lg">{myNotifications.length} alerts</span>
                      </div>
                      <div className="overflow-y-auto p-2 space-y-2 flex-col">
                        {myNotifications.length === 0 ? (
                           <div className="text-center p-6 text-slate-500 text-sm">No new alerts to display.</div>
                        ) : (
                           myNotifications.map(n => (
                             <div key={n.id} className={`p-3 rounded-xl border flex flex-col text-left ${n.read ? 'bg-slate-800/40 border-slate-700/30 opacity-70' : 'bg-slate-800 border-slate-600/50'}`}>
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 
                                    ${n.type === 'critical' || n.type === 'escalation' ? 'text-rose-400' : ''}
                                    ${n.type === 'success' ? 'text-emerald-400' : ''}
                                    ${n.type === 'info' ? 'text-blue-400' : ''}
                                  `}>
                                    {n.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                             </div>
                           ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User menu */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600/50 hover:border-blue-500/40 transition-colors text-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-slate-200 font-medium">{currentUser.name}</span>
                    {currentUser.role === 'admin' && (
                      <span className="hidden sm:block text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
                        Admin
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-11 w-44 glass rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden animate-fade-in">
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/admin"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors btn-ripple"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:block">Sign In</span>
                </NavLink>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-700/50 animate-slide-up">
            <nav className="px-4 py-3 space-y-1">
              {getNavItems(currentUser).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
