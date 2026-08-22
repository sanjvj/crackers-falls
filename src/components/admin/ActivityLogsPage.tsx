import React, { useState } from 'react';
import { Clock, Search, ShieldCheck, Filter, UserCheck, RefreshCw } from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { ActivityLogItem } from '../../types';

export const ActivityLogsPage: React.FC = () => {
  const { data: logs, loading } = useFirestoreCollection<ActivityLogItem>('activity_logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = logs
    .filter(log => {
      const matchSearch =
        !searchTerm ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchAction =
        actionFilter === 'All' ||
        (log.action && log.action.toLowerCase().includes(actionFilter.toLowerCase()));

      return matchSearch && matchAction;
    })
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

  const getActionBadgeColor = (action: string) => {
    const act = (action || '').toLowerCase();
    if (act.includes('create') || act.includes('add')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (act.includes('update') || act.includes('edit')) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    if (act.includes('delete') || act.includes('remove')) return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    if (act.includes('pos') || act.includes('sale')) return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
    return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Clock size={16} />
            <span>Audit Trail & Security Log</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">System Activity Logs</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Live operational audit stream of all admin sales, catalog updates, stock edits, and system actions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-leaf-400/20 text-leaf-400 border border-leaf-400/40 rounded-full text-xs font-bold flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{logs.length} Audit Records</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-paper-500" size={15} />
          <input
            type="text"
            placeholder="Search by action, details, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ink-900 border border-paper-50/15 text-white pl-11 pr-4 py-2.5 rounded-full text-xs outline-none focus:border-gold-400 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
          {['All', 'Create', 'Update', 'Delete', 'POS'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
                actionFilter === act
                  ? 'bg-gold-400 text-ink-950 border-gold-400 shadow-[0_0_16px_rgba(242,194,48,0.35)]'
                  : 'bg-ink-900/60 text-paper-300 border-paper-50/20 hover:border-gold-400/50 hover:text-gold-300'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-ink-900 rounded-3xl border border-paper-50/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-paper-50/10 bg-ink-950/60 text-paper-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Log Details</th>
                <th className="p-4">User Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-50/5">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-paper-50/5 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-paper-300 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Just now'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getActionBadgeColor(log.action)}`}>
                        {log.action || 'System Action'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-white max-w-md break-words">
                      {log.details}
                    </td>
                    <td className="p-4 text-paper-300 font-semibold whitespace-nowrap flex items-center gap-1.5">
                      <UserCheck size={14} className="text-gold-400 shrink-0" />
                      <span>{log.user_email || 'ajsolutionsmd@gmail.com'}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-paper-400 space-y-2">
                    <RefreshCw size={28} className="mx-auto text-gold-400 opacity-60 animate-spin" />
                    <p className="font-bold text-sm text-white">No activity logs match your filter.</p>
                    <p className="text-xs text-paper-500">System actions will automatically appear here in real-time as users perform operations.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
