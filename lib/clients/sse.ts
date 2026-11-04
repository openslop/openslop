import type { z } from "zod";

export async function* readSSE<T>(
	body: ReadableStream,
	schema: z.ZodType<T>,
): AsyncGenerator<T> {
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
				yield schema.parse(JSON.parse(part.slice(6)));
			}
		}
	} finally {
		reader.releaseLock();
	}
}
