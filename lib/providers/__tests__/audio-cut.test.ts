import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cutVoice, secondsCap, trimAudio } from "../audio-cut";
import { audioDurationSec } from "../audio-duration";
import { spyAssetBundle } from "./_assetBundle";
import { wav } from "./_wav";

describe("secondsCap", () => {
	it.each([
		{ durations: [10, 10], budget: 15, cap: 7.5 },
		{ durations: [12, 6], budget: 15, cap: 9 },
		{ durations: [2, 2, 40], budget: 15, cap: 11 },
		{ durations: [6, 8, 16], budget: 15, cap: 5 },
		{ durations: [20], budget: 15, cap: 15 },
		{ durations: [6, 8], budget: 15, cap: Infinity },
		{ durations: [], budget: 15, cap: Infinity },
	])(
		"holds clips of $durations s to $cap s each to fill $budget s",
		({ durations, budget, cap }) => {
			expect(secondsCap(durations, budget)).toBe(cap);
		},
	);
});

describe("trimAudio", () => {
	it("keeps the opening seconds of a WAV in a WAV", async () => {
		const { data, contentType } = await trimAudio(wav(10), 4);

		expect(contentType).toMatch(/^audio\/wav/);
		expect(await audioDurationSec(data)).toBeCloseTo(4, 1);
	});

	it("refuses bytes that are not audio it knows", async () => {
		await expect(trimAudio(new ArrayBuffer(64), 4)).rejects.toThrow();
	});
});

describe("cutVoice", () => {
	const { load, upload } = spyAssetBundle();
	const fetchMock = vi.fn();
	const VOICE = { url: "https://assets.test/preview/sol.wav", durationSec: 10 };

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("fetch", fetchMock);
		fetchMock.mockImplementation(
			async () =>
				new Response(wav(10), { headers: { "Content-Type": "audio/wav" } }),
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("fetches, trims, measures and stores a cut it has not made", async () => {
		const cut = await cutVoice(VOICE, 4);

		expect(fetchMock).toHaveBeenCalledWith(VOICE.url);
		expect(cut.durationSec).toBeCloseTo(4, 1);
		expect(cut.url).toMatch(
			/^https:\/\/assets\.test\/assets\/preview\/voice-cut\/[0-9a-f]{64}\/audio$/,
		);
		expect(upload).toHaveBeenCalledWith(
			"preview",
			"voice-cut",
			[expect.objectContaining({ key: "audio", contentType: "audio/wav" })],
			{ durationSec: expect.closeTo(4, 1) },
			{ id: expect.stringMatching(/^[0-9a-f]{64}$/) },
		);
	});

	it("serves a cut it has stored without fetching or trimming again", async () => {
		load.mockResolvedValue({
			id: "abc",
			type: "preview",
			provider: "voice-cut",
			result: { audio: "audio" },
			metadata: { durationSec: 4 },
		});

		await expect(cutVoice(VOICE, 4)).resolves.toEqual({
			url: "https://assets.test/assets/preview/voice-cut/abc/audio",
			durationSec: 4,
		});
		expect(fetchMock).not.toHaveBeenCalled();
		expect(upload).not.toHaveBeenCalled();
	});

	it("names a cut by its source and its length", async () => {
		await cutVoice(VOICE, 4);
		await cutVoice(VOICE, 4);
		await cutVoice(VOICE, 5);

		const ids = upload.mock.calls.map((call) => call[4]?.id);
		expect(ids[0]).toBe(ids[1]);
		expect(ids[2]).not.toBe(ids[0]);
	});

	it.each([10, Infinity, 9.96])(
		"hands back a voice already within %s s untouched",
		async (seconds) => {
			await expect(cutVoice(VOICE, seconds)).resolves.toBe(VOICE);
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it("fails loudly when the preview cannot be fetched", async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

		await expect(cutVoice(VOICE, 4)).rejects.toThrow(
			"Voice preview fetch failed (404)",
		);
		expect(upload).not.toHaveBeenCalled();
	});
});
