import Link from "next/link";
import { PlatformFeatureToggleCard } from "@/components/admin/PlatformFeatureToggleCard";

export default function PlatformFeaturesPage() {
  return (
   <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 bg-background text-foreground">
  <nav aria-label="Breadcrumb" className="mb-5 text-sm">
    <Link
      href="/dashboard"
      className="text-muted-foreground transition hover:text-foreground"
    >
      Dashboard
    </Link>
    <span className="px-2 text-muted-foreground">/</span>
    <Link
      href="/settings"
      className="text-muted-foreground transition hover:text-foreground"
    >
      Settings
    </Link>
    <span className="px-2 text-muted-foreground">/</span>
    <span className="text-foreground">Platform features</span>
  </nav>

  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
    Platform features
  </h1>
  <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
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
