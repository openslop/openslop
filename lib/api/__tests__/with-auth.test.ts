import { beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "../logger";
import { MissingProviderKeyError } from "../provider-keys";
import { withPublic } from "../with-auth";

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
	it("returns a generic message and a request id, never the internal error", async () => {
		const internal =
			'Postgres error: relation "users_private_notes" does not exist';
		const response = await withPublic("TestRoute", async () => {
			throw new Error(internal);
		});

		expect(response.status).toBe(500);
		const body = await response.json();
		expect(body.error).toBe("TestRoute failed");
		expect(body.requestId).toMatch(/^[0-9a-f]{8}$/);
		expect(JSON.stringify(body)).not.toContain("users_private_notes");

		expect(logger.error).toHaveBeenCalledTimes(1);
		const [logged, message] = vi.mocked(logger.error).mock.calls[0];
		expect(String(logged instanceof Error ? logged.message : logged)).toContain(
			internal,
		);
		expect(message).toContain(body.requestId);
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
