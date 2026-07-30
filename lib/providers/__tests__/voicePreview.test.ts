import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAllowedVoicePreview } from "../tts/voicePreview";

const ALLOWED_HOST = "files.cartesia.ai";
const ALLOWED_URL = `https://${ALLOWED_HOST}/voices/preview.mp3`;

describe("fetchAllowedVoicePreview", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset().mockResolvedValue(new Response("ok"));
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("fetches an allowed origin with redirects disabled", async () => {
		await fetchAllowedVoicePreview(ALLOWED_URL, ALLOWED_HOST);

		expect(fetchMock).toHaveBeenCalledWith(
			ALLOWED_URL,
			expect.objectContaining({ redirect: "manual" }),
		);
	});

	it("forwards caller init while keeping redirects disabled", async () => {
		await fetchAllowedVoicePreview(ALLOWED_URL, ALLOWED_HOST, {
			headers: { Authorization: "Bearer secret" },
			redirect: "follow",
		});

		expect(fetchMock).toHaveBeenCalledWith(ALLOWED_URL, {
			headers: { Authorization: "Bearer secret" },
			redirect: "manual",
		});
	});

	it.each([
		["plaintext http", `http://${ALLOWED_HOST}/preview.mp3`],
		["another host", "https://evil.example/preview.mp3"],
		["a subdomain of the allowed host", `https://a.${ALLOWED_HOST}/p.mp3`],
		["a non-default port", `https://${ALLOWED_HOST}:8443/preview.mp3`],
		["the host in userinfo", `https://${ALLOWED_HOST}@evil.example/p.mp3`],
	])("refuses %s", async (_label, url) => {
		expect(() => fetchAllowedVoicePreview(url, ALLOWED_HOST)).toThrow(
			"Voice preview origin not allowed",
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("throws on a value that is not a URL", () => {
		expect(() => fetchAllowedVoicePreview("not a url", ALLOWED_HOST)).toThrow();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
