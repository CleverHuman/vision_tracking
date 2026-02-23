import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { mapVideoFromApi } from "@/lib/mappers";
import { usePaginated } from "./use-paginated";
import { useMutation } from "./use-async";
import type { ApiVideo, ApiPaginated } from "@/types/api";
import type { Video } from "@/types";

interface VideoFilters {
  category?: string;
  sport?: string;
  status?: string;
  search?: string;
  tags?: string;
}

export function useVideos(filters: VideoFilters = {}, limit = 20) {
  const fetchFn = useCallback(
    (page: number, lim: number) =>
      api.get<ApiPaginated<ApiVideo>>("/videos", {
        page,
        limit: lim,
        category: filters.category,
        sport: filters.sport,
        status: filters.status,
        search: filters.search,
        tags: filters.tags,
      }),
    [filters.category, filters.sport, filters.status, filters.search, filters.tags]
  );

  const mapper = useCallback((v: ApiVideo) => mapVideoFromApi(v), []);

  return usePaginated<ApiVideo, Video>(fetchFn, mapper, limit, [
    filters.category,
    filters.sport,
    filters.status,
    filters.search,
    filters.tags,
  ]);
}

export function useVideo(id: string | null) {
  const [data, setData] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (videoId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const v = await api.get<ApiVideo>(`/videos/${videoId}`);
      setData(mapVideoFromApi(v));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load video");
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

export function useVideoUpload() {
  return useMutation<ApiVideo, FormData>((formData) =>
    api.upload<ApiVideo>("/videos/upload", formData)
  );
}

export function useVideoDelete() {
  return useMutation<void, string>((id) => api.delete(`/videos/${id}`));
}
