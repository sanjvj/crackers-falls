import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface UsersRolesPageProps {
  adminEmail: string;
}

export const UsersRolesPage: React.FC<UsersRolesPageProps> = ({ adminEmail }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-paper-50">
      {/* Top Header Card */}
      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-gold-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-ember">
        <div>
          <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
            <Shield size={16} />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mt-1">Users &amp; Custom Claims Security</h1>
          <p className="text-xs text-paper-300 font-sans mt-1">Firebase Authentication with strict token verification.</p>
        </div>
        <div className="flex items-center gap-2 bg-leaf-400/20 text-leaf-400 px-4 py-2 rounded-full border border-leaf-400/40 font-bold text-xs shrink-0">
          <Shield size={16} />
          <span>Strict Claims Gate Active</span>
        </div>
      </div>

      <div className="bg-ink-900 p-6 sm:p-8 rounded-3xl border border-paper-50/10 space-y-5 shadow-2xl">
        <h3 className="text-lg font-bold font-display text-white">Active Authenticated Admin Account</h3>

        <div className="p-5 rounded-2xl bg-ink-850 border border-paper-50/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-400 text-ink-950 font-extrabold text-base flex items-center justify-center font-display shadow-md">
              SA
            </div>
            <div>
              <div className="font-bold text-white text-base font-display">{adminEmail || 'Owner Admin'}</div>
              <div className="text-gold-400 font-bold text-xs uppercase tracking-wider mt-0.5">Custom Claim: admin === true</div>
            </div>
          </div>

          <span className="px-4 py-1.5 rounded-full bg-leaf-400/20 text-leaf-400 border border-leaf-400/40 font-extrabold text-xs uppercase tracking-wider">
            Super Admin Active
          </span>
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
