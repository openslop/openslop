import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/api/logger";
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
vi.stubGlobal("fetch", fetchMock);

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
		vi.clearAllMocks();
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

	it("stores the key, marks it valid and answers with the list", async () => {
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

	it("keeps a rejected key and says the vendor refused it", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));

		const res = await save();

		expect(res.status).toBe(200);
		expect(mockRpc).toHaveBeenCalledWith(
			"provider_key_set_status",
			expect.objectContaining({ p_status: "invalid" }),
		);
		expect((await res.json()).validation).toEqual({
			ok: false,
			error: "The provider rejected this key.",
		});
	});

	it("keeps a key the vendor never answered for and says so beside it", async () => {
		fetchMock.mockRejectedValue(new Error("network down"));

		const res = await save();

		expect(res.status).toBe(200);
		expect(rpcCalls()).toEqual(["provider_key_set"]);
		expect(await res.json()).toMatchObject({
			validation: {
				ok: false,
				error:
					"Saved, but Anthropic gave no answer when the key was checked. Test it later.",
			},
			providerKeys: [{ provider: "openslop" }, { provider: "anthropic" }],
		});
		expect(logger.warn).toHaveBeenCalledWith(
			expect.objectContaining({ message: "network down" }),
			expect.any(String),
		);
	});

	it("still fails loudly when the vault refuses the key", async () => {
		mockRpc.mockResolvedValue(rpcFailed);

		expect((await save()).status).toBe(500);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("still fails loudly when the vault refuses the verdict", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
		mockRpc.mockImplementation(async (fn: string) =>
			fn === "provider_key_set_status" ? rpcFailed : rpcOk,
		);

		expect((await save()).status).toBe(500);
		expect(logger.warn).not.toHaveBeenCalled();
	});
});
