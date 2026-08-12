export type NotificationCategory = "BUSINESS" | "CHANNEL" | "SECURITY" | "SYSTEM";
export type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

export type AdminNotificationType =
  | "BUSINESS_REGISTERED"
  | "BUSINESS_ACTIVATED"
  | "BUSINESS_SUSPENDED"
  | "BUSINESS_CLOSED"
  | "BUSINESS_REOPENED"
  | "STOREFRONT_PUBLISHED"
  | "TELEGRAM_BOT_CONNECTED"
  | "TELEGRAM_BOT_DISCONNECTED"
  | "KHQR_BAKONG_CONFIGURED"
  | "MASTER_FEATURE_TOGGLED"
  | "STAFF_REGISTERED"
  | "STAFF_ROLE_UPDATED"
  | "SERVICE_DEGRADED"
  | "SERVICE_DOWN"
  | "GENERAL";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  targetId?: string | null;
  targetType?: string | null;
  read: boolean;
  createdAt: string;
  actorUsername?: string | null;
  actionUrl?: string | null;
}
