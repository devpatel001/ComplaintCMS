import { useState, useMemo, useEffect } from 'react';
import {
  List,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Brain,
  MessageSquare,
  Clock,
  Trash2,
  Sparkles,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { generateResolutionSummary, performSemanticSearch, generateAutoResponseDraft } from '../services/geminiService';

const CATEGORIES = ['All', 'Academic', 'Infrastructure', 'Hostel', 'Canteen', 'Library', 'Administration', 'Sports', 'Other'];
const DEPARTMENTS = ['All', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Other'];
const STATUSES = ['All', 'pending', 'in-progress', 'resolved', 'rejected'];
const PRIORITIES = ['All', 'low', 'medium', 'high', 'critical'];
const DATE_RANGES = ['All Time', 'Last 7 Days', 'Last 30 Days'];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function SentimentBadge({ sentiment }) {
  if (!sentiment) return null;
  const colors = {
    'Positive': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Neutral': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Negative': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Critical': 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold animate-pulse'
  };
  const colorClass = colors[sentiment] || colors['Neutral'];
  
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 uppercase tracking-wider ${colorClass}`}>
      {sentiment === 'Critical' && <AlertTriangle className="w-2.5 h-2.5" />}
      {sentiment}
    </span>
  );
}

function ComplaintCard({ complaint, onDelete, currentUser, semanticReason, semanticScore }) {
  const [expanded, setExpanded] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [draft, setDraft] = useState('');
  const [loadingDraft, setLoadingDraft] = useState(false);
  const { addNote } = useComplaints();
  const [noteInput, setNoteInput] = useState('');

  const handleGenerateAi = async () => {
    if (aiSummary) return;
    setLoadingAi(true);
    const summary = await generateResolutionSummary(complaint);
    setAiSummary(summary);
    setLoadingAi(false);
  };
  
  const handleGenerateDraft = async () => {
    if (draft) return;
    setLoadingDraft(true);
    const generatedDraft = await generateAutoResponseDraft(complaint);
    setDraft(generatedDraft);
    setLoadingDraft(false);
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    addNote(complaint.id, `${new Date().toLocaleDateString()} – ${noteInput.trim()}`);
    setNoteInput('');
  };

  return (
    <div className={`glass rounded-2xl overflow-hidden card-hover animate-slide-up ${complaint.aiAnalysis?.sentiment === 'Critical' ? 'border-2 border-rose-500/30 bg-rose-500/5' : 'bg-slate-800/20'}`}>
      
      {semanticScore && (
        <div className="px-5 py-2 bg-gradient-to-r from-violet-600/20 to-blue-600/10 border-b border-violet-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wide">
            <Brain className="w-3.5 h-3.5" /> AI Match Detection
          </div>
          <p className="text-violet-300 text-xs bg-violet-500/20 px-2 py-0.5 rounded-md">Score: {semanticScore}%</p>
        </div>
      )}

      {/* Card Header */}
      <div className="p-4 sm:p-5 cursor-pointer relative" onClick={() => { setExpanded(!expanded); if (!expanded) handleGenerateAi(); }}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 border ${complaint.aiAnalysis?.sentiment === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-700/60 text-slate-400 border-slate-600/30'}`}>
            {complaint.id.split('-')[1]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-white font-semibold text-sm sm:text-base leading-snug truncate pr-2">
                {complaint.title}
              </h3>
              <ChevronRight className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </div>
            {semanticReason && (
              <p className="text-violet-300 text-sm mt-1 mb-2 italic">"{semanticReason}"</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <SentimentBadge sentiment={complaint.aiAnalysis?.sentiment} />
              <span className="text-cyan-400 text-xs px-2 py-0.5 bg-cyan-400/10 rounded-md border border-cyan-400/20">{complaint.category}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{complaint.submittedBy} {complaint.rollNumber ? `(${complaint.rollNumber})` : ''}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(complaint.createdAt)}</span>
              {complaint.aiAnalysis?.urgency && <span className="flex items-center gap-1 text-amber-500"><AlertTriangle className="w-3 h-3"/>{complaint.aiAnalysis.urgency} Urgency</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-700/50 p-4 sm:p-5 space-y-4 animate-fade-in bg-slate-900/40">

          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Issue Description</p>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{complaint.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-800/60 p-4 border border-slate-700/50">
              <p className="text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wide">Contact Identity</p>
              <p className="text-sm text-slate-300 flex items-center gap-2"><User className="w-3.5 h-3.5 text-blue-400" />{complaint.submittedBy} {complaint.rollNumber ? `(${complaint.rollNumber})` : ''}</p>
              <p className="text-sm text-slate-300 flex items-center gap-2 mt-1.5"><Mail className="w-3.5 h-3.5 text-blue-400" />{complaint.email}</p>
              {complaint.phone && <p className="text-sm text-slate-300 flex items-center gap-2 mt-1.5"><Phone className="w-3.5 h-3.5 text-blue-400" />{complaint.phone}</p>}
            </div>
            <div className="rounded-xl bg-slate-800/60 p-4 border border-slate-700/50">
              <p className="text-slate-400 text-xs mb-2 font-semibold uppercase tracking-wide">Tracking</p>
              <p className="text-sm text-slate-300">Submitted: {formatDate(complaint.createdAt)}</p>
              <p className="text-sm text-slate-300 mt-1.5">Last Edit: {formatDate(complaint.updatedAt)}</p>
            </div>
          </div>

          {/* AI Resolution Generator */}
          <div className="rounded-xl bg-gradient-to-r from-violet-500/10 to-transparent border border-violet-500/20 p-4">
            <p className="text-violet-300 text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Brain className="w-4 h-4" /> Resolution Context Generation
            </p>
            {aiSummary && <p className="text-slate-200 text-sm mb-2">{aiSummary}</p>}
            {loadingAi && (
              <div className="flex items-center gap-2 text-violet-400 text-sm">
                <div className="w-3.5 h-3.5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                Processing optimal summary via Gemini...
              </div>
            )}
          </div>
          
          {/* AI Auto-Response Generator */}
          {currentUser?.role === 'admin' && (
            <div className="rounded-xl bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20 p-4">
              <div className="flex items-center justify-between mb-3">
                 <p className="text-blue-400 text-xs font-medium uppercase tracking-wide flex items-center gap-1.5">
                   <Mail className="w-4 h-4" /> Student Support Auto-Response
                 </p>
                 {!draft && (
                   <button 
                     onClick={handleGenerateDraft} 
                     disabled={loadingDraft}
                     className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-500/50 text-blue-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-blue-500/30"
                   >
                     {loadingDraft ? <div className="w-3 h-3 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" /> : <Brain className="w-3 h-3" />}
                     Generate Draft
                   </button>
                 )}
              </div>
              {draft && (
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50 mt-2">
                   <p className="text-slate-300 text-sm whitespace-pre-line text-left leading-relaxed">
                     {draft}
                   </p>
                </div>
              )}
            </div>
          )}

          {/* Internal Notes */}
          {complaint.notes?.length > 0 && (
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">Audit Log</p>
              <div className="space-y-1.5 bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
                {complaint.notes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-xs leading-relaxed">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls (Admin) */}
          {currentUser?.role === 'admin' && (
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-600/50 text-white text-sm placeholder-slate-500 input-focus"
                  placeholder="Record internal update or note..."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <button
                  onClick={handleAddNote}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 border border-blue-500 text-white hover:bg-blue-500 transition-colors text-sm font-medium"
                >
                  Append
                </button>
              </div>
              <button
                onClick={() => onDelete(complaint.id)}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs transition-colors mt-4 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Record
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ViewComplaints() {
  const { complaints, deleteComplaint, currentUser } = useComplaints();
  
  // Standard Filter State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('All Time');
  const [sortBy, setSortBy] = useState('critical');
  const [showFilters, setShowFilters] = useState(false);

  // Gemini AI State
  const [useAiSearch, setUseAiSearch] = useState(false);
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [semanticMatches, setSemanticMatches] = useState([]); // [{id, relevanceScore, reason}]
  const [suggestedQueries, setSuggestedQueries] = useState(['Broken AC in Hostel', 'Fee receipt issue', 'Water leakage']);

  const executeSemanticSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return setSemanticMatches([]);
    
    setIsSearchingAi(true);
    const matches = await performSemanticSearch(search, complaints);
    setSemanticMatches(matches || []);
    setIsSearchingAi(false);
  };

  const filtered = useMemo(() => {
    let result = [...complaints];

    // AI Filtering Overlay
    if (useAiSearch && semanticMatches.length > 0) {
      result = semanticMatches.map(match => {
        const c = complaints.find(comp => comp.id === match.id);
        if (c) {
          return { ...c, _semanticScore: match.relevanceScore, _semanticReason: match.reason };
        }
        return null;
      }).filter(Boolean);
      
      result.sort((a, b) => b._semanticScore - a._semanticScore);
      return result; 
    }

    // Traditional local Filtering
    if (search && !useAiSearch) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.submittedBy.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'All') result = result.filter(c => c.status === filterStatus);
    if (filterCategory !== 'All') result = result.filter(c => c.category === filterCategory);
    if (filterDepartment !== 'All') result = result.filter(c => c.department === filterDepartment || (c.studentDepartment === filterDepartment));
    if (filterPriority !== 'All') result = result.filter(c => c.priority === filterPriority);
    
    if (filterDateRange !== 'All Time') {
      const now = new Date();
      result = result.filter(c => {
        const d = new Date(c.createdAt);
        if (filterDateRange === 'Last 7 Days') return (now - d) / (1000 * 60 * 60 * 24) <= 7;
        if (filterDateRange === 'Last 30 Days') return (now - d) / (1000 * 60 * 60 * 24) <= 30;
        return true;
      });
    }

    result.sort((a, b) => {
      // Prioritize Critical Sentiment immediately globally if sorting algorithm factors it
      if (sortBy === 'critical') {
        const aCrit = a.aiAnalysis?.sentiment === 'Critical' ? 1 : 0;
        const bCrit = b.aiAnalysis?.sentiment === 'Critical' ? 1 : 0;
        if (aCrit !== bCrit) return bCrit - aCrit; // critical goes to top
        const pOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      const pOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
    });

    return result;
  }, [complaints, search, filterStatus, filterCategory, filterDepartment, filterPriority, filterDateRange, sortBy, useAiSearch, semanticMatches]);

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('All');
    setFilterCategory('All');
    setFilterDepartment('All');
    setFilterPriority('All');
    setFilterDateRange('All Time');
    setSortBy('newest');
    setSemanticMatches([]);
  };

  const hasFilters = search || filterStatus !== 'All' || filterCategory !== 'All' || filterPriority !== 'All' || filterDepartment !== 'All' || filterDateRange !== 'All Time';

  return (
    <div className="min-h-screen animated-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-slide-left">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <List className="w-8 h-8 text-blue-400" />
              Complaints Repository
            </h1>
            <p className="text-slate-400 mt-1">Found {filtered.length} matching tracking records</p>
          </div>
        </div>

        {/* Smart Search Panel */}
        <div className="glass rounded-2xl p-2 mb-6 animate-slide-up border border-slate-600/50">
          <div className="flex gap-2">
            
            <form className="flex-1 relative" onSubmit={e => useAiSearch ? executeSemanticSearch(e) : e.preventDefault()}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="searchComplaints"
                value={search}
                onChange={e => { setSearch(e.target.value); if (useAiSearch && !e.target.value) setSemanticMatches([]); }}
                placeholder={useAiSearch ? "Describe what you're looking for (AI Semantic Search)..." : "Search ID, names, keywords..."}
                className={`w-full pl-10 pr-32 py-3 rounded-xl bg-slate-800/60 border text-sm placeholder-slate-500 input-focus transition-colors ${useAiSearch ? 'text-violet-200 border-violet-500/50 outline-none focus:ring-2 focus:ring-violet-500/50' : 'text-white border-slate-600/50'}`}
              />
              {useAiSearch && search && (
                <button
                  type="submit"
                  disabled={isSearchingAi}
                  className="absolute right-2 top-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isSearchingAi ? 'Scanning...' : 'Find Matches'}
                </button>
              )}
            </form>

            <button
              onClick={() => { setUseAiSearch(!useAiSearch); setSemanticMatches([]); }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap ${
                useAiSearch
                  ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                  : 'border-slate-600/50 bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Mode</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm transition-colors ${
                showFilters || hasFilters
                  ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                  : 'border-slate-600/50 bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </button>
          </div>

          {/* Quick AI Suggestions */}
          {useAiSearch && !search && (
            <div className="flex items-center gap-2 px-3 pt-3 pb-1 overflow-x-auto custom-scrollbar">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide whitespace-nowrap"><Sparkles className="w-3 h-3 inline mr-1" /> Try searching:</span>
              {suggestedQueries.map((query, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSearch(query)}
                  className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 whitespace-nowrap"
                >
                  {query}
                </button>
              ))}
            </div>
          )}

          {/* Advanced Filters Drawer */}
          {showFilters && !useAiSearch && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 animate-slide-up px-2 pb-2">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1 block">Status</label>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-600/50 text-white text-sm input-focus appearance-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'Any' : s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1 block">Category</label>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-600/50 text-white text-sm input-focus appearance-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'Any' : c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1 block">Target Dept.</label>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-600/50 text-white text-sm input-focus appearance-none" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? 'Any' : d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1 block">Priority</label>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-600/50 text-white text-sm input-focus appearance-none" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p === 'All' ? 'Any' : p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1 block">Date Range</label>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-600/50 text-white text-sm input-focus appearance-none" value={filterDateRange} onChange={e => setFilterDateRange(e.target.value)}>
                    {DATE_RANGES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-3 lg:col-span-5 flex justify-between items-center mt-2">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-600/50 text-slate-300 text-xs input-focus appearance-none cursor-pointer w-auto"
                  >
                    <option value="critical">Sort by: AI Priority (Critical First)</option>
                    <option value="newest">Sort by: Newest First</option>
                    <option value="oldest">Sort by: Oldest First</option>
                    <option value="priority">Sort by: Standard Priority</option>
                  </select>
                  {hasFilters && (
                    <button onClick={clearFilters} className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs transition-colors px-3 py-2 rounded-lg hover:bg-rose-500/10 text-right">
                      <X className="w-3.5 h-3.5" /> Sweep Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Complaints Listing */}
        {isSearchingAi && (
           <div className="glass rounded-2xl p-12 text-center animate-fade-in border border-violet-500/20 bg-violet-500/5">
              <Brain className="w-12 h-12 text-violet-500 mx-auto mb-4 animate-pulse" />
              <p className="text-violet-300 font-medium text-lg">Scanning entire database semantically...</p>
              <p className="text-violet-400/60 text-xs mt-2 italic">Gemini 1.5 Flash processing context patterns & finding duplicates.</p>
           </div>
        )}

        {!isSearchingAi && filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center animate-fade-in bg-slate-800/40 border border-slate-700/50">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium text-lg">No matching records</p>
            <p className="text-slate-500 text-sm mt-1">Expand parameters or reset active queries</p>
          </div>
        ) : !isSearchingAi ? (
          <div className="space-y-4">
            {filtered.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onDelete={deleteComplaint}
                currentUser={currentUser}
                semanticScore={complaint._semanticScore}
                semanticReason={complaint._semanticReason}
              />
            ))}
          </div>
        ) : null}

      </div>
    </div>
  );
}
