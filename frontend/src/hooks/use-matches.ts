import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { mapMatchFromApi, mapEventFromApi } from "@/lib/mappers";
import { usePaginated } from "./use-paginated";
import type { ApiMatch, ApiEvent, ApiPaginated } from "@/types/api";
import type { Match, MatchEvent } from "@/types";

interface MatchFilters {
  sport?: string;
  competition?: string;
  result?: string;
  teamId?: string;
  search?: string;
}

export function useMatches(filters: MatchFilters = {}, limit = 20) {
  const fetchFn = useCallback(
    (page: number, lim: number) =>
      api.get<ApiPaginated<ApiMatch>>("/matches", {
        page,
        limit: lim,
        sport: filters.sport,
        competition: filters.competition,
        result: filters.result,
        teamId: filters.teamId,
        search: filters.search,
      }),
    [filters.sport, filters.competition, filters.result, filters.teamId, filters.search]
  );

  const mapper = useCallback((m: ApiMatch) => mapMatchFromApi(m), []);

  return usePaginated<ApiMatch, Match>(fetchFn, mapper, limit, [
    filters.sport,
    filters.competition,
    filters.result,
    filters.teamId,
    filters.search,
  ]);
}

export function useMatch(id: string | null) {
  const [data, setData] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (matchId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const m = await api.get<ApiMatch>(`/matches/${matchId}`);
      setData(mapMatchFromApi(m));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load match");
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

export function useMatchEvents(id: string | null) {
  const [data, setData] = useState<MatchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (matchId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const events = await api.get<ApiEvent[]>(`/matches/${matchId}/events`);
      setData(events.map(mapEventFromApi));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    load(id);
  }, [id, load]);

  if (!id) return { data: [], isLoading: false, error: null };
  return { data, isLoading, error };
}
