import type { Bus, BusQueryParams, BusListResponse, BusDetailResponse, MutationResponse } from "@/types";
import type { BusFormValues } from "@/lib/validations/bus";
import { buildQuery, requestJson } from "@/lib/api-client";

export function fetchBuses(params: BusQueryParams = {}, signal?: AbortSignal) {
  return requestJson<BusListResponse>(`/api/buses?${buildQuery(params)}`, { signal });
}

export async function fetchBusById(id: string, signal?: AbortSignal) {
  const response = await requestJson<{ success: boolean; data: Bus }>(`/api/buses/${encodeURIComponent(id)}`, { signal });
  return response.data;
}

export function createBus(payload: BusFormValues) {
  return requestJson<BusDetailResponse>("/api/buses", { method: "POST", body: JSON.stringify(payload) });
}

export function updateBus(id: string, payload: BusFormValues) {
  return requestJson<BusDetailResponse>(`/api/buses/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteBus(id: string) {
  return requestJson<MutationResponse>(`/api/buses/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function changeBusStatus(id: string, status: string) {
  return requestJson<BusDetailResponse>(`/api/buses/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}
