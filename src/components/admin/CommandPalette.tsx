"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calendar,
  Compass,
  Download,
  FileText,
  Globe,
  LayoutGrid,
  Megaphone,
  Moon,
  Ruler,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  UserCheck,
  UserCog,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface CommandItem {
  id: string;
  label: string;
  category: "Navigation" | "Quick Actions" | "System Controls";
  icon: any;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands: CommandItem[] = [
    {
      id: "nav-overview",
      label: "Go to Overview Dashboard",
      category: "Navigation",
      icon: LayoutGrid,
      action: () => {
        router.push("/overview");
        setOpen(false);
      },
    },
    {
      id: "nav-businesses",
      label: "Go to Business Management",
      category: "Navigation",
      icon: Building2,
      action: () => {
        router.push("/businesses");
        setOpen(false);
      },
    },

    {
      id: "nav-security",
      label: "Go to Security & Session Inspector",
      category: "Navigation",
      icon: ShieldCheck,
      action: () => {
        router.push("/logs/security");
        setOpen(false);
      },
    },
    {
      id: "nav-calendar",
      label: "Go to Renewal Calendar",
      category: "Navigation",
      icon: Calendar,
      action: () => {
        router.push("/subscriptions/calendar");
        setOpen(false);
      },
    },

    {
      id: "act-theme",
      label: `Toggle Theme (${theme === "dark" ? "Light Mode" : "Dark Mode"})`,
      category: "Quick Actions",
      icon: theme === "dark" ? Sun : Moon,
      action: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        toast.success(`Switched theme to ${theme === "dark" ? "Light" : "Dark"} Mode`);
        setOpen(false);
      },
    },
    {
      id: "act-tour",
      label: "Start Admin Platform Tour",
      category: "Quick Actions",
      icon: Compass,
      action: () => {
        window.dispatchEvent(new CustomEvent("ipos_trigger_admin_tour"));
        setOpen(false);
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!search.trim()) return true;
    const needle = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(needle) ||
      cmd.category.toLowerCase().includes(needle)
    );
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Command Palette Card */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl text-foreground">
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-5 py-4">
          <Search className="size-5 text-muted-foreground mr-3 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search page... (e.g. Security, Theme, Businesses)"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-[360px] overflow-y-auto p-3 space-y-1">
          {filteredCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                type="button"
                onClick={cmd.action}
                className="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-primary/10 hover:text-primary group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/20 transition">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{cmd.label}</p>
                    <p className="text-xs text-muted-foreground">{cmd.category}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-muted-foreground opacity-60">Press Enter ↵</span>
              </button>
            );
          })}

          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No matching admin command found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-2.5 text-xs text-muted-foreground bg-muted/30">
          <span>Navigate with <strong>↑ ↓</strong> and <strong>Enter</strong></span>
          <span className="rounded bg-muted px-2 py-0.5 font-bold">ESC to Close</span>
        </div>
      </div>
    </div>
  );
}
