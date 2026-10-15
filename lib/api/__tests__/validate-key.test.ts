import { beforeEach, describe, expect, it, vi } from "vitest";
import { BYOK_PROVIDERS } from "@/lib/connectors/provider-catalog";
import { setKeyStatus } from "../provider-keys";
import { validateKey, verifyProviderKey } from "../providers/byok";

vi.mock("../provider-keys", () => ({ setKeyStatus: vi.fn() }));
vi.mock("../logger", () => ({ logger: { warn: vi.fn() } }));

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal("fetch", fetchMock);
	vi.mocked(setKeyStatus).mockClear();
});

describe("validateKey", () => {
	it("sends the key in the header the vendor expects", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

		await validateKey("anthropic", "sk-test");

		const [, init] = fetchMock.mock.calls[0];
		expect(init.headers["x-api-key"]).toBe("sk-test");
	});

	it("reads a rejected key from the status", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));

		expect(await validateKey("elevenlabs", "bad")).toEqual({
			verdict: "invalid",
			error: "The provider rejected this key.",
		});
	});

	// Runware answers 200 and puts the rejection in the body.
	it("reads a rejected Runware key from the body", async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ errors: [{ message: "unauthorized" }] }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		expect(await validateKey("runware", "bad")).toEqual({
			verdict: "invalid",
			error: "The provider rejected this key.",
		});
	});

	// The user asked whether the key works; "we could not tell" is an answer.
	it("reports a provider that gave no answer in words", async () => {
		fetchMock.mockRejectedValue(new Error("network down"));

		expect(await validateKey("cartesia", "key")).toEqual({
			verdict: "unknown",
			error:
				"Could not reach the provider to check this key. Test it again in a moment.",
		});
	});

	// Every vendor a user can bring a key for has a class that can answer for it.
	it("can ask every vendor about its key", async () => {
		fetchMock.mockImplementation(
			async () => new Response("{}", { status: 200 }),
		);

		for (const provider of BYOK_PROVIDERS) {
			expect(await validateKey(provider, "key")).toEqual({ verdict: "valid" });
		}
	});
});

describe("verifyProviderKey", () => {
	it.each([
		[200, "valid"],
		[401, "invalid"],
	])("records a %i from the vendor as %s", async (status, verdict) => {
		fetchMock.mockResolvedValue(new Response("{}", { status }));

		await verifyProviderKey("u1", "cartesia", "key");

		expect(setKeyStatus).toHaveBeenCalledWith("u1", "cartesia", verdict);
	});

	// No answer is no evidence, so a key that worked yesterday keeps its status.
	it("leaves the status alone when the provider gave no answer", async () => {
		fetchMock.mockRejectedValue(new Error("network down"));

		const result = await verifyProviderKey("u1", "cartesia", "key");

		expect(result).toMatchObject({ verdict: "unknown" });
		expect(setKeyStatus).not.toHaveBeenCalled();
	});
});
