"use client";

import { useEffect, useRef, useState } from "react";

const TEXT_MS = 900;
const FADE_MS = 340;
const LIFT_AT = 620;

const KEYFRAMES = `
@keyframes iposWelcomeIn {
  0%   { opacity: 0; transform: translate3d(0,0,0) scale(.93);
         animation-timing-function: cubic-bezier(.16,1,.3,1); }
  32%  { opacity: 1; transform: translate3d(0,0,0) scale(1);
         animation-timing-function: cubic-bezier(.4,0,.6,1); }
  68%  { opacity: 1; transform: translate3d(0,0,0) scale(1.05);
         animation-timing-function: cubic-bezier(.5,0,.75,0); }
  100% { opacity: 0; transform: translate3d(0,0,0) scale(1.2); }
}
.ipos-welcome-text {
  opacity: 0;
  transform: translate3d(0,0,0) scale(.93);
  backface-visibility: hidden;
}
.ipos-welcome-text[data-run="1"] {
  animation: iposWelcomeIn ${TEXT_MS}ms both;
}
@media (prefers-reduced-motion: reduce) {
  .ipos-welcome-text[data-run="1"] { animation: none; opacity: 1; transform: none; }
}
`;

export default function WelcomeIntro() {
  const [run, setRun] = useState(false);
  const [lifted, setLifted] = useState(false);
  const [mounted, setMounted] = useState(true);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    document.cookie = "ipos_welcome=; path=/; max-age=0; samesite=lax";

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setRun(true);
        timers.current.push(
          window.setTimeout(() => setLifted(true), LIFT_AT),
          window.setTimeout(() => setMounted(false), LIFT_AT + FADE_MS),
        );
      });
    });

    const pending = timers.current;
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      pending.forEach(clearTimeout);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-hidden"
      style={{
        background: "#f7f7f6",
        opacity: lifted ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(.22,1,.36,1)`,
        willChange: "opacity",
        contain: "strict",
      }}
    >
      <style>{KEYFRAMES}</style>
      <span
        className="ipos-welcome-text select-none font-semibold text-[#16181c]"
        data-run={run ? "1" : "0"}
        style={{
          fontSize: "clamp(56px, 12vw, 156px)",
          lineHeight: 1,
          willChange: "transform, opacity",
        }}
      >
        Welcome
      </span>
    </div>
  );
}