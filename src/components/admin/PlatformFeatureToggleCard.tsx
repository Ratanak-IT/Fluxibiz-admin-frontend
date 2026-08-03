"use client";

import { useState } from "react";
import { Globe, QrCode, Send } from "lucide-react";
import {
  useGetPlatformFeaturesQuery,
  useTogglePlatformFeatureMutation,
} from "@/features/businessManagement/businessAdminApi";
import { ReasonDialog } from "./ReasonDialog";
import type { BusinessFeature, PlatformFeatureResponse } from "@/lib/types/adminTypes";

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
  onEnable,
  onDisable,
}: {
  feature: PlatformFeatureResponse;
  busy: boolean;
  onEnable: () => void;
  onDisable: () => void;
}) {
  const Icon = ICONS[feature.feature] ?? Globe;

  return (
    <li className="flex items-start gap-3 py-4">
      <span
        className={[
          "mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg",
          feature.enabled
            ? "bg-green-50 text-green-700 dark:bg-green-950/70 dark:text-green-400"
            : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
        ].join(" ")}
      >
        <Icon className="size-4" strokeWidth={1.8} aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{feature.label}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{feature.description}</p>

        {!feature.enabled && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
            Off for every business on the platform, even shops that have it enabled on their own toggle.
            {feature.disabledReason && <span className="block mt-1">{feature.disabledReason}</span>}
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
        disabled={busy}
        onClick={feature.enabled ? onDisable : onEnable}
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

export function PlatformFeatureToggleCard() {
  const [pending, setPending] = useState<PlatformFeatureResponse | null>(null);

  const { data: features = [], isLoading, error } = useGetPlatformFeaturesQuery();
  const [toggle, toggleState] = useTogglePlatformFeatureMutation();

  const enable = async (feature: PlatformFeatureResponse) => {
    await toggle({ feature: feature.feature, enabled: true });
  };

  const disable = async (reason: string) => {
    if (!pending) return;

    const result = await toggle({
      feature: pending.feature,
      enabled: false,
      reason,
    });

    if (!("error" in result)) setPending(null);
  };

  return (
    <>
      <section className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Platform-wide features
        </h2>
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
          Switching something off here takes it away from every business
          immediately, no matter what that business&apos;s own feature toggle says.
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
                onEnable={() => enable(feature)}
                onDisable={() => setPending(feature)}
              />
            ))}
          </ul>
        )}
      </section>

      {pending && (
        <ReasonDialog
          title={`Switch off ${pending.label} for every business`}
          description="This turns the feature off platform-wide, even for shops that currently have it on. Kept in the audit log."
          confirmLabel="Switch off for everyone"
          busy={toggleState.isLoading}
          onCancel={() => setPending(null)}
          onConfirm={disable}
        />
      )}
    </>
  );
}
