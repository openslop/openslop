import { beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "../logger";
import { MissingProviderKeyError } from "../provider-keys";
import { withPublic } from "../with-auth";

vi.mock("next/headers", () => ({
	headers: async () => new Headers({ "x-vercel-id": "iad1::abc-123" }),
}));

vi.mock("../logger", () => ({
	logger: { error: vi.fn() },
}));

vi.mock("../auth", () => ({
	getUser: async () => ({ id: "user-1" }),
}));

vi.mock("../provider-keys", () => ({
	hasApiAccess: () => true,
	MissingProviderKeyError: class MissingProviderKeyError extends Error {},
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe("unexpected route errors", () => {
	it("returns a generic message and logs the internal error under the platform request id", async () => {
		const internal =
			'Postgres error: relation "users_private_notes" does not exist';
		const response = await withPublic("TestRoute", async () => {
			throw new Error(internal);
		});

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: "TestRoute failed" });
		expect(logger.error).toHaveBeenCalledWith(
			{
				err: expect.objectContaining({ message: internal }),
				requestId: "iad1::abc-123",
			},
			"TestRoute failed",
		);
	});

	it("keeps the typed provider-key message on the 400 path", async () => {
		const response = await withPublic("TestRoute", async () => {
			throw new MissingProviderKeyError("openslop");
		});

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: "openslop",
		});
		expect(logger.error).not.toHaveBeenCalled();
	});
});
