"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readStoredTheme, systemTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? systemTheme());

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const activeTheme = theme ?? "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={activeTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={activeTheme === "dark"}
      title={activeTheme === "dark" ? "Light mode" : "Dark mode"}
      className="group relative inline-flex h-9 w-[4.5rem] items-center rounded-full border border-border bg-muted/70 p-1 text-muted-foreground transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-10 sm:w-20"
    >
      <span
        className={[
          "absolute top-1 size-7 rounded-full bg-background shadow-sm transition-transform sm:size-8",
          activeTheme === "dark" ? "translate-x-8 sm:translate-x-10" : "translate-x-0",
        ].join(" ")}
      />
      <span className="relative z-10 grid size-7 place-items-center sm:size-8">
        <Sun
          className={[
            "size-4 transition",
            activeTheme === "light" ? "text-amber-500" : "text-muted-foreground",
          ].join(" ")}
          aria-hidden
        />
      </span>
      <span className="relative z-10 grid size-7 place-items-center sm:size-8">
        <Moon
          className={[
            "size-4 transition",
            activeTheme === "dark" ? "text-green-400" : "text-muted-foreground",
          ].join(" ")}
          aria-hidden
        />
      </span>
    </button>
  );
}
