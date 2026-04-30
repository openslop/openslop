import { describe, expect, it } from "vitest";
import { streamToBuffer } from "../stream";

function makeStream(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
	return new ReadableStream({
		start(controller) {
			for (const chunk of chunks) controller.enqueue(chunk);
			controller.close();
		},
	});
}

describe("streamToBuffer", () => {
	it("converts a single chunk stream to ArrayBuffer", async () => {
		const data = new Uint8Array([1, 2, 3, 4]);
		const buffer = await streamToBuffer(makeStream([data]));
		expect(new Uint8Array(buffer)).toEqual(data);
	});

	it("concatenates multiple chunks", async () => {
		const chunks = [
			new Uint8Array([1, 2]),
			new Uint8Array([3, 4, 5]),
			new Uint8Array([6]),
		];
		const buffer = await streamToBuffer(makeStream(chunks));
		expect(new Uint8Array(buffer)).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
	});

	it("returns empty buffer for empty stream", async () => {
		const buffer = await streamToBuffer(makeStream([]));
		expect(buffer.byteLength).toBe(0);
	});

	it("handles large chunks correctly", async () => {
		const big = new Uint8Array(10_000).fill(42);
		const buffer = await streamToBuffer(makeStream([big]));
		expect(new Uint8Array(buffer).every((b) => b === 42)).toBe(true);
		expect(buffer.byteLength).toBe(10_000);
	});

	it("releases the reader lock on read error so the stream is not left locked", async () => {
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(new Uint8Array([1, 2]));
				controller.error(new Error("read failed"));
			},
		});

		await expect(streamToBuffer(stream)).rejects.toThrow("read failed");
		// After the error, the lock must be released so the stream isn't
		// permanently locked — verify by acquiring a new reader.
		expect(() => stream.getReader()).not.toThrow();
	});
});
