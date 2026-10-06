import { describe, expect, it } from "vitest";
import { audioDurationSec } from "../audio-duration";
import { pcmDurationSec, wavFromPcm, type PcmFormat } from "../wav";

const FLOAT_MONO: PcmFormat = {
	audioFormat: 3,
	bitsPerSample: 32,
	sampleRate: 44100,
	channels: 1,
};

const INT_STEREO: PcmFormat = {
	audioFormat: 1,
	bitsPerSample: 16,
	sampleRate: 8000,
	channels: 2,
};

describe("pcmDurationSec", () => {
	it("divides the byte length by the bytes one second takes", () => {
		expect(pcmDurationSec(44100 * 4, FLOAT_MONO)).toBe(1);
		expect(pcmDurationSec(44100 * 2, FLOAT_MONO)).toBe(0.5);
		expect(pcmDurationSec(8000 * 2 * 2 * 3, INT_STEREO)).toBe(3);
		expect(pcmDurationSec(0, FLOAT_MONO)).toBe(0);
	});
});

describe("wavFromPcm", () => {
	it("states the format in a 44-byte header ahead of the samples", () => {
		const pcm = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

		const wav = wavFromPcm(pcm, INT_STEREO);

		expect(wav.toString("latin1", 0, 4)).toBe("RIFF");
		expect(wav.readUInt32LE(4)).toBe(wav.length - 8);
		expect(wav.toString("latin1", 8, 16)).toBe("WAVEfmt ");
		expect(wav.readUInt16LE(20)).toBe(1);
		expect(wav.readUInt16LE(22)).toBe(2);
		expect(wav.readUInt32LE(24)).toBe(8000);
		expect(wav.readUInt32LE(28)).toBe(32000);
		expect(wav.readUInt16LE(32)).toBe(4);
		expect(wav.readUInt16LE(34)).toBe(16);
		expect(wav.toString("latin1", 36, 40)).toBe("data");
		expect(wav.readUInt32LE(40)).toBe(pcm.length);
		expect(wav.subarray(44).equals(pcm)).toBe(true);
	});

	it("writes a file a WAV reader measures at the PCM's own length", async () => {
		const pcm = Buffer.alloc(44100 * 4 * 2);

		const wav = wavFromPcm(pcm, FLOAT_MONO);

		expect(await audioDurationSec(new Uint8Array(wav).buffer)).toBeCloseTo(
			pcmDurationSec(pcm.length, FLOAT_MONO),
		);
	});
});
