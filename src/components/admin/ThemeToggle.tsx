"use client";

import { ThemeToggle as BaseThemeToggle } from "@/components/dark-mode/theme-toggle";

export function ThemeToggle({
  variant = "icon",
  className = "",
}: {
  variant?: "menu" | "icon";
  className?: string;
}) {
  return <BaseThemeToggle variant={variant} className={className} />;
}

export default ThemeToggle;
