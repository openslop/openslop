import { describe, expect, it, vi } from "vitest";
import { memoAsync } from "../memo-async";

describe("memoAsync", () => {
	it("runs the work once per key and hands every caller the same promise", async () => {
		const make = vi.fn((key: string) => Promise.resolve(`made ${key}`));
		const memoized = memoAsync(make, (key) => key);

		const [a, again, b] = await Promise.all([
			memoized("a"),
			memoized("a"),
			memoized("b"),
		]);

		expect([a, again, b]).toEqual(["made a", "made a", "made b"]);
		expect(make).toHaveBeenCalledTimes(2);
		await expect(memoized("a")).resolves.toBe("made a");
		expect(make).toHaveBeenCalledTimes(2);
	});

	it("forgets a rejection so the next call tries again", async () => {
		const make = vi
			.fn<(key: string) => Promise<string>>()
			.mockRejectedValueOnce(new Error("the moment, not the input"))
			.mockResolvedValueOnce("made a");
		const memoized = memoAsync(make, (key) => key);

		await expect(memoized("a")).rejects.toThrow("the moment");
		await expect(memoized("a")).resolves.toBe("made a");
		expect(make).toHaveBeenCalledTimes(2);
	});

	it("keeps only the most recently used keys when given a max", async () => {
		const make = vi.fn((key: string) => Promise.resolve(`made ${key}`));
		const memoized = memoAsync(make, (key) => key, { max: 2 });

		await memoized("a");
		await memoized("b");
		await memoized("a");
		await memoized("c");
		expect(make).toHaveBeenCalledTimes(3);

		await memoized("a");
		await memoized("c");
		expect(make).toHaveBeenCalledTimes(3);

		await memoized("b");
		expect(make).toHaveBeenCalledTimes(4);
	});

	it("forgets a rejection so the next call tries again, with a max", async () => {
		const make = vi
			.fn<(key: string) => Promise<string>>()
			.mockRejectedValueOnce(new Error("the moment, not the input"))
			.mockResolvedValueOnce("made a");
		const memoized = memoAsync(make, (key) => key, { max: 1 });

		await expect(memoized("a")).rejects.toThrow("the moment");
		await expect(memoized("a")).resolves.toBe("made a");
		expect(make).toHaveBeenCalledTimes(2);
	});

	it("keys on every argument the resolver names", async () => {
		const make = vi.fn((url: string, frame: string) =>
			Promise.resolve(`${frame}@${url}`),
		);
		const memoized = memoAsync(make, (url, frame) => `${frame}@${url}`);

		await expect(memoized("vid", "last")).resolves.toBe("last@vid");
		await expect(memoized("vid", "first")).resolves.toBe("first@vid");
		await expect(memoized("vid", "last")).resolves.toBe("last@vid");
		expect(make).toHaveBeenCalledTimes(2);
	});
});
