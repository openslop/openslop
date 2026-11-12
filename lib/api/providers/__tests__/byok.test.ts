import { beforeEach, describe, expect, it, vi } from "vitest";
import { BYOK_PROVIDERS } from "@/lib/connectors/provider-catalog";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { ElevenLabsSTT } from "@/lib/providers/stt/elevenlabs";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";
import { RunwareVideo } from "@/lib/providers/video/runware";
import {
	MissingProviderKeyError,
	readProviderKey,
	setKeyStatus,
} from "../../provider-keys";
import { byokProviderFor, validateKey, verifyProviderKey } from "../byok";

vi.mock("../../provider-keys", async (importOriginal) => ({
	...(await importOriginal<typeof import("../../provider-keys")>()),
	readProviderKey: vi.fn(),
	setKeyStatus: vi.fn(),
}));

const fetchMock = vi.fn();

beforeEach(() => {
	vi.stubGlobal("fetch", fetchMock);
});

describe("byokProviderFor", () => {
	beforeEach(() => {
		vi.mocked(readProviderKey).mockResolvedValue("rw-stored-key");
	});

	it("reads the user's key for the vendor and hands it to the class it builds", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

		const provider = await byokProviderFor("u1", "runware", "video");
		await provider.validate();

		expect(readProviderKey).toHaveBeenCalledWith("u1", "runware");
		const [, init] = fetchMock.mock.calls[0]!;
		expect(init.body).toContain("rw-stored-key");
	});

	it.each([
		["runware", "video", RunwareVideo],
		["anthropic", "llm", AnthropicLLM],
		["cartesia", "tts", CartesiaTTS],
		["elevenlabs", "stt", ElevenLabsSTT],
	] as const)(
		"serves %s generations from a %s key",
		async (provider, type, Vendor) => {
			expect(await byokProviderFor("u1", provider, type)).toBeInstanceOf(
				Vendor,
			);
		},
	);

	it("refuses a modality the vendor does not serve without opening the vault", async () => {
		await expect(byokProviderFor("u1", "anthropic", "video")).rejects.toThrow(
			'"anthropic" does not serve video generations',
		);
		expect(readProviderKey).not.toHaveBeenCalled();
	});

	it("tells the caller to connect the vendor when the account stored no key", async () => {
		vi.mocked(readProviderKey).mockResolvedValue(null);

		await expect(byokProviderFor("u1", "cartesia", "tts")).rejects.toThrow(
			MissingProviderKeyError,
		);
	});
});

describe("validateKey", () => {
	it("sends the key in the header the vendor expects", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

		await validateKey("anthropic", "sk-test");

		const [, init] = fetchMock.mock.calls[0]!;
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

	it("throws when the provider gives no answer", async () => {
		fetchMock.mockRejectedValue(new Error("network down"));

		await expect(validateKey("cartesia", "key")).rejects.toThrow(
			"network down",
		);
	});

	// An outage says nothing about the key.
	it("throws on a status other than an auth failure", async () => {
		fetchMock.mockResolvedValue(new Response("{}", { status: 503 }));

		await expect(validateKey("anthropic", "key")).rejects.toThrow(
			"The provider answered 503.",
		);
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

describe("verifyProviderKey", () => {
	it.each([
		[200, "valid"],
		[401, "invalid"],
	])("records a %i from the vendor as %s", async (status, verdict) => {
		fetchMock.mockResolvedValue(new Response("{}", { status }));

		await verifyProviderKey("u1", "cartesia", "key");

		expect(setKeyStatus).toHaveBeenCalledWith("u1", "cartesia", verdict);
	});

	it("leaves the status alone when the provider gives no answer", async () => {
		fetchMock.mockRejectedValue(new Error("network down"));

		await expect(verifyProviderKey("u1", "cartesia", "key")).rejects.toThrow();
		expect(setKeyStatus).not.toHaveBeenCalled();
	});
});
