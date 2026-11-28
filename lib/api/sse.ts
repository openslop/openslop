import { logger } from "./logger";

export function formatSSE(data: unknown): string {
	return `data: ${JSON.stringify(data)}\n\n`;
}

export const SSE_HEADERS = {
	"Content-Type": "text/event-stream",
	"Cache-Control": "no-cache",
	Connection: "keep-alive",
} as const;

export function createSSEStreamResponse<T>(
	chunks: AsyncIterable<T>,
	label: string,
): Response {
	const encoder = new TextEncoder();
	let connected = true;
	const stream = new ReadableStream({
		async start(controller) {
			try {
				for await (const chunk of chunks) {
					if (connected) controller.enqueue(encoder.encode(formatSSE(chunk)));
				}
				if (connected) controller.close();
			} catch (error) {
				logger.error(error, `${label} stream error`);
				controller.error(error);
			}
		},
		// Drained anyway: a producer books its spend after its last chunk.
		cancel() {
			connected = false;
		},
	});
	return new Response(stream, { headers: SSE_HEADERS });
}
