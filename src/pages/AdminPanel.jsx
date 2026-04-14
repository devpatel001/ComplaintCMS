import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Shield, Search, Filter, CheckSquare, 
  ArrowDownUp, Trash2, Edit3, X, Check,
  Upload, MessageSquare, Briefcase, FileText,
  Download, Printer
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

const DEPARTMENTS = ['Unassigned', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Maintenance', 'Admin'];
const STATUSES = ['pending', 'in-progress', 'resolved', 'closed', 'rejected'];

export default function AdminPanel() {
  const { complaints, currentUser, updateComplaint, updateMultipleComplaints, deleteComplaint, addNote } = useComplaints();
  
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Bulk action states
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkDepartment, setBulkDepartment] = useState('');

  // Active modal state: { type: 'edit' | 'resolve', complaintId: string }
  const [activeModal, setActiveModal] = useState(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/admin" />;
  }

  // Sorting and Filtering
  const filtered = useMemo(() => {
    let result = [...complaints];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.id.toLowerCase().includes(q) ||
        c.submittedBy.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aKey = a[sortConfig.key];
      let bKey = b[sortConfig.key];

      if (sortConfig.key === 'priority') {
        const pOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        aKey = pOrder[aKey] || 0;
        bKey = pOrder[bKey] || 0;
      } else if (sortConfig.key === 'createdAt') {
        aKey = new Date(aKey).getTime();
        bKey = new Date(bKey).getTime();
      }

      if (aKey < bKey) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aKey > bKey) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [complaints, search, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filtered.map(c => c.id));
    else setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const applyBulkStatus = () => {
    if (!bulkStatus || selectedIds.length === 0) return;
    updateMultipleComplaints(selectedIds, { status: bulkStatus });
    setBulkStatus('');
    setSelectedIds([]);
  };

  const applyBulkDepartment = () => {
    if (!bulkDepartment || selectedIds.length === 0) return;
    updateMultipleComplaints(selectedIds, { assignedTo: bulkDepartment });
    setBulkDepartment('');
    setSelectedIds([]);
  };

  const deleteSelected = () => {
    if (window.confirm(`Delete ${selectedIds.length} records?`)) {
      selectedIds.forEach(id => deleteComplaint(id));
      setSelectedIds([]);
    }
  };

  const exportToCSV = () => {
    if (filtered.length === 0) return;
    
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Department', 'Created At'];
    
    const csvContent = [
      headers.join(','),
      ...filtered.map(c => [
        c.id,
        `"${c.title.replace(/"/g, '""')}"`,
        c.category,
        c.priority,
        c.status,
        `"${c.submittedBy}"`,
        c.department || c.studentDepartment || 'Unassigned',
        new Date(c.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `complaints_export_${new Date().toLocaleDateString().replace(/\//g,'-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen animated-bg p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 animate-slide-left">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              Admin Operations Panel
            </h1>
            <p className="text-slate-400 mt-1">Manage, categorize, and resolve incoming infrastructure and academic complaints.</p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="glass rounded-t-2xl p-4 border-b border-slate-700/50 flex flex-wrap gap-4 items-center justify-between animate-slide-up bg-slate-800/40">
           <div className="flex flex-wrap items-center gap-4 flex-1">
             <div className="relative flex-1 min-w-[250px] max-w-md">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
               <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search ticket IDs, names, contexts..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
               />
             </div>
             <div className="flex gap-2">
                <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-xs font-medium">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-xs font-medium">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
             </div>
           </div>
           
           {selectedIds.length > 0 && (
             <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
               <span className="text-blue-300 text-sm font-semibold mr-2">{selectedIds.length} Selected</span>
               
               <select 
                 value={bulkStatus}
                 onChange={e => setBulkStatus(e.target.value)}
                 className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white"
               >
                 <option value="" disabled>Change Status...</option>
                 {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
               </select>
               <button onClick={applyBulkStatus} className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40"><Check className="w-3.5 h-3.5" /></button>

               <select 
                 value={bulkDepartment}
                 onChange={e => setBulkDepartment(e.target.value)}
                 className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-xs text-white ml-2"
               >
                 <option value="" disabled>Assign Dept...</option>
                 {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
               <button onClick={applyBulkDepartment} className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40"><Check className="w-3.5 h-3.5" /></button>

               <button onClick={deleteSelected} className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/40 ml-2">
                 <Trash2 className="w-3.5 h-3.5" />
               </button>
             </div>
           )}
        </div>

        {/* Data Table */}
        <div className="glass rounded-b-2xl overflow-x-auto border border-t-0 border-slate-700/50 animate-slide-up">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 w-12">
                  <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={handleSelectAll} className="rounded border-slate-500 bg-slate-800 accent-blue-500" />
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('id')}>
                  ID <ArrowDownUp className="w-3 h-3 inline ml-1 opacity-50" />
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
                  Details <ArrowDownUp className="w-3 h-3 inline ml-1 opacity-50" />
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('priority')}>
                  Priority <ArrowDownUp className="w-3 h-3 inline ml-1 opacity-50" />
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                  Status <ArrowDownUp className="w-3 h-3 inline ml-1 opacity-50" />
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('assignedTo')}>
                  Team Assignment <ArrowDownUp className="w-3 h-3 inline ml-1 opacity-50" />
                </th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filtered.map(complaint => (
                <tr key={complaint.id} className="hover:bg-slate-700/20 transition-colors group">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedIds.includes(complaint.id)} onChange={() => handleSelect(complaint.id)} className="rounded border-slate-500 bg-slate-800 accent-blue-500" />
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-400">{complaint.id}</td>
                  <td className="p-4">
                    <p className="text-white font-medium mb-1 truncate max-w-xs">{complaint.title}</p>
                    <p className="text-xs text-slate-500">By {complaint.submittedBy} • {complaint.category}</p>
                  </td>
                  <td className="p-4"><PriorityBadge priority={complaint.priority} /></td>
                  <td className="p-4">
                     <select 
                       value={complaint.status} 
                       onChange={(e) => updateComplaint(complaint.id, { status: e.target.value })}
                       className="bg-transparent text-xs font-semibold appearance-none cursor-pointer border border-slate-600 rounded px-2 py-1 outline-none"
                     >
                        {STATUSES.map(s => <option key={s} value={s} className="bg-slate-800 text-slate-200">{s.toUpperCase()}</option>)}
                     </select>
                  </td>
                  <td className="p-4">
                     <select 
                       value={complaint.assignedTo || 'Unassigned'} 
                       onChange={(e) => updateComplaint(complaint.id, { assignedTo: e.target.value })}
                       className={`text-xs appearance-none cursor-pointer border rounded-md px-2 py-1 outline-none font-medium ${complaint.assignedTo && complaint.assignedTo !== 'Unassigned' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-transparent border-slate-600 text-slate-400'}`}
                     >
                        {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-800 text-slate-200">{d}</option>)}
                     </select>
                  </td>
                  <td className="p-4 text-right space-x-2">
                     <button onClick={() => setActiveModal({ type: 'edit', complaint })} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="Add updates / internal notes">
                       <MessageSquare className="w-4 h-4" />
                     </button>
                     <button onClick={() => setActiveModal({ type: 'resolve', complaint })} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors" title="Resolve & Upload File">
                       <CheckSquare className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan="7" className="p-8 text-center text-slate-500">No complaints found matching current metrics.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modals overlay */}
        {activeModal && <AdminModal modalState={activeModal} onClose={() => setActiveModal(null)} updateComplaint={updateComplaint} addNote={addNote} />}
      </div>
    </div>
  );
}

// Inline component logic for modal panels
function AdminModal({ modalState, onClose, updateComplaint, addNote }) {
  const { type, complaint } = modalState;
  const [internalNote, setInternalNote] = useState('');
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const submitResolve = () => {
    updateComplaint(complaint.id, { 
       status: 'resolved',
       resolutionMessage: resolutionMessage || 'Resolved manually by administrator.',
       resolutionAttachment: fileUrl ? fileUrl : null
    });
    // Record into audit notes as well for legacy fallback tracking
    addNote(complaint.id, `RESOLVED: ${resolutionMessage || 'Manual resolution.'}`);
    onClose();
  };

  const submitNote = () => {
    if (!internalNote.trim()) return;
    addNote(complaint.id, `UPDATE: ${internalNote}`);
    setInternalNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        {type === 'edit' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Briefcase className="text-blue-400 w-5 h-5"/> Case Processing</h3>
            <p className="text-slate-400 text-xs mb-5 border-b border-slate-700 pb-3">{complaint.id} - {complaint.title}</p>
            
            <label className="text-xs text-slate-400 uppercase font-semibold mb-2 block">Add Audit Note / Internal Comment</label>
            <textarea 
              className="w-full h-32 bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500"
              placeholder="Record steps taken, vendor updates, cross-department comms..."
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm">Cancel</button>
              <button onClick={submitNote} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 text-sm">Append to Audit Log</button>
            </div>
          </div>
        )}

        {type === 'resolve' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><CheckSquare className="text-emerald-400 w-5 h-5"/> Finalize Resolution</h3>
            <p className="text-slate-400 text-xs mb-5 border-b border-slate-700 pb-3">Closing context for {complaint.id}</p>
            
            <label className="text-xs text-slate-400 uppercase font-semibold mb-2 block">Resolution Summary / Note passed to User</label>
            <textarea 
              className="w-full h-24 bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-emerald-500"
              placeholder="Inform the student exactly how the issue was fixed..."
              value={resolutionMessage}
              onChange={e => setResolutionMessage(e.target.value)}
            />

            <label className="text-xs text-slate-400 uppercase font-semibold mb-2 flex items-center gap-1.5"><Upload className="w-3.5 h-3.5"/> Upload Evidence / Receipt [Mock]</label>
            <input 
              className="w-full py-2.5 px-3 bg-slate-800/50 border border-slate-600 rounded-xl text-xs text-slate-300 mb-6 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-500/20 file:text-emerald-400 flex items-center"
              type="file"
              onChange={(e) => setFileUrl(e.target.files[0] ? `mock-url-path-${e.target.files[0].name}` : '')}
            />

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm">Cancel</button>
              <button onClick={submitResolve} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20 text-sm">Mark Resolved</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
