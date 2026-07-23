import { beforeEach, describe, expect, it, vi } from "vitest";
import { impersonateUser } from "../impersonate";

describe("impersonateUser", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	it("GETs the impersonate route with the email query param", async () => {
		fetchMock.mockResolvedValue({ ok: true });

		await impersonateUser("user@example.com");

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/dev/impersonate?email=user%40example.com",
			{ method: "GET" },
		);
	});

	it("surfaces the route's error envelope on failure", async () => {
		fetchMock.mockResolvedValue({
			ok: false,
			status: 400,
			statusText: "Bad Request",
			json: async () => ({ error: "Cannot impersonate unknown@x.com" }),
		});

		await expect(impersonateUser("unknown@x.com")).rejects.toThrow(
			"Cannot impersonate unknown@x.com",
		);
	});
});
