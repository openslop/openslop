import { describe, expect, it, vi } from "vitest";
import { drainStream } from "../drainStream";

async function* chunks(...values: string[]) {
	for (const value of values) yield value;
}

describe("drainStream", () => {
	it("delivers every chunk, then settles", async () => {
		const seen: string[] = [];
		const onSettled = vi.fn();

		await drainStream(
			chunks("a", "b"),
			new AbortController().signal,
			(chunk) => seen.push(chunk),
			onSettled,
		);

		expect(seen).toEqual(["a", "b"]);
		expect(onSettled).toHaveBeenCalledOnce();
	});

	it("stops delivering and skips settling once aborted mid-stream", async () => {
		const controller = new AbortController();
		const seen: string[] = [];
		const onSettled = vi.fn();

		await drainStream(
			chunks("a", "b", "c"),
			controller.signal,
			(chunk) => {
				seen.push(chunk);
				controller.abort();
			},
			onSettled,
		);

		expect(seen).toEqual(["a"]);
		expect(onSettled).not.toHaveBeenCalled();
	});

	it("skips settling when aborted before the stream ends", async () => {
		const controller = new AbortController();
		controller.abort();
		const onSettled = vi.fn();
		const onChunk = vi.fn();

		await drainStream(chunks("a"), controller.signal, onChunk, onSettled);

		expect(onChunk).not.toHaveBeenCalled();
		expect(onSettled).not.toHaveBeenCalled();
	});

	it("propagates a stream failure to the caller", async () => {
		async function* failing() {
			yield "a";
			throw new Error("upstream died");
		}
		const onSettled = vi.fn();

		await expect(
			drainStream(failing(), new AbortController().signal, () => {}, onSettled),
		).rejects.toThrow("upstream died");
		expect(onSettled).not.toHaveBeenCalled();
	});
});
