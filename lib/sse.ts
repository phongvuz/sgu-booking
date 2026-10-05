const globalForSse = global as unknown as { sseClients: Map<string, Set<ReadableStreamDefaultController>> };
export const clients = globalForSse.sseClients || new Map<string, Set<ReadableStreamDefaultController>>();

if (process.env.NODE_ENV !== "production") {
  globalForSse.sseClients = clients;
}

export function addClient(tripId: string, controller: ReadableStreamDefaultController) {
  if (!clients.has(tripId)) {
    clients.set(tripId, new Set<ReadableStreamDefaultController>());
  }
  clients.get(tripId)!.add(controller);
}

export function removeClient(tripId: string, controller: ReadableStreamDefaultController) {
  const tripClients = clients.get(tripId);
  if (tripClients) {
    tripClients.delete(controller);
    if (tripClients.size === 0) {
      clients.delete(tripId);
    }
  }
}

export function broadcast(tripId: string, data: unknown) {
  const tripClients = clients.get(tripId);
  if (tripClients) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    for (const client of tripClients) {
      try {
        client.enqueue(encoder.encode(message));
      } catch {
        removeClient(tripId, client);
      }
    }
  }
}
