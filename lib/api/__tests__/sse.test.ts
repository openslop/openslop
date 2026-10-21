import { describe, expect, it } from "vitest";
import { z, ZodError } from "zod";
import { formatSSE, readSSE } from "../sse";

const AnyEvent = z.record(z.string(), z.unknown());

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
		expect(await Array.fromAsync(readSSE(stream, AnyEvent))).toEqual([
			{ msg: "hello" },
		]);
	});

	it("parses multiple SSE events in one chunk", async () => {
		const stream = makeSSEStream(['data: {"a":1}\n\ndata: {"b":2}\n\n']);
		expect(await Array.fromAsync(readSSE(stream, AnyEvent))).toEqual([
			{ a: 1 },
			{ b: 2 },
		]);
	});

	it("handles events split across chunks", async () => {
		const stream = makeSSEStream(['data: {"spl', 'it":"yes"}\n\n']);
		expect(await Array.fromAsync(readSSE(stream, AnyEvent))).toEqual([
			{ split: "yes" },
		]);
	});

	it("skips blocks that don't start with data:", async () => {
		const stream = makeSSEStream(['event: update\n\ndata: {"x":1}\n\n']);
		expect(await Array.fromAsync(readSSE(stream, AnyEvent))).toEqual([
			{ x: 1 },
		]);
	});

	it("throws on a malformed event instead of dropping it", async () => {
		const stream = makeSSEStream([
			"data: {bad json}\n\n",
			'data: {"good":true}\n\n',
		]);
		await expect(Array.fromAsync(readSSE(stream, AnyEvent))).rejects.toThrow(
			SyntaxError,
		);
	});

	it("throws on an event of the wrong shape instead of yielding it", async () => {
		const stream = makeSSEStream(['data: {"text":1,"done":false}\n\n']);
		await expect(
			Array.fromAsync(
				readSSE(stream, z.object({ text: z.string(), done: z.boolean() })),
			),
		).rejects.toThrow(ZodError);
	});

	it("returns empty for empty stream", async () => {
		const stream = makeSSEStream([]);
		expect(await Array.fromAsync(readSSE(stream, AnyEvent))).toEqual([]);
	});

	it("handles trailing buffer without double newline", async () => {
		const stream = makeSSEStream([
			'data: {"a":1}\n\ndata: {"incomplete":true}',
		]);
		expect(await Array.fromAsync(readSSE(stream, AnyEvent))).toEqual([
			{ a: 1 },
		]);
	});

	it("releases the underlying reader when the consumer breaks early", async () => {
		const stream = makeSSEStream(['data: {"a":1}\n\n', 'data: {"b":2}\n\n']);
		for await (const event of readSSE(stream, AnyEvent)) {
			expect(event).toEqual({ a: 1 });
			break;
		}
		// If the lock had not been released, getReader() would throw.
		expect(() => stream.getReader()).not.toThrow();
	});
});
