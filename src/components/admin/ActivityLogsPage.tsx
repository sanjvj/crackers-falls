import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';

export const ActivityLogsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Clock size={16} />
            <span>Audit Trail &amp; Logging</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">System Activity Logs</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Audit log of admin catalog modifications and system actions.</p>
        </div>
      </div>

      <div className="bg-ink-900 p-8 rounded-3xl border border-paper-50/10 text-center py-16 text-paper-300 space-y-3 shadow-2xl">
        <ShieldCheck size={42} className="mx-auto text-leaf-400" />
        <h3 className="text-lg font-bold font-display text-white">Firestore Audit Trail Active</h3>
        <p className="max-w-md mx-auto text-xs font-sans">
          All product edits, status changes, and catalog updates are securely logged to the <code className="text-gold-400 font-mono font-bold">activity_logs</code> Firestore collection.
        </p>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
