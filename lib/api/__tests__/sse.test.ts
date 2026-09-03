import { describe, expect, it } from "vitest";
import { formatSSE, readSSE } from "../sse";

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

	it("releases the underlying reader when the consumer breaks early", async () => {
		const stream = makeSSEStream(['data: {"a":1}\n\n', 'data: {"b":2}\n\n']);
		for await (const event of readSSE(stream)) {
			expect(event).toEqual({ a: 1 });
			break;
		}
		// If the lock had not been released, getReader() would throw.
		expect(() => stream.getReader()).not.toThrow();
	});
});
