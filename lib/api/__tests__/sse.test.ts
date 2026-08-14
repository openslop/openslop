import { describe, expect, it, vi } from "vitest";
import {
	formatSSE,
	createSSEResponse,
	createSSEStreamResponse,
	readSSE,
} from "../sse";
import { logger } from "../logger";

function makeSSEStream(chunks: string[]): ReadableStream {
	const encoder = new TextEncoder();
	return new ReadableStream({
		start(controller) {
			for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
			controller.close();
		},
	});
}

describe("formatSSE", () => {
	it("formats data as SSE line", () => {
		expect(formatSSE({ type: "done" })).toBe('data: {"type":"done"}\n\n');
	});

	it("formats string data", () => {
		expect(formatSSE("hello")).toBe('data: "hello"\n\n');
	});

	it("formats null", () => {
		expect(formatSSE(null)).toBe("data: null\n\n");
	});
});

describe("createSSEResponse", () => {
	it("returns a Response with SSE headers", () => {
		const response = createSSEResponse(async () => {});
		expect(response.headers.get("Content-Type")).toBe("text/event-stream");
		expect(response.headers.get("Cache-Control")).toBe("no-cache");
		expect(response.headers.get("Connection")).toBe("keep-alive");
	});

	it("streams messages sent by handler", async () => {
		const response = createSSEResponse(async (send) => {
			await send({ type: "phase", phase: "loading", progress: 50 });
			await send({ type: "done", url: "https://example.com", size: 100 });
		});

		const text = await response.text();
		expect(text).toContain('"type":"phase"');
		expect(text).toContain('"type":"done"');
	});

	it("closes the stream after handler completes", async () => {
		const response = createSSEResponse(async (send) => {
			await send("ok");
		});

		const body = response.body;
		if (!body) throw new Error("expected response body");
		const reader = body.getReader();

		const chunks: string[] = [];
		const decoder = new TextDecoder();
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(decoder.decode(value));
		}
		expect(chunks.length).toBeGreaterThan(0);
	});

	it("emits an error event and closes when handler rejects with an Error", async () => {
		const response = createSSEResponse(async () => {
			throw new Error("boom");
		});
		const text = await response.text();
		expect(text).toContain('"type":"error"');
		expect(text).toContain("boom");
	});

	it("emits the stringified message when handler rejects with a non-Error", async () => {
		const response = createSSEResponse(async () => {
			throw "string failure";
		});
		const text = await response.text();
		expect(text).toContain('"type":"error"');
		expect(text).toContain("string failure");
	});
});

describe("createSSEStreamResponse", () => {
	it("returns a Response with SSE headers", () => {
		const response = createSSEStreamResponse((async function* () {})(), "test");
		expect(response.headers.get("Content-Type")).toBe("text/event-stream");
	});

	it("streams every chunk, then closes", async () => {
		async function* chunks() {
			yield { a: 1 };
			yield { b: 2 };
		}
		const text = await createSSEStreamResponse(chunks(), "test").text();
		expect(text).toBe('data: {"a":1}\n\ndata: {"b":2}\n\n');
	});

	it("closes the source when the consumer cancels, without logging an error", async () => {
		const error = vi.spyOn(logger, "error").mockImplementation(() => {});
		let closed = false;
		async function* endless() {
			try {
				for (let n = 0; ; n++) yield { n };
			} finally {
				closed = true;
			}
		}
		const body = createSSEStreamResponse(endless(), "test").body;
		if (!body) throw new Error("expected response body");
		const reader = body.getReader();

		await reader.read();
		await reader.cancel();

		expect(closed).toBe(true);
		expect(error).not.toHaveBeenCalled();
		error.mockRestore();
	});

	it("errors the stream and logs when the source throws", async () => {
		const error = vi.spyOn(logger, "error").mockImplementation(() => {});
		async function* failing() {
			yield { a: 1 };
			throw new Error("upstream died");
		}
		const response = createSSEStreamResponse(failing(), "test");

		await expect(response.text()).rejects.toThrow("upstream died");
		expect(error).toHaveBeenCalledWith(expect.any(Error), "test stream error");
		error.mockRestore();
	});
});

describe("readSSE", () => {
	it("parses single SSE event", async () => {
		const stream = makeSSEStream(['data: {"msg":"hello"}\n\n']);
		const results: unknown[] = [];
		for await (const event of readSSE(stream)) {
			results.push(event);
		}
		expect(results).toEqual([{ msg: "hello" }]);
	});

	it("parses multiple SSE events in one chunk", async () => {
		const stream = makeSSEStream(['data: {"a":1}\n\ndata: {"b":2}\n\n']);
		const results: unknown[] = [];
		for await (const event of readSSE(stream)) {
			results.push(event);
		}
		expect(results).toEqual([{ a: 1 }, { b: 2 }]);
	});

	it("handles events split across chunks", async () => {
		const stream = makeSSEStream(['data: {"spl', 'it":"yes"}\n\n']);
		const results: unknown[] = [];
		for await (const event of readSSE(stream)) {
			results.push(event);
		}
		expect(results).toEqual([{ split: "yes" }]);
	});

	it("skips blocks that don't start with data:", async () => {
		const stream = makeSSEStream(['event: update\n\ndata: {"x":1}\n\n']);
		const results: unknown[] = [];
		for await (const event of readSSE(stream)) {
			results.push(event);
		}
		expect(results).toEqual([{ x: 1 }]);
	});

	it("skips malformed JSON", async () => {
		const stream = makeSSEStream([
			"data: {bad json}\n\n",
			'data: {"good":true}\n\n',
		]);
		const results: unknown[] = [];
		for await (const event of readSSE(stream)) {
			results.push(event);
		}
		expect(results).toEqual([{ good: true }]);
	});

	it("returns empty for empty stream", async () => {
		const stream = makeSSEStream([]);
		const results: unknown[] = [];
		for await (const event of readSSE(stream)) {
			results.push(event);
		}
		expect(results).toEqual([]);
	});

	it("handles trailing buffer without double newline", async () => {
		const stream = makeSSEStream([
			'data: {"a":1}\n\ndata: {"incomplete":true}',
		]);
		const results: unknown[] = [];
		for await (const event of readSSE(stream)) {
			results.push(event);
		}
		expect(results).toEqual([{ a: 1 }]);
	});

	it("cancels the body when the consumer breaks early", async () => {
		let cancelled = false;
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode('data: {"a":1}\n\n'));
				controller.enqueue(encoder.encode('data: {"b":2}\n\n'));
			},
			cancel() {
				cancelled = true;
			},
		});

		for await (const event of readSSE(stream)) {
			expect(event).toEqual({ a: 1 });
			break;
		}

		expect(cancelled).toBe(true);
		// Cancelling also releases the lock; otherwise getReader() would throw.
		expect(() => stream.getReader()).not.toThrow();
	});
});
