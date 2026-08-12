"use client";

export interface PDFReportMetric {
  label: string;
  value: string | number;
  subtext?: string;
}

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  metrics?: PDFReportMetric[];
  headers: string[];
  rows: (string | number)[][];
  generatedBy?: string;
}

export function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  if (typeof window === "undefined") return;

  const escapeCSV = (str: string | number) => {
    const stringified = String(str ?? "");
    if (stringified.includes(",") || stringified.includes('"') || stringified.includes("\n")) {
      return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
  };

  const headerRow = headers.map(escapeCSV).join(",");
  const dataRows = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
  const csvContent = `\uFEFF${headerRow}\n${dataRows}`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printPDFReport(options: PDFReportOptions): void {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank", "width=1000,height=800");
  if (!printWindow) {
    alert("Please allow popups to generate the PDF report.");
    return;
  }

  const dateStr = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const metricsHTML = (options.metrics || [])
    .map(
      (m) => `
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; background: #f9fafb;">
      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">${m.label}</div>
      <div style="font-size: 20px; font-weight: 800; color: #111827; margin-top: 4px;">${m.value}</div>
      ${m.subtext ? `<div style="font-size: 11px; color: #00932A; margin-top: 2px;">${m.subtext}</div>` : ""}
    </div>
  `
    )
    .join("");

  const headersHTML = options.headers
    .map(
      (h) => `
    <th style="padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 700; color: #374151; background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
      ${h}
    </th>
  `
    )
    .join("");

  const rowsHTML = options.rows
    .map(
      (row, idx) => `
    <tr style="background: ${idx % 2 === 0 ? "#ffffff" : "#f9fafb"}; border-bottom: 1px solid #f3f4f6;">
      ${row
        .map(
          (cell) => `
        <td style="padding: 10px 14px; font-size: 12px; color: #1f2937;">
          ${String(cell ?? "")}
        </td>
      `
        )
        .join("")}
    </tr>
  `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title} - IPOS Executive Report</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Google Sans', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 32px;
            color: #111827;
            background: #ffffff;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #00932A; padding-bottom: 16px; margin-bottom: 24px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="background: #00932A; width: 14px; height: 14px; border-radius: 4px;"></div>
              <span style="font-size: 14px; font-weight: 800; color: #00932A; letter-spacing: 0.5px;">IPOS PLATFORM ADMIN</span>
            </div>
            <h1 style="margin: 8px 0 0 0; font-size: 24px; font-weight: 800; color: #111827;">${options.title}</h1>
            ${options.subtitle ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">${options.subtitle}</p>` : ""}
          </div>
          <div style="text-align: right; font-size: 12px; color: #6b7280;">
            <div><strong>Generated:</strong> ${dateStr}</div>
            <div><strong>By:</strong> ${options.generatedBy || "Platform Administrator"}</div>
            <div style="margin-top: 4px; font-size: 10px; color: #00932A; font-weight: 700;">CONFIDENTIAL PLATFORM REPORT</div>
          </div>
        </div>

        ${
          options.metrics && options.metrics.length > 0
            ? `<div style="display: grid; grid-template-columns: repeat(${Math.min(options.metrics.length, 4)}, 1fr); gap: 12px; margin-bottom: 24px;">
                ${metricsHTML}
              </div>`
            : ""
        }

        <table style="width: 100%; border-collapse: collapse; margin-top: 12px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
          <thead>
            <tr>${headersHTML}</tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af;">
          <div>IPOS Multi-tenant Merchant Platform &copy; ${new Date().getFullYear()}</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
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
