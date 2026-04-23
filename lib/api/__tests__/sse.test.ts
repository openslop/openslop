import { describe, expect, it } from "vitest";
import { formatSSE, createSSEResponse, readSSE } from "../sse";

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
});
