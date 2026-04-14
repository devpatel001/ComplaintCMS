import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Zap,
  ArrowRight,
  Brain,
  RefreshCw,
  Timer,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { useComplaints } from '../context/ComplaintContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { getDashboardInsights } from '../services/geminiService';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
const STATUS_COLORS = {
  'Pending': '#f59e0b',
  'In Progress': '#06b6d4',
  'Resolved': '#10b981',
  'Rejected': '#f43f5e'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 border border-slate-600/50 text-sm">
        <p className="text-slate-300 font-medium mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color || entry.fill }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ title, value, icon: Icon, color, change, delay }) {
  return (
    <div className={`glass rounded-2xl p-5 card-hover animate-slide-up delay-${delay}`}
      style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { 
    complaints, 
    getStats, 
    getCategoryDistribution, 
    getMonthlyTrend, 
    getStatusDistribution, 
    getAverageResolutionTime 
  } = useComplaints();
  
  const [aiInsights, setAiInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  const stats = getStats();
  const categoryData = getCategoryDistribution();
  const trendData = getMonthlyTrend();
  const statusData = getStatusDistribution();
  const avgResolutionTime = getAverageResolutionTime();

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    setAiInsights('');
    const insights = await getDashboardInsights(stats);
    setAiInsights(insights);
    setLoadingInsights(false);
  };

  useEffect(() => {
    fetchInsights();
  }, [stats.total]);

  return (
    <div className="min-h-screen animated-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-left">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-blue-400" />
              Overview Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Real-time statistics & AI-powered resolution insights</p>
          </div>
          <Link
            to="/submit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium text-sm transition-all btn-ripple glow-blue"
          >
            <FileText className="w-4 h-4" />
            New Complaint
          </Link>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Complaints" value={stats.total} icon={FileText} color="#3b82f6" delay="100" />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="#f59e0b" delay="200" />
          <StatCard title="In Progress" value={stats.inProgress} icon={TrendingUp} color="#06b6d4" delay="300" />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="#10b981" change="+2 this week" delay="400" />
          <StatCard title="Avg Resolution" value={avgResolutionTime} icon={Timer} color="#8b5cf6" delay="500" />
        </div>

        {/* AI Insights Panel */}
        <div className="glass rounded-2xl p-6 mb-8 border border-violet-500/20 animate-slide-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Executive AI Insights</h3>
                <p className="text-slate-500 text-xs">Powered by Gemini Data Analyst</p>
              </div>
            </div>
            <button
              onClick={fetchInsights}
              disabled={loadingInsights}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors text-sm border border-violet-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {loadingInsights ? (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Analyzing complaint data with Gemini AI...</span>
            </div>
          ) : aiInsights ? (
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {aiInsights}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Click Refresh to get AI insights.</p>
          )}
        </div>

        {/* Upper Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Trend Chart */}
          <div className="lg:col-span-2 glass rounded-2xl p-6 animate-slide-up delay-400">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Monthly Volume Trend
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="submitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="submitted" stroke="#3b82f6" fill="url(#submitted)" strokeWidth={2} name="Submitted" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#resolved)" strokeWidth={2} name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Donut Pie */}
          <div className="glass rounded-2xl p-6 animate-slide-up delay-500">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-400" />
              Complaints by Status
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>{v}</span>} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lower Charts & List Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Category Bar Chart */}
          <div className="glass rounded-2xl p-6 animate-slide-up delay-500">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-amber-400" />
              Category Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="value" name="Complaints" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Complaints */}
          <div className="glass rounded-2xl p-6 animate-slide-up delay-600 flex flex-col max-h-[420px]">
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Recent Activity
              </h3>
              <Link to="/complaints" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {recentComplaints.map((complaint, i) => (
                <Link
                  key={complaint.id}
                  to="/complaints"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-700/40 transition-colors group border border-transparent hover:border-slate-600/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-blue-300 transition-colors">
                      {complaint.title}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">{complaint.submittedBy} · {complaint.category}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 hidden sm:flex">
                    <PriorityBadge priority={complaint.priority} />
                    <StatusBadge status={complaint.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
