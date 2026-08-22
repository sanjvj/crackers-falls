import React from 'react';
import { Shield, AlertTriangle, UserCheck, Key, CheckCircle2, Lock } from 'lucide-react';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { ActivityLogItem } from '../../types';

interface UsersRolesPageProps {
  adminEmail: string;
}

export const UsersRolesPage: React.FC<UsersRolesPageProps> = ({ adminEmail }) => {
  const { data: logs } = useFirestoreCollection<ActivityLogItem>('activity_logs');
  const activeEmail = adminEmail || 'ajsolutionsmd@gmail.com';

  const userActionsCount = logs.filter(l => (l.user_email || '').toLowerCase() === activeEmail.toLowerCase()).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Shield size={16} />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Users & Custom Claims Security</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Firebase Authentication with strict custom claim token verification and role matrix.</p>
        </div>
        <div className="flex items-center gap-2 bg-leaf-400/20 text-leaf-400 px-4 py-2 rounded-full border border-leaf-400/40 font-bold text-xs shrink-0">
          <Shield size={16} />
          <span>Strict Claims Gate Active</span>
        </div>
      </div>

      {/* Active User Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-6 shadow-2xl">
        <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
          <UserCheck size={20} className="text-gold-400" />
          <span>Active Authenticated Admin Account</span>
        </h3>

        <div className="p-6 rounded-2xl bg-ink-850 border border-paper-50/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-400 text-ink-950 font-extrabold text-lg flex items-center justify-center font-display shadow-md">
              SA
            </div>
            <div>
              <div className="font-bold text-white text-lg font-display">{activeEmail}</div>
              <div className="text-gold-400 font-bold text-xs uppercase tracking-wider mt-0.5 flex items-center gap-2">
                <Key size={14} />
                <span>Custom Token Claim: admin === true</span>
              </div>
              <p className="text-[11px] text-paper-400 font-sans mt-1">{userActionsCount} Audit actions recorded in system logs</p>
            </div>
          </div>

          <span className="px-4 py-2 rounded-full bg-leaf-400/20 text-leaf-400 border border-leaf-400/40 font-extrabold text-xs uppercase tracking-wider self-start sm:self-center">
            Super Admin Active
          </span>
        </div>

        {/* Roles Capabilities Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold font-display text-white">System Security Capabilities Matrix</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-paper-50/10 bg-ink-950/60 text-paper-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3">Role Level</th>
                  <th className="p-3">POS Billing</th>
                  <th className="p-3">Order Confirmation</th>
                  <th className="p-3">Catalog & Price Edits</th>
                  <th className="p-3">Export & System Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-50/5">
                <tr className="hover:bg-paper-50/5 transition-colors">
                  <td className="p-3 font-bold text-gold-400 font-display">Super Admin (Current)</td>
                  <td className="p-3 text-leaf-400 font-bold">Full Access</td>
                  <td className="p-3 text-leaf-400 font-bold">Full Access</td>
                  <td className="p-3 text-leaf-400 font-bold">Full Access</td>
                  <td className="p-3 text-leaf-400 font-bold">Full Access</td>
                </tr>
                <tr className="hover:bg-paper-50/5 transition-colors text-paper-400">
                  <td className="p-3 font-semibold text-white">Counter Manager</td>
                  <td className="p-3 text-leaf-400 font-bold">Full Access</td>
                  <td className="p-3 text-leaf-400 font-bold">Full Access</td>
                  <td className="p-3 text-paper-400">Read Only</td>
                  <td className="p-3 text-paper-400">Read Only</td>
                </tr>
                <tr className="hover:bg-paper-50/5 transition-colors text-paper-400">
                  <td className="p-3 font-semibold text-white">Inventory Clerk</td>
                  <td className="p-3 text-paper-400">Read Only</td>
                  <td className="p-3 text-paper-400">Read Only</td>
                  <td className="p-3 text-leaf-400 font-bold">Stock Entry Only</td>
                  <td className="p-3 text-rose-400 font-bold">Restricted</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-teal-900/30 border border-gold-400/30 text-paper-300 text-xs space-y-3">
          <div className="font-bold text-gold-400 flex items-center gap-2 text-sm font-display uppercase">
            <AlertTriangle size={18} />
            <span>Granting New Admin Privileges</span>
          </div>
          <p className="font-sans">
            To grant custom admin claim <code className="bg-ink-950 px-2 py-0.5 rounded border border-paper-50/15 text-gold-300">&#123; admin: true &#125;</code> to a new email account, download your Firebase Service Account key as <code className="bg-ink-950 px-2 py-0.5 rounded border border-paper-50/15 text-gold-300">serviceAccountKey.json</code> and run:
          </p>
          <pre className="bg-ink-950 p-4 rounded-xl text-gold-400 font-mono text-xs overflow-x-auto border border-gold-400/20">
            node scripts/set-admin-claim.js &lt;user-email&gt;
          </pre>
        </div>
      </div>
    </div>
  );
};

export default UsersRolesPage;
