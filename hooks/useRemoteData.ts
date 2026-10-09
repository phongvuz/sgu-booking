"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api-client";

// Mỗi lần đổi bộ lọc hoặc tải lại sẽ hủy request cũ.
export function useRemoteData<T>(load: (signal: AbortSignal) => Promise<T>, initialData: T) {
  // Tăng version để tải lại ngay cả khi bộ lọc không đổi.
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{
    data: T;
    error: string | null;
    source: typeof load | null;
    version: number;
  }>({ data: initialData, error: null, source: null, version: -1 });

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ data, error: null, source: load, version });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setResult((previous) => ({ ...previous, error: getErrorMessage(error), source: load, version }));
        }
      },
    );
    return () => controller.abort();
  }, [load, version]);

  const refresh = useCallback(() => setVersion((previous) => previous + 1), []);
  // Nếu kết quả chưa thuộc bộ lọc/lần tải hiện tại thì vẫn đang tải.
  const loading = result.source !== load || result.version !== version;
  return { data: result.data, error: loading ? null : result.error, loading, refresh };
}
