import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Brain, Activity, TrendingUp, AlertTriangle, Lightbulb, 
  Target, Layers, Zap, Loader2, Gauge, AlertCircle, Printer
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { generateDeepAnalytics } from '../services/geminiService';

export default function AiAnalytics() {
  const { complaints, currentUser } = useComplaints();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await generateDeepAnalytics(complaints);
        if (data) {
          setAnalytics(data);
        } else {
          setError('Failed to securely generate Deep Analytics. Check your Gemini API connection.');
        }
      } catch (err) {
        setError('Runtime execution error generating analytics layer.');
      }
      setLoading(false);
    };

    // Load natively on mount if complaints dataset exists
    if (complaints.length > 0) {
      fetchAnalytics();
    } else {
      setLoading(false);
      setError('Insufficient data available in repository to run AI deep analysis.');
    }
  }, [complaints]);

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="relative">
             <div className="w-20 h-20 border-4 border-violet-500/30 rounded-full"></div>
             <Loader2 className="w-20 h-20 text-violet-400 animate-spin absolute top-0 left-0" />
           </div>
           <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Gemini Analyzing Macro-Trends...</h2>
           <p className="text-slate-500 text-sm">Evaluating systemic root causes across all incident nodes.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center border-rose-500/30">
           <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
           <p className="text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen animated-bg p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Exec Summary */}
        <div className="glass rounded-3xl p-8 border border-violet-500/20 relative overflow-hidden animate-slide-up">
           <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
           
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 relative z-10 gap-4">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                 <Brain className="w-6 h-6 text-white" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-white tracking-tight">Gemini Strategy & Analytics</h1>
                 <p className="text-violet-300 text-sm">Deep Systemic Intelligence Report</p>
               </div>
             </div>
             
             <button onClick={handlePrintPdf} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-medium rounded-xl transition-colors shadow-lg shadow-black/20 text-sm">
                <Printer className="w-4 h-4" /> Export Report (PDF)
             </button>
           </div>

           <div className="relative z-10  border-l-4 border-violet-500 pl-4 py-1">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Executive Summary</h3>
             <p className="text-slate-200 text-sm leading-relaxed sm:text-base">{analytics.summaryReport}</p>
           </div>
        </div>

        {/* Dynamic Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Patterns Detection */}
           <div className="glass rounded-2xl p-6 border border-slate-700/50 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-semibold text-white flex items-center gap-2"><TrendingUp className="text-amber-400 w-5 h-5"/> Macro Resolution Patterns</h2>
                 <span className="bg-amber-400/10 text-amber-400 text-xs px-2 py-1 rounded-md font-medium border border-amber-400/20">Trending Anomalies</span>
              </div>
              <div className="space-y-4">
                 {analytics.patterns?.map((p, idx) => (
                    <div key={idx} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                       <p className="text-slate-200 text-sm font-medium mb-3">{p.pattern}</p>
                       <div className="flex items-center gap-4 text-xs font-semibold">
                          <span className={`${p.severity.toLowerCase().includes('critical') || p.severity.toLowerCase().includes('high') ? 'text-rose-400' : 'text-blue-400'}`}>
                            Severity: {p.severity}
                          </span>
                          <span className="text-slate-400 hidden sm:inline">•</span>
                          <span className={`${p.frequency.toLowerCase().includes('high') ? 'text-amber-400' : 'text-slate-400'}`}>
                            Freq: {p.frequency}
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Root Cause Extractor */}
           <div className="glass rounded-2xl p-6 border border-slate-700/50 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Target className="text-rose-400 w-5 h-5"/> Root Cause Diagnostics</h2>
                 <span className="bg-rose-400/10 text-rose-400 text-xs px-2 py-1 rounded-md font-medium border border-rose-400/20">Systemic Faults</span>
              </div>
              <div className="space-y-4">
                 {analytics.rootCauses?.map((cause, idx) => (
                    <div key={idx} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 relative overflow-hidden group">
                       <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1 border-b border-slate-700 pb-1 flex justify-between">
                         Traced Symptom <span className="text-emerald-400 font-normal">Confidence: {cause.confidence}%</span>
                       </p>
                       <p className="text-slate-200 text-sm mb-3 mt-2 font-medium">{cause.issue}</p>
                       <p className="text-rose-300 text-sm italic bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 flex items-start gap-2">
                         <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {cause.cause}
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Preventative Strategies */}
        <div className="glass rounded-2xl p-6 border border-emerald-500/20 animate-slide-up" style={{ animationDelay: '300ms' }}>
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Lightbulb className="text-emerald-400 w-6 h-6"/> AI Mitigation Recommendations</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.recommendations?.map((rec, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold shadow-lg shadow-emerald-500/10">
                     {idx + 1}
                   </div>
                   <div>
                     <p className="text-slate-200 text-sm mb-3 leading-relaxed">{rec.action}</p>
                     <div className="flex gap-3 text-[11px] uppercase tracking-wider font-bold">
                       <span className="bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">Impact: {rec.impact}</span>
                       <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">Effort: {rec.effort}</span>
                     </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Department Bottlenecks */}
        <div className="glass rounded-2xl p-6 border border-slate-700/50 animate-slide-up mb-8" style={{ animationDelay: '400ms' }}>
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Layers className="text-cyan-400 w-5 h-5"/> Operational Bottleneck Audit</h2>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.departmentMetrics?.map((dept, idx) => (
                 <div key={idx} className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 hover:-translate-y-1 transition-transform">
                   <div className="flex justify-between items-center mb-3">
                     <p className="text-slate-200 font-semibold">{dept.department}</p>
                     <p className={`text-sm font-bold flex items-center gap-1 ${parseInt(dept.performanceScore) > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                       <Gauge className="w-4 h-4"/> {dept.performanceScore}
                     </p>
                   </div>
                   <p className="text-slate-400 text-xs bg-slate-900/50 p-2 rounded-lg mt-2">
                     <strong className="text-slate-300 block mb-1 uppercase tracking-wide text-[10px]">Identified Constraint:</strong>
                     {dept.bottleneck}
                   </p>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
