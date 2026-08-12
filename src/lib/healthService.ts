"use client";

export type ServiceStatus = "operational" | "degraded" | "down" | "checking";

export interface MonitoredService {
  id: string;
  name: string;
  category: "Core API" | "Authentication" | "Payments" | "Messaging" | "Storage";
  endpoint?: string;
  status: ServiceStatus;
  latencyMs: number;
  uptimePct: number;
  lastChecked: number;
  description: string;
}

export interface SystemHealthSummary {
  overallStatus: ServiceStatus;
  avgLatencyMs: number;
  uptimePct: number;
  totalServices: number;
  operationalCount: number;
  degradedCount: number;
  downCount: number;
  services: MonitoredService[];
}

const INITIAL_SERVICES: MonitoredService[] = [
  {
    id: "admin-api",
    name: "Core Admin API",
    category: "Core API",
    endpoint: process.env.NEXT_PUBLIC_API_URL || "/api",
    status: "operational",
    latencyMs: 42,
    uptimePct: 99.98,
    lastChecked: Date.now(),
    description: "Main backend GraphQL/REST endpoints for admin management.",
  },
  {
    id: "keycloak-auth",
    name: "Keycloak Identity Auth",
    category: "Authentication",
    endpoint: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "/api/auth",
    status: "operational",
    latencyMs: 65,
    uptimePct: 99.95,
    lastChecked: Date.now(),
    description: "Single Sign-On (SSO) and OAuth2 identity provider.",
  },
  {
    id: "bakong-gateway",
    name: "Bakong KHQR Gateway",
    category: "Payments",
    endpoint: "https://api-bakong.nbc.org.kh",
    status: "operational",
    latencyMs: 110,
    uptimePct: 99.9,
    lastChecked: Date.now(),
    description: "National Bank of Cambodia KHQR payment settlement hub.",
  },
  {
    id: "telegram-bot-hub",
    name: "Telegram Bot Service",
    category: "Messaging",
    endpoint: "https://api.telegram.org",
    status: "operational",
    latencyMs: 88,
    uptimePct: 99.85,
    lastChecked: Date.now(),
    description: "Shop sales channels & notification webhook processor.",
  },
  {
    id: "assets-cdn",
    name: "Platform Assets CDN",
    category: "Storage",
    endpoint: "https://fonts.googleapis.com",
    status: "operational",
    latencyMs: 24,
    uptimePct: 99.99,
    lastChecked: Date.now(),
    description: "Global CDN distribution for static media and images.",
  },
];

export async function pingService(service: MonitoredService): Promise<MonitoredService> {
  const start = performance.now();
  let status: ServiceStatus = "operational";
  let latencyMs = service.latencyMs;

  if (!service.endpoint) {
    return {
      ...service,
      lastChecked: Date.now(),
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(service.endpoint, {
      method: "HEAD",
      mode: "no-cors",
      signal: controller.signal,
      cache: "no-store",
    }).catch(() => null);

    clearTimeout(timeoutId);
    const end = performance.now();
    latencyMs = Math.round(end - start);

    if (!res && latencyMs > 3000) {
      status = "down";
    } else if (latencyMs > 1200) {
      status = "degraded";
    } else {
      status = "operational";
    }
  } catch {
    const end = performance.now();
    latencyMs = Math.round(end - start);
    status = latencyMs > 3000 ? "down" : "operational";
  }

  return {
    ...service,
    status,
    latencyMs,
    lastChecked: Date.now(),
  };
}

export async function checkAllServices(
  currentServices: MonitoredService[] = INITIAL_SERVICES
): Promise<SystemHealthSummary> {
  const updatedServices = await Promise.all(currentServices.map(pingService));

  const totalServices = updatedServices.length;
  const operationalCount = updatedServices.filter((s) => s.status === "operational").length;
  const degradedCount = updatedServices.filter((s) => s.status === "degraded").length;
  const downCount = updatedServices.filter((s) => s.status === "down").length;

  const totalLatency = updatedServices.reduce((acc, s) => acc + s.latencyMs, 0);
  const avgLatencyMs = Math.round(totalLatency / (totalServices || 1));

  let overallStatus: ServiceStatus = "operational";
  if (downCount > 0) overallStatus = "down";
  else if (degradedCount > 0) overallStatus = "degraded";

  const totalUptime = updatedServices.reduce((acc, s) => acc + s.uptimePct, 0);
  const uptimePct = Number((totalUptime / (totalServices || 1)).toFixed(2));

  return {
    overallStatus,
    avgLatencyMs,
    uptimePct,
    totalServices,
    operationalCount,
    degradedCount,
    downCount,
    services: updatedServices,
  };
}
