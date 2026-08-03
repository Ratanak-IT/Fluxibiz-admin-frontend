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

const ICONS: Record<BusinessFeature, typeof Globe> = {
  STOREFRONT: Globe,
  TELEGRAM_BOT: Send,
  KHQR_PAYMENT: QrCode,
};

function errorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status = "status" in error ? error.status : undefined;

  if (status === 400) return "A reason is required when switching a feature off.";
  if (status === 403) return "Your account cannot change platform features.";
  return status ? `Request failed with status ${status}.` : "Request failed.";
}

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
    <li className="flex items-start gap-3 py-4">
      <span
        className={[
          "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg",
          effectivelyOff
            ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
            : "bg-green-50 text-green-700 dark:bg-green-950/70 dark:text-green-400",
        ].join(" ")}
      >
        <Icon className="size-4" strokeWidth={1.8} aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{feature.label}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{feature.description}</p>

        {platformOff && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
            Switched off platform-wide, so this shop can&apos;t use it regardless of the setting below.
          </p>
        )}

        {!platformOff && !feature.enabled && feature.disabledReason && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            {feature.disabledReason}
            {feature.disabledAt && (
              <span className="mt-0.5 block opacity-70">
                Switched off {new Date(feature.disabledAt).toLocaleString()}
              </span>
            )}
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={busy || (platformOff && !feature.enabled)}
        onClick={feature.enabled ? onDisable : onEnable}
        title={platformOff && !feature.enabled ? "Off platform-wide — turn it back on there first" : undefined}
        className={[
          "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition disabled:opacity-50",
          feature.enabled
            ? "border border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-neutral-950 dark:hover:bg-green-400",
        ].join(" ")}
      >
        {feature.enabled ? "Switch off" : "Switch on"}
      </button>
    </li>
  );
}

export function FeatureToggleCard({ businessId }: { businessId: string }) {
  const [pending, setPending] = useState<BusinessFeatureResponse | null>(null);

  const { data: features = [], isLoading, error } = useGetBusinessFeaturesQuery(businessId);
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

    // Keep the dialog open on failure so the typed reason is not lost.
    if (!("error" in result)) setPending(null);
  };

  return (
    <>
      <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Platform features
        </h2>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          What this shop is allowed to use. Switching something off takes effect
          straight away.
        </p>

        {isLoading && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Loading features...</p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errorMessage(error)}</p>
        )}

        {!isLoading && !error && (
          <ul className="mt-2 divide-y divide-neutral-100 dark:divide-neutral-800">
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
