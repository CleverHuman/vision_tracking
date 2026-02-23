import { useCallback } from "react";
import { api } from "@/lib/api-client";
import { mapHighlightFromApi } from "@/lib/mappers";
import { usePaginated } from "./use-paginated";
import { useMutation } from "./use-async";
import type { ApiHighlight, ApiPaginated } from "@/types/api";
import type { Highlight } from "@/types";

interface HighlightFilters {
  videoId?: string;
  eventType?: string;
  search?: string;
}

export function useHighlights(filters: HighlightFilters = {}, limit = 20) {
  const fetchFn = useCallback(
    (page: number, lim: number) =>
      api.get<ApiPaginated<ApiHighlight>>("/highlights", {
        page,
        limit: lim,
        videoId: filters.videoId,
        eventType: filters.eventType,
        search: filters.search,
      }),
    [filters.videoId, filters.eventType, filters.search]
  );

  const mapper = useCallback((h: ApiHighlight) => mapHighlightFromApi(h), []);

  return usePaginated<ApiHighlight, Highlight>(fetchFn, mapper, limit, [
    filters.videoId,
    filters.eventType,
    filters.search,
  ]);
}

export function useCreateHighlight() {
  return useMutation<
    Highlight,
    { title: string; videoId: string; startTime: number; endTime: number; eventType?: string; tags?: string[] }
  >(async (input) => {
    const h = await api.post<ApiHighlight>("/highlights", input);
    return mapHighlightFromApi(h);
  });
}

export function useDeleteHighlight() {
  return useMutation<void, string>((id) => api.delete(`/highlights/${id}`));
}
