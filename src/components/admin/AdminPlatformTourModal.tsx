"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface TourStep {
  title: string;
  description: string;
  icon: any;
  href?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Platform Admin Console",
    description: "Your centralized control hub for business moderation, security inspection, system health, and subscription growth.",
    icon: Sparkles,
    href: "/overview",
  },
  {
    title: "Business Management & Moderation",
    description: "Manage shop registrations, feature flags, storefront listings, and business categories effortlessly.",
    icon: Building2,
    href: "/businesses",
  },
  {
    title: "Security & Live Session Inspector",
    description: "Inspect active login sessions, device IPs, and revoke unauthorized access in real-time across Admins, Business Owners, and Public Users.",
    icon: ShieldCheck,
    href: "/logs/security",
  },
  {
    title: "Growth & Renewal Calendar",
    description: "Track merchant subscription expiration dates, public user trial periods, and projected monthly recurring revenue (MRR).",
    icon: Calendar,
    href: "/subscriptions/calendar",
  },
];

export function AdminPlatformTourModal() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleTrigger = () => {
      setCurrentStep(0);
      setOpen(true);
    };

    window.addEventListener("ipos_trigger_admin_tour", handleTrigger);
    return () => window.removeEventListener("ipos_trigger_admin_tour", handleTrigger);
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const target = TOUR_STEPS[nextStep].href;
      if (target) router.push(target);
    } else {
      setOpen(false);
      localStorage.setItem("ipos_admin_tour_completed", "true");
      toast.success("Admin Platform Tour completed! Press Ctrl+K anytime to launch commands.");
    }
  };

  if (!open) return null;

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {currentStep + 1}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center text-center space-y-3">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <StepIcon className="size-7" />
          </div>

          <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{step.description}</p>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Skip Tour
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90"
          >
            <span>{currentStep === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next Step"}</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
