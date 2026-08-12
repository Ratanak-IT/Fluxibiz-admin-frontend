import { SlidersHorizontal } from "lucide-react";
import { PlatformFeatureToggleCard } from "@/components/admin/PlatformFeatureToggleCard";

export default function PlatformFeaturesPage() {
  return (
    <div className="w-full pt-2">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
        <SlidersHorizontal className="h-7 w-7 text-primary" />
        Platform Features
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">
        Turn a feature off here and no shop can use it, no matter what that
        shop&apos;s own toggle says. Turn it back on to hand control back to
        the per-business setting on each shop&apos;s page.
      </p>

      <div className="mt-7 w-full">
        <PlatformFeatureToggleCard />
      </div>
    </div>
  );
}
