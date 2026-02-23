import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { mapNotificationFromApi, type Notification } from "@/lib/mappers";
import type { ApiNotification } from "@/types/api";

export function useNotifications() {
  const [data, setData] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await api.get<ApiNotification[]>("/notifications");
      const mapped = res.map(mapNotificationFromApi);
      setData(mapped);
      setUnreadCount(mapped.filter((n) => !n.isRead).length);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  return { data, isLoading, error, unreadCount, refresh: load };
}

export function useMarkNotificationRead() {
  const markRead = useCallback(async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  }, []);

  const markAllRead = useCallback(async () => {
    await api.post("/notifications/read-all");
  }, []);

  return { markRead, markAllRead };
}
