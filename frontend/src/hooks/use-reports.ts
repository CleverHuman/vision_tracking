import { useCallback } from "react";
import { api } from "@/lib/api-client";
import { mapReportFromApi, reportTypeToBackend } from "@/lib/mappers";
import { usePaginated } from "./use-paginated";
import { useMutation } from "./use-async";
import type { ApiReport, ApiPaginated } from "@/types/api";
import type { Report } from "@/types";

interface ReportFilters {
  type?: string;
  status?: string;
  search?: string;
}

export function useReports(filters: ReportFilters = {}, limit = 20) {
  const fetchFn = useCallback(
    (page: number, lim: number) =>
      api.get<ApiPaginated<ApiReport>>("/reports", {
        page,
        limit: lim,
        type: filters.type,
        status: filters.status,
        search: filters.search,
      }),
    [filters.type, filters.status, filters.search]
  );

  const mapper = useCallback((r: ApiReport) => mapReportFromApi(r), []);

  return usePaginated<ApiReport, Report>(fetchFn, mapper, limit, [
    filters.type,
    filters.status,
    filters.search,
  ]);
}

export function useCreateReport() {
  return useMutation<
    Report,
    {
      title: string;
      type: Report["type"];
      matchId?: string;
      tags?: string[];
      content?: Record<string, unknown>;
    }
  >(async (input) => {
    const r = await api.post<ApiReport>("/reports/generate", {
      ...input,
      type: reportTypeToBackend(input.type),
    });
    return mapReportFromApi(r);
  });
}

export function useDeleteReport() {
  return useMutation<void, string>((id) => api.delete(`/reports/${id}`));
}
