import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateConnectorKey } from "../connectorValidation";

describe("validateConnectorKey", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	it("sends the key in the header the vendor expects", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

		await validateConnectorKey("anthropic", "sk-test");

		const [, init] = fetchMock.mock.calls[0];
		expect(init.headers["x-api-key"]).toBe("sk-test");
	});

	it("reads a rejected key from the status", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));

		expect(await validateConnectorKey("elevenlabs", "bad")).toEqual({
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

		expect(await validateConnectorKey("runware", "bad")).toEqual({
			ok: false,
			error: "The provider rejected this key.",
		});
	});

	// The user asked whether the key works; "we could not tell" is an answer.
	it("reports unreachable providers instead of throwing", async () => {
		fetchMock.mockRejectedValue(new Error("network down"));

		const result = await validateConnectorKey("cartesia", "key");

		expect(result.ok).toBe(false);
	});

	it("refuses the hosted provider, which takes no key", async () => {
		expect(await validateConnectorKey("openslop", "key")).toEqual({
			ok: false,
			error: "openslop does not take a key",
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
