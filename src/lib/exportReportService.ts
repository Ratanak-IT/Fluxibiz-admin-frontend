"use client";

import { toast } from "sonner";
import { formatFullDateTime } from "./dateUtils";
import type {
  AdminAuditLogResponse,
  BusinessResponse,
  PlatformDashboardResponse,
} from "./types/adminTypes";

export type ExportFormat = "excel" | "csv" | "pdf";

export interface ReportSummaryCard {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export interface ProfessionalReportOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  summaryCards?: ReportSummaryCard[];
  notes?: string;
  includeBadges?: boolean;
}

export interface CleanExcelReportOptions extends ProfessionalReportOptions {}

/**
 * Returns clean inline CSS style for status badges in Excel / HTML.
 */
function getStatusBadgeStyle(value: string | number): string {
  const val = String(value ?? "").toUpperCase().trim();

  if (
    val === "ACTIVE" ||
    val === "ENABLED" ||
    val === "SUCCESS" ||
    val === "OPERATIONAL" ||
    val === "OPEN"
  ) {
    return "background-color: #dcfce7; color: #15803d; font-weight: 600; padding: 4px 10px; border-radius: 9999px; font-size: 11px; text-transform: uppercase; border: 1px solid #bbf7d0;";
  }

  if (
    val === "SUSPENDED" ||
    val === "DELETED" ||
    val === "CRITICAL" ||
    val === "FAILED"
  ) {
    return "background-color: #fee2e2; color: #b91c1c; font-weight: 600; padding: 4px 10px; border-radius: 9999px; font-size: 11px; text-transform: uppercase; border: 1px solid #fecaca;";
  }

  if (
    val === "WARNING" ||
    val === "CLOSED" ||
    val === "DISABLED" ||
    val === "PENDING"
  ) {
    return "background-color: #fef3c7; color: #b45309; font-weight: 600; padding: 4px 10px; border-radius: 9999px; font-size: 11px; text-transform: uppercase; border: 1px solid #fde68a;";
  }

  return "";
}

/**
 * Downloads a clean, elegant, professional Excel spreadsheet (.xls) compatible with Microsoft Excel & Google Sheets.
 */
