"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useDebouncedSearch(initialValue: string, onApply: () => void) {
  const [search, setSearch] = useState(initialValue);
  const [appliedSearch, setAppliedSearch] = useState(initialValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const changeSearch = useCallback((value: string) => {
    setSearch(value);
    cancel();
    timer.current = setTimeout(() => {
      setAppliedSearch(value);
      onApply();
      timer.current = null;
    }, 350);
  }, [cancel, onApply]);

  const resetSearch = useCallback(() => {
    cancel();
    setSearch("");
    setAppliedSearch("");
  }, [cancel]);

  useEffect(() => cancel, [cancel]);
  return { search, appliedSearch, changeSearch, resetSearch };
}
