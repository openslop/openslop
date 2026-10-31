import { logger } from "./logger";

export function formatSSE(data: unknown): string {
	return `data: ${JSON.stringify(data)}\n\n`;
}

const SSE_HEADERS = {
	"Content-Type": "text/event-stream",
	"Cache-Control": "no-cache",
	Connection: "keep-alive",
} as const;

export function createSSEStreamResponse<T>(
	chunks: AsyncIterable<T>,
	label: string,
): Response {
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			try {
				for await (const chunk of chunks) {
					controller.enqueue(encoder.encode(formatSSE(chunk)));
				}
				controller.close();
			} catch (error) {
				logger.error(error, `${label} stream error`);
				controller.error(error);
			}
		},
	});
	return new Response(stream, { headers: SSE_HEADERS });
}