export function downloadCleanExcelReport(options: ProfessionalReportOptions): void {
  if (typeof window === "undefined") return;

  const generatedDate = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Summary Cards HTML if present
  let summaryCardsHTML = "";
  if (options.summaryCards && options.summaryCards.length > 0) {
    const cardItemsHTML = options.summaryCards
      .map((card) => {
        let borderColor = "#00932A";
        let bgColor = "#f0fdf4";
        if (card.variant === "warning") {
          borderColor = "#d97706";
          bgColor = "#fffbeb";
        } else if (card.variant === "danger") {
          borderColor = "#dc2626";
          bgColor = "#fef2f2";
        }

        return `
          <td style="padding: 12px; background-color: ${bgColor}; border: 1px solid #e2e8f0; border-top: 4px solid ${borderColor}; border-radius: 8px; vertical-align: top; width: ${Math.floor(100 / options.summaryCards!.length)}%;">
            <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">${card.label}</div>
            <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 4px;">${card.value}</div>
            ${card.subtext ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${card.subtext}</div>` : ""}
          </td>
        `;
      })
      .join("<td style='width: 12px;'></td>");

    summaryCardsHTML = `
      <table style="margin-bottom: 20px; width: 100%;">
        <tr>
          ${cardItemsHTML}
        </tr>
      </table>
    `;
  }

  // Table Headers
  const headersHTML = options.headers
    .map(
      (h) => `
    <th style="padding: 12px 14px; text-align: left; font-size: 12px; font-weight: 700; color: #ffffff; background-color: #00932A; border: 1px solid #007a23; text-transform: uppercase; letter-spacing: 0.5px;">
      ${h}
    </th>
  `
    )
    .join("");

  // Table Rows
  const rowsHTML = options.rows
    .map((row, rIdx) => {
      const bg = rIdx % 2 === 0 ? "#ffffff" : "#f8fafc";
      const cellsHTML = row
        .map((cell) => {
          const strVal = String(cell ?? "");
          const badgeStyle = options.includeBadges !== false ? getStatusBadgeStyle(strVal) : "";

          if (badgeStyle) {
            return `
              <td style="padding: 10px 14px; font-size: 12px; border: 1px solid #e2e8f0; text-align: center; vertical-align: middle;">
                <span style="${badgeStyle}">${strVal}</span>
              </td>
            `;
          }

          const isNumeric = typeof cell === "number" || (/^\d+$/.test(strVal) && strVal.length < 10);

          return `
            <td style="padding: 10px 14px; font-size: 12px; color: #334155; border: 1px solid #e2e8f0; vertical-align: middle; ${isNumeric ? "text-align: right;" : ""}">
              ${strVal}
            </td>
          `;
        })
        .join("");

      return `<tr style="background-color: ${bg};">${cellsHTML}</tr>`;
    })
    .join("");

  const notesHTML = options.notes
    ? `
      <div style="margin-top: 16px; padding: 12px 16px; background-color: #f1f5f9; border-left: 4px solid #00932A; border-radius: 4px; font-size: 11px; color: #475569;">
        <strong>Executive Notes:</strong> ${options.notes}
      </div>
    `
    : "";

  const htmlDocument = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Report</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; margin: 20px; color: #1e293b; }
          table.data-grid { border-collapse: collapse; width: 100%; margin-top: 16px; }
        </style>
      </head>
      <body>
        <!-- BRANDED HEADER -->
        <table style="width: 100%; border-bottom: 2px solid #00932A; padding-bottom: 12px; margin-bottom: 16px;">
          <tr>
            <td style="vertical-align: middle;">
              <div style="font-size: 10px; font-weight: 700; color: #00932A; letter-spacing: 1px; text-transform: uppercase;">iPOS Enterprise Platform</div>
              <h1 style="margin: 4px 0 0 0; font-size: 22px; font-weight: 800; color: #0f172a;">${options.title}</h1>
              ${options.subtitle ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">${options.subtitle}</div>` : ""}
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 11px; color: #64748b;">Generated: <strong>${generatedDate}</strong></div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Records Exported: <strong>${options.rows.length}</strong></div>
            </td>
          </tr>
        </table>

        <!-- SUMMARY CARDS -->
        ${summaryCardsHTML}

        <!-- EXECUTIVE NOTES -->
        ${notesHTML}

        <!-- MAIN TABLE -->
        <table class="data-grid">
          <thead>
            <tr>${headersHTML}</tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <!-- FOOTER METADATA -->
        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
          Confidential &bull; iPOS Platform Executive System Report &bull; ${generatedDate}
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([`\uFEFF${htmlDocument}`], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = options.filename.endsWith(".xls") ? options.filename : `${options.filename}.xls`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a clean CSV report with UTF-8 BOM encoding for Microsoft Excel & Google Sheets compatibility.
 */
export function downloadCSVReport(options: ProfessionalReportOptions): void {
  if (typeof window === "undefined") return;

  const escapeCSVCell = (val: string | number): string => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];

  // Metadata headers in CSV
  lines.push(escapeCSVCell(`Report Title: ${options.title}`));
  if (options.subtitle) lines.push(escapeCSVCell(`Subtitle: ${options.subtitle}`));
  lines.push(escapeCSVCell(`Exported On: ${new Date().toLocaleString()}`));
  lines.push(escapeCSVCell(`Total Records: ${options.rows.length}`));
  lines.push("");

  // Summary KPI Cards in CSV if provided
  if (options.summaryCards && options.summaryCards.length > 0) {
    lines.push("--- EXECUTIVE SUMMARY ---");
    lines.push(options.summaryCards.map((c) => escapeCSVCell(`${c.label}: ${c.value}`)).join(","));
    lines.push("");
  }

  // Data Headers
  lines.push(options.headers.map(escapeCSVCell).join(","));

  // Data Rows
  options.rows.forEach((row) => {
    lines.push(row.map(escapeCSVCell).join(","));
  });

  const csvContent = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = options.filename.endsWith(".csv") ? options.filename : `${options.filename}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a styled printable executive PDF window for browser printing / PDF export.
 */
export function downloadPrintablePDFReport(options: ProfessionalReportOptions): void {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Pop-up blocked. Please allow pop-ups to generate PDF report.");
    return;
  }

  const generatedDate = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Summary Cards HTML
  let summaryCardsHTML = "";
  if (options.summaryCards && options.summaryCards.length > 0) {
    const cardItemsHTML = options.summaryCards
      .map((card) => {
        let borderColor = "#00932A";
        let bgColor = "#f0fdf4";
        if (card.variant === "warning") {
          borderColor = "#d97706";
          bgColor = "#fffbeb";
        } else if (card.variant === "danger") {
          borderColor = "#dc2626";
          bgColor = "#fef2f2";
        }

        return `
          <div class="kpi-card" style="border-top-color: ${borderColor}; background-color: ${bgColor};">
            <div class="kpi-label">${card.label}</div>
            <div class="kpi-value">${card.value}</div>
            ${card.subtext ? `<div class="kpi-subtext">${card.subtext}</div>` : ""}
          </div>
        `;
      })
      .join("");

    summaryCardsHTML = `<div class="kpi-grid">${cardItemsHTML}</div>`;
  }

  const headersHTML = options.headers.map((h) => `<th>${h}</th>`).join("");

  const rowsHTML = options.rows
    .map((row, rIdx) => {
      const cellsHTML = row
        .map((cell) => {
          const strVal = String(cell ?? "");
          const badgeStyle = options.includeBadges !== false ? getStatusBadgeStyle(strVal) : "";

          if (badgeStyle) {
            return `<td style="text-align: center;"><span style="${badgeStyle}">${strVal}</span></td>`;
          }

          const isNumeric = typeof cell === "number" || (/^\d+$/.test(strVal) && strVal.length < 10);
          return `<td style="${isNumeric ? "text-align: right;" : ""}">${strVal}</td>`;
        })
        .join("");

      return `<tr class="${rIdx % 2 === 0 ? "even" : "odd"}">${cellsHTML}</tr>`;
    })
    .join("");

  const notesHTML = options.notes
    ? `
      <div class="notes-box">
        <strong>Executive Notes:</strong> ${options.notes}
      </div>
    `
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title} - iPOS Executive Report</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 20px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 3px solid #00932A;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .brand-tag {
            font-size: 10px;
            font-weight: 800;
            color: #00932A;
            letter-spacing: 1.5px;
            text-transform: uppercase;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 4px 0 0 0;
          }
          .subtitle {
            font-size: 13px;
            color: #64748b;
            margin-top: 4px;
          }
          .meta-info {
            text-align: right;
            font-size: 11px;
            color: #64748b;
          }
          .meta-info strong { color: #0f172a; }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
            margin-bottom: 20px;
          }
          .kpi-card {
            border: 1px solid #e2e8f0;
            border-top: 4px solid #00932A;
            border-radius: 8px;
            padding: 12px;
          }
          .kpi-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .kpi-value { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 2px; }
          .kpi-subtext { font-size: 10px; color: #64748b; margin-top: 2px; }
          .notes-box {
            background-color: #f8fafc;
            border-left: 4px solid #00932A;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 12px;
            color: #334155;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          th {
            background-color: #00932A;
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 10px 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid #007a23;
          }
          td {
            padding: 9px 12px;
            border: 1px solid #e2e8f0;
            color: #334155;
            vertical-align: middle;
          }
          tr.even { background-color: #ffffff; }
          tr.odd { background-color: #f8fafc; }
          .footer {
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background-color: #00932A; color: white; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 13px;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="brand-tag">iPOS Enterprise Platform</div>
            <div class="title">${options.title}</div>
            ${options.subtitle ? `<div class="subtitle">${options.subtitle}</div>` : ""}
          </div>
          <div class="meta-info">
            <div>Generated: <strong>${generatedDate}</strong></div>
            <div style="margin-top: 2px;">Total Records: <strong>${options.rows.length}</strong></div>
          </div>
        </div>

        ${summaryCardsHTML}
        ${notesHTML}

        <table>
          <thead>
            <tr>${headersHTML}</tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <div class="footer">
          <div>Confidential &bull; iPOS Platform Executive Report</div>
          <div>Page 1 of 1</div>
          <div>Generated on ${generatedDate}</div>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Universal multi-format export dispatcher.
 */
export function exportReport(options: ProfessionalReportOptions, format: ExportFormat = "excel"): void {
  if (format === "csv") {
    downloadCSVReport(options);
    toast.success(`Exported CSV report: ${options.rows.length} records.`);
  } else if (format === "pdf") {
    downloadPrintablePDFReport(options);
    toast.success(`Generated printable PDF report preview.`);
  } else {
    downloadCleanExcelReport(options);
    toast.success(`Exported Excel report: ${options.rows.length} records.`);
  }
}

/**
 * Export Business Management list to Professional Report
 */
export function exportBusinessesReport(
  businesses?: BusinessResponse[],
  format: ExportFormat = "excel",
  customOptions?: Partial<ProfessionalReportOptions>
): void {
  if (!businesses || businesses.length === 0) {
    toast.error("No business data available to export.");
    return;
  }

  const activeCount = businesses.filter((b) => b.status === "ACTIVE").length;
  const suspendedCount = businesses.filter((b) => b.status === "SUSPENDED").length;
  const storefrontsCount = businesses.filter((b) => b.isEnabled).length;

  const summaryCards: ReportSummaryCard[] = [
    { label: "Total Businesses", value: businesses.length, subtext: "Total registered accounts" },
    { label: "Active Merchants", value: activeCount, variant: "success", subtext: `${Math.round((activeCount / businesses.length) * 100)}% of total` },
    { label: "Suspended", value: suspendedCount, variant: suspendedCount > 0 ? "warning" : "default", subtext: "Temporarily blocked" },
    { label: "Published Storefronts", value: storefrontsCount, variant: "success", subtext: "Online channels active" },
  ];

  const headers = [
    "Business Name",
    "Slug",
    "Category",
    "Account Status",
    "Platform Access",
    "Operating Status",
    "Phone Number",
    "Email Address",
    "Address / City",
    "Registered Date",
  ];

  const rows = businesses.map((b) => [
    b.name || "Unnamed Business",
    b.slug || "—",
    b.category?.name || "Uncategorized",
    b.status || "ACTIVE",
    b.isEnabled ? "ENABLED" : "DISABLED",
    b.isClosed ? "CLOSED" : "OPEN",
    b.phoneNumber || "—",
    b.email || "—",
    b.address || b.cityOrProvince || "—",
    b.provisionedAt ? formatFullDateTime(b.provisionedAt) : "—",
  ]);

  const timestamp = new Date().toISOString().slice(0, 10);

  exportReport(
    {
      title: customOptions?.title || "Registered Businesses Directory Report",
      subtitle: customOptions?.subtitle || `Enterprise business directory export & system breakdown`,
      headers,
      rows,
      summaryCards: customOptions?.summaryCards || summaryCards,
      filename: customOptions?.filename || `businesses_report_${timestamp}`,
      notes: customOptions?.notes,
      includeBadges: customOptions?.includeBadges ?? true,
    },
    format
  );
}

/**
 * Export Audit Logs to Professional Report
 */
export function exportAuditLogsReport(
  auditLogs?: AdminAuditLogResponse[],
  format: ExportFormat = "excel",
  customOptions?: Partial<ProfessionalReportOptions>
): void {
  if (!auditLogs || auditLogs.length === 0) {
    toast.error("No audit logs available to export.");
    return;
  }

  const uniqueAdmins = new Set(auditLogs.map((l) => l.actorUsername).filter(Boolean)).size;

  const summaryCards: ReportSummaryCard[] = [
    { label: "Total Audit Events", value: auditLogs.length, subtext: "Logged security actions" },
    { label: "Active Administrators", value: uniqueAdmins, variant: "success", subtext: "Unique admin actors" },
    { label: "Date Span", value: auditLogs.length > 0 ? "Latest logs" : "N/A", subtext: "Real-time audit trail" },
  ];

  const headers = [
    "Date & Time",
    "Administrator",
    "Action Executed",
    "Target Type",
    "Target Resource",
    "Previous State",
    "New State",
    "Reason / Notes",
  ];

  const rows = auditLogs.map((log) => [
    formatFullDateTime(log.createdAt),
    log.actorUsername || "System",
    log.actionType.replace(/_/g, " "),
    log.targetType || "SYSTEM",
    log.targetLabel || log.targetId || "—",
    log.previousState || "—",
    log.newState || "—",
    log.reason || "—",
  ]);

  const timestamp = new Date().toISOString().slice(0, 10);

  exportReport(
    {
      title: customOptions?.title || "Audit Log & Security Trail Report",
      subtitle: customOptions?.subtitle || "System security trail, configuration changes, and admin activities",
      headers,
      rows,
      summaryCards: customOptions?.summaryCards || summaryCards,
      filename: customOptions?.filename || `audit_logs_report_${timestamp}`,
      notes: customOptions?.notes,
      includeBadges: customOptions?.includeBadges ?? true,
    },
    format
  );
}

/**
 * Export Platform Overview Analytics to Professional Report
 */
export function exportOverviewReport(
  data?: PlatformDashboardResponse,
  format: ExportFormat = "excel",
  customOptions?: Partial<ProfessionalReportOptions>
): void {
  if (!data) {
    toast.error("No overview dashboard data available to export.");
    return;
  }

  const summaryCards: ReportSummaryCard[] = [
    { label: "Total Merchants", value: data.totalBusinesses, subtext: `${data.newBusinessesLast30Days} new last 30d` },
    { label: "Active Merchants", value: data.activeBusinesses, variant: "success", subtext: "Currently operational" },
    { label: "Paid Orders (30d)", value: data.ordersPaidLast30Days, variant: "success", subtext: "Completed transactions" },
    { label: "Storefronts Live", value: data.storefrontsPublished, variant: "default", subtext: "Online store channels" },
  ];

  const headers = ["Metric Indicator", "Value / Count", "Description / Status"];
  const rows = [
    ["Total Registered Businesses", data.totalBusinesses, "All merchant accounts"],
    ["New Businesses (Last 30 Days)", data.newBusinessesLast30Days, "Recent merchant signups"],
    ["Active Businesses", "ACTIVE", `${data.activeBusinesses} currently active shops`],
    ["Suspended Businesses", "SUSPENDED", `${data.suspendedBusinesses} accounts suspended`],
    ["Closed Businesses", "CLOSED", `${data.closedBusinesses} temporarily closed`],
    ["Deleted Businesses", "DELETED", `${data.deletedBusinesses ?? 0} soft-deleted accounts`],
    ["Orders Paid (Last 30 Days)", data.ordersPaidLast30Days, "Completed order transactions"],
    ["Trading Businesses (Last 30 Days)", data.tradingBusinessesLast30Days, "Shops with transactions"],
    ["Storefronts Published", "ENABLED", `${data.storefrontsPublished} live online web storefronts`],
    ["Telegram Bots Connected", "ENABLED", `${data.telegramBotsConnected} integrated telegram bot channels`],
  ];

  const timestamp = new Date().toISOString().slice(0, 10);

  exportReport(
    {
      title: customOptions?.title || "Platform Overview & Analytics Report",
      subtitle: customOptions?.subtitle || "Comprehensive platform performance, active merchants, and channel metrics",
      headers,
      rows,
      summaryCards: customOptions?.summaryCards || summaryCards,
      filename: customOptions?.filename || `platform_overview_report_${timestamp}`,
      notes: customOptions?.notes,
      includeBadges: customOptions?.includeBadges ?? true,
    },
    format
  );
}

// Backward compatibility alias exports
export function exportBusinessesToExcel(businesses?: BusinessResponse[]): void {
  exportBusinessesReport(businesses, "excel");
}

export function exportAuditLogsToExcel(auditLogs?: AdminAuditLogResponse[]): void {
  exportAuditLogsReport(auditLogs, "excel");
}

export function exportOverviewToExcel(data?: PlatformDashboardResponse): void {
  exportOverviewReport(data, "excel");
}

