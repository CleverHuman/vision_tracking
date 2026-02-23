import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { mapPlayerFromApi } from "@/lib/mappers";
import type { ApiTeam, ApiTeamStats, ApiPlayer, ApiPaginated } from "@/types/api";
import type { Player } from "@/types";

export function useTeams() {
  const [data, setData] = useState<ApiTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<ApiPaginated<ApiTeam>>("/teams", { limit: 100 });
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error };
}

export function useTeam(id: string | null) {
  const [data, setData] = useState<ApiTeam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const team = await api.get<ApiTeam>(`/teams/${teamId}`);
      setData(team);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team");
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

export function useTeamStats(id: string | null) {
  const [data, setData] = useState<ApiTeamStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await api.get<ApiTeamStats>(`/teams/${teamId}/stats`);
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team stats");
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

export function useTeamPlayers(id: string | null) {
  const [data, setData] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiPaginated<ApiPlayer>>(`/teams/${teamId}/players`, { limit: 100 });
      setData(res.data.map((p) => mapPlayerFromApi(p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team players");
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
