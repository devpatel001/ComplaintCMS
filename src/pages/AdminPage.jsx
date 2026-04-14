import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertTriangle, Key } from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import AdminPanel from './AdminPanel';

export default function AdminPage() {
  const { currentUser, login } = useComplaints();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (currentUser) {
    if (currentUser.role === 'admin') {
      return <AdminPanel />;
    } else {
      return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-6">You don't have administrative privileges.</p>
            <button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors" onClick={() => window.history.back()}>
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 max-w-md w-full animate-slide-up border border-slate-600/50">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-4 glow-blue">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Access</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage complaints</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-rose-300 text-sm leading-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white placeholder-slate-500 text-sm input-focus"
              placeholder="admin@cms.com"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-500" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white placeholder-slate-500 text-sm input-focus"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors btn-ripple glow-blue mt-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-slate-500 text-xs text-left mb-2 uppercase tracking-wider font-semibold">Demo Credentials</p>
          <div className="flex flex-col gap-1 text-sm text-slate-400 text-left bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <p>Admin: admin@cms.com / admin123</p>
            <p>User: john@example.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
