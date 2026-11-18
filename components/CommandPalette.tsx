"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  Table2,
  Webhook,
  Bot,
  PlusCircle,
  Moon,
  Sun,
  FileSpreadsheet,
  Store,
  X,
} from "lucide-react";
import { ActiveTab } from "./Sidebar";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAi: () => void;
  onOpenQuickAdd: () => void;
  onExportCsv: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  stores: string[];
  onSelectStore: (store: string) => void;
  canEdit: boolean;
}

interface CommandAction {
  id: string;
  label: string;
  group: string;
  shortcut?: string;
  icon: typeof LayoutDashboard;
  onSelect: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onTabChange,
  onOpenAi,
  onOpenQuickAdd,
  onExportCsv,
  isDark,
  onToggleDark,
  stores,
  onSelectStore,
  canEdit,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleClose = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  const actions = useMemo<CommandAction[]>(() => {
    const base: CommandAction[] = [
      {
        id: "theme",
        label: isDark
          ? "Switch to Crisp Light Mode"
          : "Switch to Obsidian Dark Mode",
        group: "Appearance",
        shortcut: "Theme",
        icon: isDark ? Sun : Moon,
        onSelect: () => {
          onToggleDark();
          handleClose();
        },
      },
      {
        id: "ai",
        label: "Ask AI Executive Data Analyst",
        group: "Intelligence",
        shortcut: "AI",
        icon: Bot,
        onSelect: () => {
          handleClose();
          onOpenAi();
        },
      },
      ...(canEdit
        ? [
            {
              id: "quick-add",
              label: "Record New Sale Transaction",
              group: "Quick Actions",
              shortcut: "+ Sale",
              icon: PlusCircle,
              onSelect: () => {
                handleClose();
                onOpenQuickAdd();
              },
            },
          ]
        : []),
      {
        id: "export",
        label: "Export Filtered Dataset as CSV",
        group: "Quick Actions",
        shortcut: "CSV",
        icon: FileSpreadsheet,
        onSelect: () => {
          onExportCsv();
          handleClose();
        },
      },
      {
        id: "nav-overview",
        label: "Go to Executive Overview",
        group: "Navigation",
        icon: LayoutDashboard,
        onSelect: () => {
          onTabChange("overview");
          handleClose();
        },
      },
      {
        id: "nav-forecast",
        label: "Go to Forecasting & Pareto 80/20",
        group: "Navigation",
        icon: TrendingUp,
        onSelect: () => {
          onTabChange("forecasting");
          handleClose();
        },
      },
      {
        id: "nav-ledger",
        label: "Go to Audited Financial Ledger",
        group: "Navigation",
        icon: Table2,
        onSelect: () => {
          onTabChange("ledger");
          handleClose();
        },
      },
      {
        id: "nav-webhooks",
        label: "Go to Live Webhook API Pipeline",
        group: "Navigation",
        icon: Webhook,
        onSelect: () => {
          onTabChange("webhooks");
          handleClose();
        },
      },
      ...stores.map((st) => ({
        id: `store-${st}`,
        label: `Filter Workspace: ${st === "All" ? "All Business Units" : st}`,
        group: "Workspaces",
        icon: Store,
        onSelect: () => {
          onSelectStore(st);
          handleClose();
        },
      })),
    ];

    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [
    isDark,
    onToggleDark,
    handleClose,
    onOpenAi,
    canEdit,
    onOpenQuickAdd,
    onExportCsv,
    onTabChange,
    stores,
    onSelectStore,
    query,
  ]);

  const activeIndex =
    actions.length > 0 ? Math.min(selectedIndex, actions.length - 1) : 0;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          actions.length > 0 ? (prev + 1) % actions.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          actions.length > 0 ? (prev - 1 + actions.length) % actions.length : 0
        );
      } else if (e.key === "Enter" && actions[activeIndex]) {
        e.preventDefault();
        actions[activeIndex].onSelect();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, actions, activeIndex, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, workspace, or action..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {actions.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">
              No matching commands found.
            </p>
          ) : (
            actions.map((item, idx) => {
              const Icon = item.icon;
              const active = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.onSelect}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        active ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                      active
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {item.shortcut || item.group}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Use ↑↓ arrows to navigate, Enter to select</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
}