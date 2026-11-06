import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, POST } from "../route";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
}));

const mockVerify = vi.fn();
vi.mock("@/lib/api/providers/byok", () => ({
	verifyProviderKey: (...args: unknown[]) => mockVerify(...args),
}));

const mockRpc = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
	createServiceClient: () => ({ rpc: mockRpc }),
}));

const storedRows = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
	createClient: async () => ({
		from: () => ({
			select: () => ({
				eq: () => ({
					order: async () => ({ data: storedRows(), error: null }),
				}),
			}),
		}),
	}),
}));

const STORED_KEY = "sk-ant-a-stored-key";

const rpcOk = { data: null, error: null };
const rpcFailed = { data: null, error: { message: "vault unavailable" } };

const anthropicRow = {
	provider: "anthropic",
	last4: "-key",
	status: "valid",
	verified_at: "2026-11-03",
	created_at: "2026-10-26",
};

const HANDLERS = { POST, DELETE };

const call = (method: keyof typeof HANDLERS, provider = "anthropic") =>
	HANDLERS[method](
		new NextRequest(
			new URL(`/api/providers/${provider}`, "http://localhost:3000"),
			{ method },
		),
		{ params: Promise.resolve({ provider }) },
	);

beforeEach(() => {
	mockGetUser.mockResolvedValue({ id: "u1", app_metadata: {} });
	mockRpc.mockImplementation(async (fn: string) =>
		fn === "provider_key_read" ? { data: STORED_KEY, error: null } : rpcOk,
	);
	mockVerify.mockResolvedValue({ ok: true });
	storedRows.mockReturnValue([anthropicRow]);
});

it.each(["POST", "DELETE"] as const)(
	"%s answers 404 for a provider nobody brings a key for, without opening the vault",
	async (method) => {
		expect((await call(method, "openslop")).status).toBe(404);
		expect(mockRpc).not.toHaveBeenCalled();
	},
);

describe("POST /api/providers/[provider]", () => {
	it("tells the caller to connect the provider when no key is stored", async () => {
		mockRpc.mockResolvedValueOnce(rpcOk);

		const res = await call("POST");

		expect(res.status).toBe(400);
		expect(await res.json()).toEqual({
			error: "Connect Anthropic to use this model.",
		});
		expect(mockVerify).not.toHaveBeenCalled();
	});

	it("re-checks the stored key and answers with the verdict beside the list", async () => {
		const res = await call("POST");

		expect(res.status).toBe(200);
		expect(mockVerify).toHaveBeenCalledExactlyOnceWith(
			"u1",
			"anthropic",
			STORED_KEY,
		);
		expect(await res.json()).toMatchObject({
			validation: { ok: true },
			providerKeys: [{ provider: "openslop" }, { provider: "anthropic" }],
		});
	});

	it("passes on a key the vendor now rejects", async () => {
		const rejected = { ok: false, error: "The provider rejected this key." };
		mockVerify.mockResolvedValue(rejected);

		const res = await call("POST");

		expect(res.status).toBe(200);
		expect((await res.json()).validation).toEqual(rejected);
	});

	it("fails loudly when the vault cannot be read", async () => {
		mockRpc.mockResolvedValue(rpcFailed);

		expect((await call("POST")).status).toBe(500);
		expect(mockVerify).not.toHaveBeenCalled();
	});
});

describe("DELETE /api/providers/[provider]", () => {
	it("removes the key from the vault and answers with the keys left", async () => {
		storedRows.mockReturnValue([]);

		const res = await call("DELETE");

		expect(res.status).toBe(200);
		expect(mockRpc).toHaveBeenCalledExactlyOnceWith("provider_key_delete", {
			p_user_id: "u1",
			p_provider: "anthropic",
		});
		expect(await res.json()).toMatchObject({
			providerKeys: [{ provider: "openslop" }],
		});
	});
});
