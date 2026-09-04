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
	iter: AsyncIterable<T>,
	label: string,
): Response {
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			try {
				for await (const chunk of iter) {
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

export async function* readSSE<T>(body: ReadableStream): AsyncGenerator<T> {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	try {
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
				} catch (err) {
					logger.warn({ err }, "SSE: skipping malformed event");
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}
