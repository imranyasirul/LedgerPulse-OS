"use client";

import { useState } from "react";
import { ShieldCheck, X, UserCheck, Lock, Eye } from "lucide-react";
import { UserRole, UserSession } from "@/types/analytics";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onAuthenticated: (user: UserSession) => void;
}

const ROLE_PRESETS: {
  role: UserRole;
  title: string;
  name: string;
  email: string;
  permissions: string;
  icon: typeof ShieldCheck;
}[] = [
  {
    role: "OWNER",
    title: "Workspace Owner (Admin)",
    name: "Yasirul Islam Imran",
    email: "imran@aurabi.io",
    permissions: "Full access: Import, Purge DB, View API Keys & AI Analyst",
    icon: ShieldCheck,
  },
  {
    role: "ANALYST",
    title: "Business Data Analyst",
    name: "Sanjana Rahman",
    email: "analyst@aurabi.io",
    permissions: "Can import CSV/Excel & export reports. API keys & DB purge locked",
    icon: UserCheck,
  },
  {
    role: "VIEWER",
    title: "Store Staff (Read-Only)",
    name: "Siam Ahmed",
    email: "staff@aurabi.io",
    permissions: "Read-only executive metrics. Imports, edits & API keys disabled",
    icon: Eye,
  },
];

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onAuthenticated,
}: AuthModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const submitSession = async (targetUser: UserSession) => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetUser),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onAuthenticated(data.user);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">
                Enterprise Identity & RBAC Access Control
              </h2>
              <p className="text-xs text-slate-400">
                Switch workspace roles to test server-enforced permissions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* দ্রুত ভূমিকা পরিবর্তনের কার্ডসমূহ */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              One-Click Role Profiles
            </p>
            <div className="space-y-2.5">
              {ROLE_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isCurrent = currentUser.role === preset.role;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      submitSession({
                        name: preset.name,
                        email: preset.email,
                        role: preset.role,
                      })
                    }
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? "border-blue-600 bg-blue-50/70"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-900 text-white rounded-lg mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {preset.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {preset.permissions}
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* কাস্টম সেশন ফর্ম */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSession({ name, email, role });
            }}
            className="pt-4 border-t border-slate-200 space-y-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Custom Executive Sign-In
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work Email"
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              >
                <option value="OWNER">Role: OWNER</option>
                <option value="ANALYST">Role: ANALYST</option>
                <option value="VIEWER">Role: VIEWER</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                {saving ? "Applying Session..." : "Save Session"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}