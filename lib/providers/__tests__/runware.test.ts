import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateRunwareKey } from "../runware";

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("validateRunwareKey", () => {
	it("sends the key as an authentication task", async () => {
		fetchMock.mockResolvedValue(
			Response.json({ data: [{ taskType: "authentication" }] }),
		);

		await validateRunwareKey("rw-test");

		const [, init] = fetchMock.mock.calls[0];
		expect(JSON.parse(init.body)).toEqual([
			{ taskType: "authentication", apiKey: "rw-test" },
		]);
	});

	it("reads a body with no refusal as a working key", async () => {
		fetchMock.mockResolvedValue(
			Response.json({
				data: [{ taskType: "authentication", connectionSessionUUID: "s" }],
			}),
		);

		expect(await validateRunwareKey("rw-test")).toEqual({ ok: true });
	});

	it("throws on a body that is not the endpoint's answer", async () => {
		fetchMock.mockResolvedValue(Response.json({ errors: "unauthorized" }));

		await expect(validateRunwareKey("rw-test")).rejects.toThrow();
	});
});
