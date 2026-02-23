import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { mapAnalysisJobFromApi, mapHeatmapFromApi, analysisTypeToBackend } from "@/lib/mappers";
import { useMutation } from "./use-async";
import type { ApiAnalysisJob, ApiPlayerTracking, ApiHeatmapPoint } from "@/types/api";
import type { AnalysisResult, AnalysisType, HeatMapPoint } from "@/types";

export function useStartAnalysis() {
  return useMutation<AnalysisResult, { videoId: string; type: AnalysisType; matchId?: string }>(
    async (input) => {
      const job = await api.post<ApiAnalysisJob>("/analysis/start", {
        videoId: input.videoId,
        type: analysisTypeToBackend(input.type),
        matchId: input.matchId,
      });
      return mapAnalysisJobFromApi(job);
    }
  );
}

export function useAnalysisJob(jobId: string | null) {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!jobId) return;
    api
      .get<ApiAnalysisJob>(`/analysis/${jobId}`)
      .then((job) => setData(mapAnalysisJobFromApi(job)))
      .catch(() => {});
  }, [jobId]);

  const load = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const job = await api.get<ApiAnalysisJob>(`/analysis/${id}`);
      setData(mapAnalysisJobFromApi(job));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;
    load(jobId);
  }, [jobId, load]);

  // Poll while processing
  useEffect(() => {
    if (!data || data.status !== "processing") return;
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [data, data?.status, refresh]);

  if (!jobId) return { data: null, isLoading: false, error: null, refresh };
  return { data, isLoading, error, refresh };
}

export function useAnalysisTracking(jobId: string | null) {
  const [data, setData] = useState<ApiPlayerTracking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const tracking = await api.get<ApiPlayerTracking[]>(`/analysis/${id}/tracking`);
      setData(tracking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tracking data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;
    load(jobId);
  }, [jobId, load]);

  if (!jobId) return { data: [] as ApiPlayerTracking[], isLoading: false, error: null };
  return { data, isLoading, error };
}

export function useAnalysisHeatmap(jobId: string | null, playerId: string | null) {
  const [data, setData] = useState<HeatMapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (jId: string, pId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const points = await api.get<ApiHeatmapPoint[]>(`/analysis/${jId}/heatmap/${pId}`);
      setData(mapHeatmapFromApi(points));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load heatmap");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId || !playerId) return;
    load(jobId, playerId);
  }, [jobId, playerId, load]);

  if (!jobId || !playerId) return { data: [] as HeatMapPoint[], isLoading: false, error: null };
  return { data, isLoading, error };
}
