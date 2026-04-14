import { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'status-pending',
  },
  'in-progress': {
    label: 'In Progress',
    icon: TrendingUp,
    className: 'status-in-progress',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    className: 'status-resolved',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'status-rejected',
  },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'priority-low' },
  medium: { label: 'Medium', className: 'priority-medium' },
  high: { label: 'High', className: 'priority-high' },
  critical: { label: 'Critical', className: 'priority-critical' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${config.className}`}>
      {priority === 'critical' && <AlertTriangle className="w-3 h-3" />}
      {config.label}
    </span>
  );
}

export function StatusSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-slate-600/50 hover:border-blue-500/40 transition-colors text-sm cursor-pointer"
      >
        <StatusBadge status={value} />
        <span className="text-slate-400">▾</span>
      </button>
      {isOpen && (
        <div className="absolute top-9 left-0 z-50 w-40 glass rounded-xl border border-slate-600/50 shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-1">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => { onChange(key); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors text-sm"
              >
                <StatusBadge status={key} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
