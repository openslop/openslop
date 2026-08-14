import { stringifyError } from "../errors";
import { logger } from "./logger";

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

	handler(send)
		.catch((err) =>
			send({
				type: "error",
				message: stringifyError(err),
			}).catch((sendErr) =>
				logger.warn({ err: sendErr }, "SSE: failed to deliver error frame"),
			),
		)
		.finally(() =>
			writer
				.close()
				.catch((closeErr) =>
					logger.warn({ err: closeErr }, "SSE: writer close failed"),
				),
		);

	return new Response(stream.readable, { headers: SSE_HEADERS });
}

/**
 * Pulls one chunk per read so a client that stops reading stops the source, and
 * closes the source on cancel. Draining `iter` eagerly instead would keep the
 * provider generating for a client that has already hung up, and would only
 * notice on the enqueue that throws.
 */
export function createSSEStreamResponse<T>(
	iter: AsyncIterable<T>,
	label: string,
): Response {
	const encoder = new TextEncoder();
	const source = iter[Symbol.asyncIterator]();
	const stream = new ReadableStream({
		async pull(controller) {
			try {
				const { done, value } = await source.next();
				if (done) {
					controller.close();
					return;
				}
				controller.enqueue(encoder.encode(formatSSE(value)));
			} catch (error) {
				logger.error(error, `${label} stream error`);
				controller.error(error);
			}
		},
		async cancel(reason) {
			await source.return?.(reason);
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
		// Cancel before releasing: a consumer that stops early leaves the response
		// body unread, and only cancelling tears the connection down so the server
		// learns to stop producing.
		await reader.cancel();
		reader.releaseLock();
	}
}
