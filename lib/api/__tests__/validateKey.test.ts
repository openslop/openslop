import { beforeEach, describe, expect, it, vi } from "vitest";
import { BYOK_PROVIDERS } from "@/lib/connectors/providerCatalog";
import { validateKey } from "../providers";

describe("validateKey", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	it("sends the key in the header the vendor expects", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

		await validateKey("anthropic", "sk-test");

		const [, init] = fetchMock.mock.calls[0];
		expect(init.headers["x-api-key"]).toBe("sk-test");
	});

	it("reads a rejected key from the status", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));

		expect(await validateKey("elevenlabs", "bad")).toEqual({
			ok: false,
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
			ok: false,
			error: "The provider rejected this key.",
		});
	});

	// The user asked whether the key works; "we could not tell" is an answer.
	it("reports unreachable providers instead of throwing", async () => {
		fetchMock.mockRejectedValue(new Error("network down"));

		const result = await validateKey("cartesia", "key");

		expect(result.ok).toBe(false);
	});

	// Every vendor a user can bring a key for has a class that can answer for it.
	it("can ask every vendor about its key", async () => {
		fetchMock.mockImplementation(
			async () => new Response("{}", { status: 200 }),
		);

		for (const provider of BYOK_PROVIDERS) {
			expect(await validateKey(provider, "key")).toEqual({ ok: true });
		}
	});
});
