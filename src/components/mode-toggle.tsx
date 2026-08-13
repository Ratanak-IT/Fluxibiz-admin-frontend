"use client";

import ThemeToggle from "@/components/dark-mode/theme-toggle";

export function ModeToggle({
  variant = "icon",
  className = "",
}: {
  variant?: "menu" | "icon";
  className?: string;
}) {
  return <ThemeToggle variant={variant} className={className} />;
}

export default ModeToggle;