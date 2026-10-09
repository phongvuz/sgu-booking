"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/api-client";

export function useAsyncAction() {
  const [actionLoading, setActionLoading] = useState(false);

  async function runAction(action: () => Promise<string>) {
    setActionLoading(true);
    try {
      return { success: true, message: await action() };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    } finally {
      setActionLoading(false);
    }
  }

  return { actionLoading, runAction };
}
