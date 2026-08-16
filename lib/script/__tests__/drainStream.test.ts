import { describe, expect, it, vi } from "vitest";
import { drainStream } from "../drainStream";

async function* chunks(...values: string[]) {
	for (const value of values) yield value;
}

describe("drainStream", () => {
	it("delivers every chunk, then reports that it finished", async () => {
		const seen: string[] = [];

		const finished = await drainStream(
			chunks("a", "b"),
			new AbortController().signal,
			(chunk) => seen.push(chunk),
		);

		expect(seen).toEqual(["a", "b"]);
		expect(finished).toBe(true);
	});

	it("stops delivering once aborted mid-stream", async () => {
		const controller = new AbortController();
		const seen: string[] = [];

		const finished = await drainStream(
			chunks("a", "b", "c"),
			controller.signal,
			(chunk) => {
				seen.push(chunk);
				controller.abort();
			},
		);

		expect(seen).toEqual(["a"]);
		expect(finished).toBe(false);
	});

	it("does not report finishing when aborted before the stream ends", async () => {
		const controller = new AbortController();
		controller.abort();
		const onChunk = vi.fn();

		const finished = await drainStream(chunks("a"), controller.signal, onChunk);

		expect(onChunk).not.toHaveBeenCalled();
		expect(finished).toBe(false);
	});

	it("does not report finishing when aborted after the last chunk", async () => {
		const controller = new AbortController();

		const finished = await drainStream(chunks("a"), controller.signal, () =>
			controller.abort(),
		);

		expect(finished).toBe(false);
	});

	it("propagates a stream failure to the caller", async () => {
		async function* failing() {
			yield "a";
			throw new Error("upstream died");
		}

		await expect(
			drainStream(failing(), new AbortController().signal, () => {}),
		).rejects.toThrow("upstream died");
	});
});
