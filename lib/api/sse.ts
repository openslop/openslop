import { errorMessage, stringifyError } from "../errors";
import { logger } from "./logger";

type SSEErrorFrame = { type: "error"; message: string };

function isErrorFrame(event: unknown): event is SSEErrorFrame {
	return (
		typeof event === "object" &&
		event !== null &&
		(event as SSEErrorFrame).type === "error" &&
		typeof (event as SSEErrorFrame).message === "string"
	);
}

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
				// The response already streams with status 200, so the failure is
				// surfaced as an in-band error frame that readSSE rethrows.
				try {
					controller.enqueue(
						encoder.encode(
							formatSSE({ type: "error", message: errorMessage(error) }),
						),
					);
					controller.close();
				} catch {
					// Client already cancelled the stream; nothing left to deliver.
				}
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
				let event: unknown;
				try {
					event = JSON.parse(part.slice(6));
				} catch (err) {
					logger.warn({ err }, "SSE: skipping malformed event");
					continue;
				}
				if (isErrorFrame(event)) throw new Error(event.message);
				yield event as T;
			}
		}
	} finally {
		// Cancel (not just release) so abandoning the stream mid-read aborts
		// the upstream request. cancel() may echo an error already propagating
		// from read(), hence the catch.
		await reader.cancel().catch(() => undefined);
		reader.releaseLock();
	}
}
