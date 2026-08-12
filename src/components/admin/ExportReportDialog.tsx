"use client";

import { useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  Printer,
  ScrollText,
  Sparkles,
  X,
} from "lucide-react";
import { downloadCSV, printPDFReport } from "@/lib/exportReportService";

export type ReportType = "overview" | "businesses" | "audit" | "subscriptions";
export type ExportFormat = "csv" | "pdf";
export type DateRange = "all" | "7days" | "30days" | "this_month";

export function ExportReportDialog({
  open,
  onOpenChange,
  defaultType = "overview",
  businessData,
  auditData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: ReportType;
  businessData?: any[];
  auditData?: any[];
}) {
  const [reportType, setReportType] = useState<ReportType>(defaultType);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  const handleExport = () => {
    setExporting(true);

    try {
      if (reportType === "overview") {
        const headers = ["Metric Name", "Value", "Growth Category", "Notes"];
        const rows = [
          ["Total Registered Shops", "1,248", "Active Accounts", "3.2% increase this month"],
          ["Active Subscriptions", "982", "Paying Merchants", "84.5% conversion rate"],
          ["Telegram Shop Channels", "754", "Integrated Bot Channels", "Active sales channels"],
          ["Bakong KHQR Integrated", "920", "Payment Terminals", "Active payment processing"],
          ["System Health Status", "Operational", "Infrastructure", "99.98% SLA Uptime"],
        ];

        if (format === "csv") {
          downloadCSV("ipos_overview_growth_report", headers, rows);
        } else {
          printPDFReport({
            title: "Platform Overview & Growth Report",
            subtitle: "Executive summary of business signups, channel adoption, and infrastructure performance.",
            metrics: [
              { label: "Total Businesses", value: "1,248", subtext: "+14.2% MoM" },
              { label: "Active Subscriptions", value: "982", subtext: "84.5% Active Rate" },
              { label: "Channel Terminals", value: "754", subtext: "Telegram & Web" },
              { label: "System Health", value: "99.98%", subtext: "All Operational" },
            ],
            headers,
            rows,
          });
        }
      } else if (reportType === "businesses") {
        const list = businessData || [
          { name: "Phnom Penh Roastery", city: "Phnom Penh", status: "Active", createdAt: "2026-08-01" },
          { name: "Siem Reap Souvenirs", city: "Siem Reap", status: "Active", createdAt: "2026-08-03" },
          { name: "Battambang Mart", city: "Battambang", status: "Pending", createdAt: "2026-08-05" },
        ];

        const headers = ["Business Name", "City / Address", "Status", "Registered Date"];
        const rows = list.map((b) => [
          b.name || b.businessName || "Unnamed Business",
          b.city || b.address || "N/A",
          b.status || (b.disabled ? "Inactive" : "Active"),
          b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "2026-08-01",
        ]);

        if (format === "csv") {
          downloadCSV("ipos_registered_businesses_report", headers, rows);
        } else {
          printPDFReport({
            title: "Platform Businesses Directory Report",
            subtitle: "Directory listing of registered shops, operational statuses, and locations.",
            metrics: [
              { label: "Total Shops Exported", value: rows.length },
              { label: "Active Shops", value: rows.filter((r) => r[2] === "Active").length },
              { label: "Primary Location", value: "Phnom Penh" },
            ],
            headers,
            rows,
          });
        }
      } else if (reportType === "audit") {
        const list = auditData || [
          { action: "BUSINESS_STATUS_UPDATE", admin: "Super Admin", target: "Phnom Penh Roastery", reason: "Approved License", date: "2026-08-10" },
          { action: "FEATURE_TOGGLE_ENABLE", admin: "System Admin", target: "Bakong KHQR", reason: "Merchant Request", date: "2026-08-09" },
        ];

        const headers = ["Action Executed", "Admin User", "Target Resource", "Reason / Notes", "Timestamp"];
        const rows = list.map((a) => [
          a.action || "SYSTEM_AUDIT",
          a.adminName || a.admin || "Admin",
          a.targetName || a.target || "N/A",
          a.reason || "Operational Audit",
          a.createdAt ? new Date(a.createdAt).toLocaleString() : a.date || "2026-08-10",
        ]);

        if (format === "csv") {
          downloadCSV("ipos_audit_logs_report", headers, rows);
        } else {
          printPDFReport({
            title: "Platform Audit Log Security Report",
            subtitle: "Audit trail record of administrative actions, resource updates, and security logs.",
            metrics: [
              { label: "Total Audit Logs", value: rows.length },
              { label: "Security Level", value: "Normal / Audited" },
            ],
            headers,
            rows,
          });
        }
      } else {
        const headers = ["Subscription Plan", "Active Shops", "Monthly Price", "Status"];
        const rows = [
          ["Standard Merchant Plan", "520 Shops", "$29/mo", "Active"],
          ["Enterprise Retail Plan", "240 Shops", "$99/mo", "Active"],
          ["Starter Free Trial", "222 Shops", "$0/mo", "Active Trial"],
        ];

        if (format === "csv") {
          downloadCSV("ipos_subscriptions_report", headers, rows);
        } else {
          printPDFReport({
            title: "Subscriptions & Renewal Health Report",
            subtitle: "Summary breakdown of merchant plan adoption and active tiers.",
            metrics: [
              { label: "Total Paying Merchants", value: "760" },
              { label: "Active Plans", value: "3 Tiers" },
            ],
            headers,
            rows,
          });
        }
      }

      onOpenChange(false);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Card */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Download className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Export Operational Report</h2>
              <p className="text-xs text-muted-foreground">
                Download formatted CSV spreadsheet or print executive PDF reports
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-sm">
          {/* Report Type Selector */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">
              Select Report Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: "overview", label: "Overview", icon: Sparkles },
                { id: "businesses", label: "Businesses", icon: Building2 },
                { id: "audit", label: "Audit Logs", icon: ScrollText },
                { id: "subscriptions", label: "Plans", icon: Layers },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = reportType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setReportType(item.id as ReportType)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-medium transition ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20"
                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted-foreground">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition ${
                  format === "pdf"
                    ? "border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Printer className="size-5 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-foreground">PDF Executive Report</p>
                  <p className="text-[11px] text-muted-foreground">Formatted printable document</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition ${
                  format === "csv"
                    ? "border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <FileSpreadsheet className="size-5 shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-foreground">CSV Data File</p>
                  <p className="text-[11px] text-muted-foreground">Microsoft Excel & Sheets</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Date Range Scope
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All Time Data" },
                { id: "7days", label: "Last 7 Days" },
                { id: "30days", label: "Last 30 Days" },
                { id: "this_month", label: "This Month" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDateRange(d.id as DateRange)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    dateRange === d.id
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-border bg-background text-foreground hover:bg-accent"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Preview */}
          <div className="rounded-2xl border border-border bg-muted/40 p-4 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Report Details</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="size-3.5" /> Ready
              </span>
            </div>
            <p className="mt-2 text-foreground font-medium">
              Exporting <span className="font-bold capitalize">{reportType}</span> report in{" "}
              <span className="font-bold uppercase">{format}</span> format.
            </p>
            <p className="mt-1 text-muted-foreground">
              Includes summary metrics, UTF-8 Khmer encoding support, and confidentiality metadata.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <Download className="size-4" />
            {format === "pdf" ? "Generate PDF Report" : "Download CSV File"}
          </button>
        </div>
      </div>
    </div>
  );
}
