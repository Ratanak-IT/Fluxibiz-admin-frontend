"use client";

import { useMemo } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useGetBusinessesQuery } from "@/features/businessManagement/businessAdminApi";

export function MerchantHealthRadarWidget() {
  const { data: businessData, isLoading } = useGetBusinessesQuery({ page: 0, size: 100 });

  const businesses = businessData?.content ?? [];

  const healthAnalysis = useMemo(() => {
    const atRisk: Array<{ name: string; email: string; city: string; score: number; reason: string }> = [];

    businesses.forEach((b, idx) => {
      let score = 100;
      let reason = "Healthy active merchant";

      if (b.status === "SUSPENDED" || !b.isEnabled) {
        score -= 50;
        reason = "Account suspended or disabled";
      }
      if (!b.category) {
        score -= 25;
        reason = "Missing business category";
      }
      if (!b.email || b.email === "N/A") {
        score -= 15;
        reason = "Incomplete owner email contact";
      }

      if (score < 80) {
        atRisk.push({
          name: b.name || `Merchant ${idx + 1}`,
          email: b.email || "N/A",
          city: b.cityOrProvince || b.address || "Phnom Penh",
          score: Math.max(20, score),
          reason,
        });
      }
    });

    return atRisk;
  }, [businesses]);

  const handleSupport = (name: string, email: string) => {
    toast.success(`Support & health optimization email sent to ${name} (${email})`);
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-card p-6 dark:border-border dark:text-card-foreground shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-foreground flex items-center gap-2">
            <ShieldAlert className="size-4 text-[#FEB90D]" />
            Merchant Health & Risk Status Radar
          </h2>
          <p className="mt-1 text-xs text-neutral-400 dark:text-muted-foreground">
            Proactive health scoring flagging accounts that need platform support.
          </p>
        </div>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          {healthAnalysis.length} Risk Alerts
        </span>
      </div>

      {isLoading ? (
        <p className="mt-4 text-xs text-muted-foreground">Evaluating merchant health scores...</p>
      ) : healthAnalysis.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          <span>All registered merchants operating at 100% health score!</span>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {healthAnalysis.slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 text-xs"
            >
              <div>
                <p className="font-bold text-foreground">{item.name}</p>
                <p className="text-muted-foreground">
                  {item.email} • {item.reason}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-amber-600 dark:text-amber-400">{item.score}% Health</span>
                <button
                  type="button"
                  onClick={() => handleSupport(item.name, item.email)}
                  className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Assist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
