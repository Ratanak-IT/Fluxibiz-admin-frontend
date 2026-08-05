"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative grid size-8 place-items-center text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Sun className="size-6 scale-100 rotate-0 transition-all text-secondary hover:text-muted-foreground dark:scale-0 dark:-rotate-90" />
<Moon className="absolute size-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 dark:text-secondary dark:hover:text-secondary-foreground" />
    </button>
  );
}