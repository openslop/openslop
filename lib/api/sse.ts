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

export function createSSEStreamResponse<T>(
	iter: AsyncIterable<T>,
	label: string,
): Response {
	const encoder = new TextEncoder();
	const source = iter[Symbol.asyncIterator]();
	// A chunk can already be in hand when the client hangs up, and writing it
	// would fail against the closed controller and report a hangup as an error.
	let open = true;
	const stream = new ReadableStream({
		async start(controller) {
			try {
				for (;;) {
					const { done, value } = await source.next();
					if (done || !open) break;
					controller.enqueue(encoder.encode(formatSSE(value)));
				}
				if (open) controller.close();
			} catch (error) {
				logger.error(error, `${label} stream error`);
				controller.error(error);
			}
		},
		cancel: (reason) => {
			open = false;
			void source.return?.(reason);
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
