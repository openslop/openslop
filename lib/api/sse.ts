export type SSEMessage =
  | { type: "phase"; phase: string; progress: number; subtitle?: string }
  | { type: "done"; url: string; size: number }
  | { type: "error"; message: string };

export function formatSSE(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
} as const;

export function createSSEResponse(
  handler: (send: (message: unknown) => Promise<void>) => Promise<void>,
): Response {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = async (message: unknown) => {
    await writer.write(encoder.encode(formatSSE(message)));
  };

  handler(send).finally(() => writer.close());

  return new Response(stream.readable, { headers: SSE_HEADERS });
}

export async function* readSSE<T>(body: ReadableStream): AsyncGenerator<T> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      if (!part.startsWith("data: ")) continue;
      try {
        yield JSON.parse(part.slice(6)) as T;
      } catch {
        // skip malformed SSE events
      }
    }
  }
}
