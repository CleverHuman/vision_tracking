import { useState, useCallback, useEffect, useRef } from "react";
import type { ApiPaginated } from "@/types/api";

interface PaginatedState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  setPage: (page: number) => void;
  refresh: () => void;
}

export function usePaginated<TApi, TFront>(
  fetchFn: (page: number, limit: number) => Promise<ApiPaginated<TApi>>,
  mapper: (item: TApi) => TFront,
  limit = 20,
  deps: unknown[] = []
): PaginatedState<TFront> {
  const [data, setData] = useState<TFront[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchFn(page, limit);
      if (mountedRef.current) {
        setData(res.data.map(mapper));
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, fetchFn, mapper, ...deps]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return { data, isLoading, error, page, totalPages, total, setPage, refresh };
}
