import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AssetBundle } from "@/lib/api/asset-bundle";
import type { VoiceInfo } from "@/lib/connectors/types";
import type { TTSProvider } from "../tts/base";
import { fetchAllowedVoicePreview, voicePreview } from "../tts/voicePreview";
import { spyAssetBundle } from "./_assetBundle";
import { wav } from "./_wav";

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

const getVoice = vi.fn<(id: string) => Promise<VoiceInfo | null>>();
const fetchVoicePreview = vi.fn<(url: string) => Promise<Response>>();
const tts = { getVoice, fetchVoicePreview } as unknown as TTSProvider;

const PREVIEW_URL = "https://vendor/sol.wav";
const VOICE: VoiceInfo = {
	id: "v-sol",
	name: "Sol",
	description: "",
	previewUrl: PREVIEW_URL,
};

const upstream = (seconds: number, status = 200) =>
	new Response(wav(seconds), {
		status,
		headers: { "Content-Type": "audio/wav" },
	});

describe("voicePreview", () => {
	const { load, upload } = spyAssetBundle();

	beforeEach(() => {
		vi.clearAllMocks();
		getVoice.mockResolvedValue(VOICE);
	});

	it("fetches, measures and stores a preview it has not seen, under its URL's hash", async () => {
		fetchVoicePreview.mockResolvedValue(upstream(5));

		const preview = await voicePreview(tts, "v-sol");

		expect(preview?.durationSec).toBeCloseTo(5, 2);
		expect(preview?.url).toMatch(
			/^https:\/\/assets\.test\/assets\/preview\/voice\/[0-9a-f]{64}\/audio$/,
		);
		expect(getVoice).toHaveBeenCalledWith("v-sol");
		expect(fetchVoicePreview).toHaveBeenCalledWith(PREVIEW_URL);
		expect(upload).toHaveBeenCalledWith(
			"preview",
			"voice",
			[expect.objectContaining({ key: "audio", contentType: "audio/wav" })],
			{ durationSec: expect.closeTo(5, 2) },
			{ id: expect.stringMatching(/^[0-9a-f]{64}$/) },
		);
	});

	it("serves a preview it has stored without asking the vendor again", async () => {
		load.mockResolvedValue({
			id: "abc",
			type: "preview",
			provider: "voice",
			result: { audio: "preview.mp3" },
			metadata: { durationSec: 7 },
		});

		await expect(voicePreview(tts, "v-sol")).resolves.toEqual({
			url: "https://assets.test/assets/preview/voice/abc/preview.mp3",
			durationSec: 7,
		});
		expect(load.mock.calls[0]).toEqual([
			"preview",
			"voice",
			expect.stringMatching(/^[0-9a-f]{64}$/),
		]);
		expect(fetchVoicePreview).not.toHaveBeenCalled();
		expect(upload).not.toHaveBeenCalled();
	});

	it("stores the same URL under the same name every time", async () => {
		fetchVoicePreview.mockImplementation(async () => upstream(3));

		await voicePreview(tts, "v-sol");
		await voicePreview(tts, "v-sol");

		const [first, second] = upload.mock.calls.map((call) => call[4]?.id);
		expect(first).toBe(second);
	});

	it("fails loudly when the vendor will not serve the preview", async () => {
		fetchVoicePreview.mockResolvedValue(upstream(5, 403));

		await expect(voicePreview(tts, "v-sol")).rejects.toThrow(
			"Voice preview fetch failed (403)",
		);
		expect(upload).not.toHaveBeenCalled();
	});
});

describe("voicePreview without a preview to host", () => {
	const load = vi.spyOn(AssetBundle, "load");

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("has nothing for a voice without a preview, or none at all", async () => {
		getVoice.mockResolvedValueOnce({ ...VOICE, previewUrl: undefined });
		await expect(voicePreview(tts, "v-sol")).resolves.toBeUndefined();

		getVoice.mockResolvedValueOnce(null);
		await expect(voicePreview(tts, "v-gone")).resolves.toBeUndefined();

		expect(load).not.toHaveBeenCalled();
	});
});
