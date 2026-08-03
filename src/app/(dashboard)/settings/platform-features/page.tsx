import Link from "next/link";
import { PlatformFeatureToggleCard } from "@/components/admin/PlatformFeatureToggleCard";

export default function PlatformFeaturesPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <Link
          href="/dashboard"
          className="text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          Dashboard
        </Link>
        <span className="px-2 text-neutral-400 dark:text-neutral-600">/</span>
        <Link
          href="/settings"
          className="text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          Settings
        </Link>
        <span className="px-2 text-neutral-400 dark:text-neutral-600">/</span>
        <span className="text-neutral-900 dark:text-neutral-50">Platform features</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
        Platform features
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500 sm:text-[15px] dark:text-neutral-400">
        Turn a feature off here and no shop can use it, no matter what that
        shop&apos;s own toggle says. Turn it back on to hand control back to
        the per-business setting on each shop&apos;s page.
      </p>

      <div className="mt-7 max-w-2xl">
        <PlatformFeatureToggleCard />
      </div>
    </main>
  );
}
