"use client";

import { useState } from "react";
import { Globe, QrCode, Send } from "lucide-react";
import {
  useGetBusinessFeaturesQuery,
  useGetPlatformFeaturesQuery,
  useToggleBusinessFeatureMutation,
} from "@/features/businessManagement/businessAdminApi";
import { ReasonDialog } from "./ReasonDialog";
import type { BusinessFeature, BusinessFeatureResponse } from "@/lib/types/adminTypes";
import { AdminLoadingState } from "@/components/common/AdminLoadingState";
import { AdminApiErrorFallback } from "@/components/common/AdminApiErrorFallback";

const ICONS: Record<BusinessFeature, typeof Globe> = {
  STOREFRONT: Globe,
  TELEGRAM_BOT: Send,
  KHQR_PAYMENT: QrCode,
};

function FeatureRow({
  feature,
  busy,
  platformOff,
  onEnable,
  onDisable,
}: {
  feature: BusinessFeatureResponse;
  busy: boolean;
  platformOff: boolean;
  onEnable: () => void;
  onDisable: () => void;
}) {
  const Icon = ICONS[feature.feature] ?? Globe;
  const effectivelyOff = platformOff || !feature.enabled;

  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border last:border-b-0">
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <span
          className={[
            "mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl shadow-sm border border-border/50",
            effectivelyOff
              ? "bg-muted text-muted-foreground"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400",
          ].join(" ")}
        >
          <Icon className="size-5" strokeWidth={1.8} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{feature.label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>

          {platformOff && (
            <p className="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              Switched off platform-wide, so this shop cannot use it regardless of the setting below.
            </p>
          )}

          {!platformOff && !feature.enabled && feature.disabledReason && (
            <p className="mt-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
              {feature.disabledReason}
              {feature.disabledAt && (
                <span className="mt-0.5 block text-[11px] opacity-75">
                  Switched off {new Date(feature.disabledAt).toLocaleString()}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end shrink-0 sm:self-center">
        <button
          type="button"
          disabled={busy || (platformOff && !feature.enabled)}
          onClick={feature.enabled ? onDisable : onEnable}
          title={platformOff && !feature.enabled ? "Off platform-wide — turn it back on there first" : undefined}
          className={[
            "rounded-full px-5 py-2 text-xs font-bold transition disabled:opacity-50 shadow-sm",
            feature.enabled
              ? "border border-border text-foreground hover:bg-accent"
              : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400",
          ].join(" ")}
        >
          {feature.enabled ? "Switch off" : "Switch on"}
        </button>
      </div>
    </li>
  );
}

export function FeatureToggleCard({ businessId }: { businessId: string }) {
  const [pending, setPending] = useState<BusinessFeatureResponse | null>(null);

  const { data: features = [], isLoading, error, refetch } = useGetBusinessFeaturesQuery(businessId);
  const { data: platformFeatures = [] } = useGetPlatformFeaturesQuery();
  const [toggle, toggleState] = useToggleBusinessFeatureMutation();

  const isPlatformOff = (feature: BusinessFeature) =>
    platformFeatures.some((row) => row.feature === feature && !row.enabled);

  const enable = async (feature: BusinessFeatureResponse) => {
    await toggle({ businessId, feature: feature.feature, enabled: true });
  };

  const disable = async (reason: string) => {
    if (!pending) return;

    const result = await toggle({
      businessId,
      feature: pending.feature,
      enabled: false,
      reason,
    });

    if (!("error" in result)) setPending(null);
  };

  return (
    <>
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <h2 className="text-base font-bold text-foreground">
          Platform Features Management
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Control which customer-facing channels and tools this shop is allowed to use.
        </p>

        {isLoading && (
          <div className="py-4">
            <AdminLoadingState label="Loading platform features..." />
          </div>
        )}

        {error && (
          <div className="py-4">
            <AdminApiErrorFallback error={error} onRetry={refetch} />
          </div>
        )}

        {!isLoading && !error && (
          <ul className="mt-4 divide-y divide-border">
            {features.map((feature) => (
              <FeatureRow
                key={feature.feature}
                feature={feature}
                busy={toggleState.isLoading}
                platformOff={isPlatformOff(feature.feature)}
                onEnable={() => enable(feature)}
                onDisable={() => setPending(feature)}
              />
            ))}
          </ul>
        )}
      </section>

      {pending && (
        <ReasonDialog
          title={`Switch off ${pending.label}`}
          description="The shop owner sees this reason, and it is kept in the audit log."
          confirmLabel="Switch off"
          busy={toggleState.isLoading}
          onCancel={() => setPending(null)}
          onConfirm={disable}
        />
      )}
    </>
  );
}
