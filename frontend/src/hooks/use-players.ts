import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { mapPlayerFromApi } from "@/lib/mappers";
import { usePaginated } from "./use-paginated";
import { useMutation } from "./use-async";
import type { ApiPlayer, ApiPlayerStats, ApiPaginated } from "@/types/api";
import type { Player } from "@/types";

interface PlayerFilters {
  position?: string;
  teamId?: string;
  search?: string;
  isActive?: boolean;
}

export function usePlayers(filters: PlayerFilters = {}, limit = 50) {
  const fetchFn = useCallback(
    (page: number, lim: number) =>
      api.get<ApiPaginated<ApiPlayer>>("/players", {
        page,
        limit: lim,
        position: filters.position,
        teamId: filters.teamId,
        search: filters.search,
        isActive: filters.isActive,
      }),
    [filters.position, filters.teamId, filters.search, filters.isActive]
  );

  const mapper = useCallback((p: ApiPlayer) => mapPlayerFromApi(p), []);

  return usePaginated<ApiPlayer, Player>(fetchFn, mapper, limit, [
    filters.position,
    filters.teamId,
    filters.search,
    filters.isActive,
  ]);
}

export function usePlayer(id: string | null) {
  const [data, setData] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (playerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [player, stats] = await Promise.all([
        api.get<ApiPlayer>(`/players/${playerId}`),
        api.get<ApiPlayerStats>(`/players/${playerId}/stats`).catch(() => undefined),
      ]);
      setData(mapPlayerFromApi(player, stats));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load player");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    load(id);
  }, [id, load]);

  if (!id) return { data: null, isLoading: false, error: null };
  return { data, isLoading, error };
}

export function usePlayerStats(id: string | null) {
  const [data, setData] = useState<ApiPlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (statsId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await api.get<ApiPlayerStats>(`/players/${statsId}/stats`);
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    load(id);
  }, [id, load]);

  if (!id) return { data: null, isLoading: false, error: null };
  return { data, isLoading, error };
}

export function usePlayerCompare() {
  return useMutation<{ players: ApiPlayer[]; stats: Record<string, ApiPlayerStats> }, string[]>(
    (playerIds) => api.post("/players/compare", { playerIds })
  );
}
