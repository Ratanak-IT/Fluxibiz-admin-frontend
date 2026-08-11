"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Megaphone,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useGetBusinessesQuery } from "@/features/businessManagement/businessAdminApi";

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  priority: "INFO" | "WARNING" | "CRITICAL";
  targetScope: "ALL_MERCHANTS" | "RETAIL_SHOPS" | "RESTAURANTS";
  status: "ACTIVE" | "SCHEDULED" | "ARCHIVED";
  createdAt: string;
}

const STORAGE_KEY = "ipos_live_announcements_v1";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"INFO" | "WARNING" | "CRITICAL">("INFO");
  const [targetScope, setTargetScope] = useState<"ALL_MERCHANTS" | "RETAIL_SHOPS" | "RESTAURANTS">("ALL_MERCHANTS");

  const { data: businessData, isLoading: isBizLoading } = useGetBusinessesQuery(
    { page: 0, size: 200 },
    { pollingInterval: 5000 }
  );

  const totalMerchants = businessData?.content?.length ?? 0;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setAnnouncements(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveAnnouncements = (items: AnnouncementItem[]) => {
    setAnnouncements(items);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("ipos_announcements_updated"));
    }
  };

  const filtered = useMemo(() => {
    return announcements.filter((item) => {
      if (selectedPriority !== "ALL" && item.priority !== selectedPriority) return false;
      if (!keyword.trim()) return true;
      const needle = keyword.toLowerCase();
      return item.title.toLowerCase().includes(needle) || item.message.toLowerCase().includes(needle);
    });
  }, [announcements, selectedPriority, keyword]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message text.");
      return;
    }

    const newItem: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      priority,
      targetScope,
      status: "ACTIVE",
      createdAt: new Date().toLocaleString(),
    };

    const updated = [newItem, ...announcements];
    saveAnnouncements(updated);
    toast.success(`Merchant announcement dispatched to ${totalMerchants} active shops!`);
    setShowCreateModal(false);
    setTitle("");
    setMessage("");
  };

  const handleDelete = (id: string, name: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    saveAnnouncements(updated);
    toast.success(`Archived announcement: ${name}`);
  };

  const getPriorityBadge = (p: AnnouncementItem["priority"]) => {
    switch (p) {
      case "CRITICAL":
        return (
          <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:bg-red-500/20 dark:text-red-400">
            Critical Alert
          </span>
        );
      case "WARNING":
        return (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            System Warning
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            General Info
          </span>
        );
    }
  };

  return (
    <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 bg-background text-foreground">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <Link href="/dashboard" className="text-muted-foreground transition hover:text-foreground">
          Dashboard
        </Link>
        <span className="px-2 text-muted-foreground">/</span>
        <span className="text-foreground">Merchant Broadcast & Dispatcher</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl flex items-center gap-3">
            <Megaphone className="size-7 text-primary" />
            Merchant Broadcast & Direct Notification Dispatcher
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
            Dispatch priority platform announcements and notification banners directly to registered merchant dashboards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shrink-0"
        >
          <Plus className="size-4" />
          Create Broadcast
        </button>
      </div>

      {/* Metric Cards */}
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Broadcasts</span>
            <Megaphone className="size-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">{announcements.length}</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live API</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Dispatched platform notifications</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Merchant Audience</span>
            <Bell className="size-4 text-[#00932A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">{totalMerchants}</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">API Shops</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Registered merchant accounts</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Delivery Rate</span>
            <CheckCircle2 className="size-4 text-[#FEB90D]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-foreground">100%</p>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Instant Sync</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Real-time banner broadcast</p>
        </div>
      </div>

      {/* Search & Filter Bar (Units Style Flex) */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80 lg:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search announcement by title or content"
            className="w-full rounded-full border border-border bg-primary-foreground py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary dark:bg-background"
          />
        </div>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="rounded-full border border-border bg-primary-foreground px-4 py-2.5 text-xs font-semibold text-foreground outline-none transition focus:border-primary dark:bg-background cursor-pointer"
        >
          <option value="ALL">All Priorities</option>
          <option value="INFO">General Info</option>
          <option value="WARNING">System Warning</option>
          <option value="CRITICAL">Critical Alert</option>
        </select>
      </div>

      {/* Table Layout */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-4">Announcement Title</th>
                <th scope="col" className="px-6 py-4">Priority</th>
                <th scope="col" className="px-6 py-4">Target Scope</th>
                <th scope="col" className="px-6 py-4">Dispatched Date</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="transition hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground max-w-md truncate">{item.message}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getPriorityBadge(item.priority)}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-foreground">{item.targetScope}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{item.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="rounded-full p-2 text-destructive hover:bg-destructive/10 transition"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-muted-foreground">
                    No active announcements found. Click "Create Broadcast" to dispatch a new notification.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Broadcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Send className="size-5 text-primary" />
                Dispatch Merchant Announcement
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">Announcement Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled Bakong Payment Maintenance"
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Notification Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter clear announcement details for merchants..."
                  rows={3}
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
                  >
                    <option value="INFO">General Info</option>
                    <option value="WARNING">System Warning</option>
                    <option value="CRITICAL">Critical Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground">Target Audience</label>
                  <select
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value as any)}
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
                  >
                    <option value="ALL_MERCHANTS">All Merchants</option>
                    <option value="RETAIL_SHOPS">Retail Shops Only</option>
                    <option value="RESTAURANTS">Restaurants Only</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full border border-border px-5 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
                >
                  <Send className="size-3.5" />
                  Dispatch Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
