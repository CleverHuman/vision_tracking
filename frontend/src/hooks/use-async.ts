import { useState, useCallback, useEffect, useRef } from "react";

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

export function useAsync<T>(
  asyncFn?: () => Promise<T>,
  immediate = true
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate && !!asyncFn);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: unknown[]) => {
      setIsLoading(true);
      setError(null);
      try {
        const fn = (args[0] as (() => Promise<T>) | undefined) ?? asyncFn;
        if (!fn) throw new Error("No async function provided");
        const result = await fn();
        if (mountedRef.current) {
          setData(result);
          setIsLoading(false);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          const message =
            err instanceof Error ? err.message : "An error occurred";
          setError(message);
          setIsLoading(false);
        }
        return null;
      }
    },
    [asyncFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (immediate && asyncFn) {
      execute();
    }
  }, [immediate, asyncFn, execute]);

  return { data, isLoading, error, execute, reset };
}

// Simpler version for mutations (no auto-execute)
export function useMutation<TData, TInput = void>(
  mutationFn: (input: TInput) => Promise<TData>
) {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(input);
        setData(result);
        setIsLoading(false);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
        setIsLoading(false);
        throw err;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, mutate, reset };
}
