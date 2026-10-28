import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";

const mockGetUser = vi.fn();
vi.mock("@/lib/api/auth", () => ({
	getUser: () => mockGetUser(),
}));

vi.mock("@/lib/api/logger", () => ({
	logger: { error: vi.fn(), warn: vi.fn() },
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

const fetchMock = vi.fn();

const save = (apiKey = "sk-ant-a-working-key") =>
	POST(
		new NextRequest(new URL("/api/providers", "http://localhost:3000"), {
			method: "POST",
			body: JSON.stringify({ provider: "anthropic", apiKey }),
		}),
	);

const rpcOk = { data: null, error: null };
const rpcFailed = { data: null, error: { message: "vault unavailable" } };

const rpcCalls = () => mockRpc.mock.calls.map(([fn]) => fn);

describe("POST /api/providers", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", fetchMock);
		mockGetUser.mockResolvedValue({ id: "u1", app_metadata: {} });
		mockRpc.mockResolvedValue(rpcOk);
		storedRows.mockReturnValue([
			{
				provider: "anthropic",
				last4: "-key",
				status: "unverified",
				verified_at: null,
				created_at: "2026-10-26",
			},
		]);
	});

	it("refuses a key too short to be one before storing anything", async () => {
		expect((await save("short")).status).toBe(400);
		expect(mockRpc).not.toHaveBeenCalled();
	});

	it("checks the key, then stores it as valid and answers with the list", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

		const res = await save();

		expect(res.status).toBe(200);
		expect(rpcCalls()).toEqual(["provider_key_set", "provider_key_set_status"]);
		expect(mockRpc).toHaveBeenCalledWith("provider_key_set", {
			p_user_id: "u1",
			p_provider: "anthropic",
			p_key: "sk-ant-a-working-key",
			p_last4: "-key",
		});
		expect(mockRpc).toHaveBeenCalledWith(
			"provider_key_set_status",
			expect.objectContaining({ p_status: "valid" }),
		);
		expect(await res.json()).toMatchObject({
			validation: { ok: true },
			providerKeys: [{ provider: "openslop" }, { provider: "anthropic" }],
		});
	});

	it("never stores a key the provider rejects and says why", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));

		const res = await save();

		expect(res.status).toBe(200);
		expect(mockRpc).not.toHaveBeenCalled();
		expect((await res.json()).validation).toEqual({
			ok: false,
			error: "The provider rejected this key.",
		});
	});

	it("fails the save with nothing stored when the provider gives no answer", async () => {
		fetchMock.mockRejectedValue(new Error("network down"));

		expect((await save()).status).toBe(500);
		expect(mockRpc).not.toHaveBeenCalled();
	});

	it("fails loudly when the vault refuses the key", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
		mockRpc.mockResolvedValue(rpcFailed);

		expect((await save()).status).toBe(500);
		expect(rpcCalls()).toEqual(["provider_key_set"]);
	});
});
