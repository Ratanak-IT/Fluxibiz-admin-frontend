"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  X,
  Sliders,
} from "lucide-react";
import {
  exportAuditLogsReport,
  exportBusinessesReport,
  exportOverviewReport,
} from "@/lib/exportReportService";

export type ReportType = "overview" | "businesses" | "audit" | "subscriptions";

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: ReportType;
  businessData?: any[];
  auditData?: any[];
  overviewData?: any;
}

export function ExportReportDialog({
  open,
  onOpenChange,
  defaultType = "businesses",
  businessData,
  auditData,
  overviewData,
}: ExportReportDialogProps) {
  const [customTitle, setCustomTitle] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  if (!open) return null;

  const close = () => {
    onOpenChange(false);
    setCustomTitle("");
    setCustomNotes("");
  };

  const recordCount =
    defaultType === "businesses"
      ? businessData?.length ?? 0
      : defaultType === "audit"
      ? auditData?.length ?? 0
      : 10;

  const titleMap: Record<ReportType, string> = {
    overview: "Platform Overview & Analytics",
    businesses: "Registered Businesses Directory",
    audit: "Audit Logs & Security Trail",
    subscriptions: "Subscription & Revenue Report",
  };

  const handleExport = () => {
    const options = {
      title: customTitle.trim() || titleMap[defaultType],
      notes: customNotes.trim() || undefined,
      includeBadges: true,
    };

    if (defaultType === "businesses" && businessData) {
      exportBusinessesReport(businessData, "excel", options);
    } else if (defaultType === "audit" && auditData) {
      exportAuditLogsReport(auditData, "excel", options);
    } else {
      exportOverviewReport(overviewData, "excel", options);
    }

    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={() => close()}
      />

      {/* Dialog Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Export Excel Report (.xls)
              </h2>
              <p className="text-xs text-muted-foreground">
                {titleMap[defaultType]} &bull; {recordCount} records ready
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => close()}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4">

          {/* Options & Customization */}
          <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sliders className="size-3.5 text-muted-foreground" />
              Report Customization Options
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Report Title (Optional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={titleMap[defaultType]}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition focus:border-gray-400 dark:focus:border-gray-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Executive Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Add executive comments or notes to the Excel header..."
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition focus:border-gray-400 dark:focus:border-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => close()}
            className="rounded-full border border-border bg-background px-5 py-2.5 text-xs font-medium text-foreground transition hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 shadow-sm active:scale-95"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

