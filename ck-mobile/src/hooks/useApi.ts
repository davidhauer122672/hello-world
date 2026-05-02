/**
 * useApi — React hook for making authenticated API calls with loading/error state.
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  }, []);

  return { ...state, execute };
}

/**
 * useInterval — Safe interval hook that cleans up on unmount.
 */
export function useInterval(callback: () => void, delay: number | null) {
  const { useEffect, useRef } = require('react');
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
