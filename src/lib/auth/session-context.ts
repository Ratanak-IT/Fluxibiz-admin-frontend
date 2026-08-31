"use client";

import { useEffect, useState } from "react";

export type SessionContext = {
  subject: string | null;
  username: string | null;
  roles: string[];
  isSuperAdmin: boolean;
};

let inflight: Promise<SessionContext | null> | null = null;

export function fetchSessionContext(options?: {
  force?: boolean;
}): Promise<SessionContext | null> {
  if (options?.force) {
    inflight = null;
  }

  if (!inflight) {
    inflight = fetch("/api/session-context", { cache: "no-store" })
      .then((response) =>
        response.ok ? (response.json() as Promise<SessionContext>) : null
      )
      .catch(() => null);

    inflight = inflight.then((value) => {
      if (value === null) inflight = null;
      return value;
    });
  }

  return inflight;
}

export function clearSessionContext(): void {
  inflight = null;
}

export function useSessionContext(): SessionContext | null {
  const [context, setContext] = useState<SessionContext | null>(null);

  useEffect(() => {
    let active = true;

    fetchSessionContext().then((ctx) => {
      if (active) setContext(ctx);
    });

    return () => {
      active = false;
    };
  }, []);

  return context;
}
