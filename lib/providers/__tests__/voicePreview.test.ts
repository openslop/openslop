import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchAllowedVoicePreview } from "../tts/voicePreview";

const ALLOWED_HOST = "api.cartesia.ai";

describe("fetchAllowedVoicePreview", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("ok")),
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("rejects a URL whose origin is not the provider's", () => {
		expect(() =>
			fetchAllowedVoicePreview(
				"https://evil.example.com/preview.mp3",
				ALLOWED_HOST,
			),
		).toThrow("Voice preview origin not allowed");
		expect(fetch).not.toHaveBeenCalled();
	});

	it("rejects plaintext HTTP on the allowed host", () => {
		expect(() =>
			fetchAllowedVoicePreview(
				`http://${ALLOWED_HOST}/preview.mp3`,
				ALLOWED_HOST,
			),
		).toThrow("Voice preview origin not allowed");
	});

	it("keeps redirect:manual even when init tries to override it", async () => {
		await fetchAllowedVoicePreview(
			`https://${ALLOWED_HOST}/preview.mp3`,
			ALLOWED_HOST,
			{
				redirect: "follow",
				headers: { Authorization: "Bearer secret" },
			},
		);

		expect(fetch).toHaveBeenCalledWith(
			`https://${ALLOWED_HOST}/preview.mp3`,
			expect.objectContaining({
				redirect: "manual",
				headers: { Authorization: "Bearer secret" },
			}),
		);
	});
});
