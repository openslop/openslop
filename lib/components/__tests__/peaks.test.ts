import { afterEach, describe, expect, it, vi } from "vitest";
import { extractPeaks, loadPeaks } from "../peaks";

describe("extractPeaks", () => {
	it("extracts correct number of peaks", () => {
		const data = new Float32Array(1000);
		for (let i = 0; i < data.length; i++) data[i] = Math.sin(i * 0.1);
		const peaks = extractPeaks(data, 10);
		expect(peaks).toHaveLength(10);
	});

	it("normalizes peaks to 0–1 range", () => {
		const data = new Float32Array([0.2, -0.5, 0.8, -0.3, 0.1, 0.9, -0.4, 0.6]);
		const peaks = extractPeaks(data, 2);
		expect(Math.max(...peaks)).toBe(1);
		peaks.forEach((p) => {
			expect(p).toBeGreaterThanOrEqual(0);
			expect(p).toBeLessThanOrEqual(1);
		});
	});

	it("returns all zeros for silent audio", () => {
		const data = new Float32Array(100);
		const peaks = extractPeaks(data, 5);
		expect(peaks).toHaveLength(5);
		peaks.forEach((p) => expect(p).toBe(0));
	});

	it("returns empty array when data is shorter than count", () => {
		const data = new Float32Array(3);
		const peaks = extractPeaks(data, 10);
		expect(peaks).toHaveLength(0);
	});

	it("handles single-sample-per-peak correctly", () => {
		const data = new Float32Array([0.5, -1.0, 0.25, 0.75]);
		const peaks = extractPeaks(data, 4);
		expect(peaks).toEqual([0.5, 1.0, 0.25, 0.75]);
	});

	it("is sign-agnostic (negative samples carry the same weight)", () => {
		const data = new Float32Array([-0.8, -0.4, 0.2, 0.1]);
		const peaks = extractPeaks(data, 2);
		// RMS: sqrt((0.64 + 0.16) / 2) and sqrt((0.04 + 0.01) / 2), normalized.
		expect(peaks[0]).toBe(1);
		expect(peaks[1]).toBeCloseTo(0.25);
	});

	it("averages a bucket rather than following its loudest sample", () => {
		const data = new Float32Array([1, 0, 0, 0, 0.6, 0.6, 0.6, 0.6]);
		const [transient, sustained] = extractPeaks(data, 2);
		// Peak-picking would rate the lone spike (1) above the sustained tone
		// (0.6); by energy the sustained half is the louder of the two.
		expect(transient).toBeLessThan(sustained);
	});

	it("handles uniform amplitude", () => {
		const data = new Float32Array(20).fill(0.5);
		const peaks = extractPeaks(data, 4);
		peaks.forEach((p) => expect(p).toBe(1));
	});
});

describe("loadPeaks", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("decodes the fetched audio into normalized peaks", async () => {
		const samples = new Float32Array(400).fill(0.5);
		samples[0] = 1;
		vi.stubGlobal(
			"AudioContext",
			class {
				async decodeAudioData() {
					return { getChannelData: () => samples };
				}
			},
		);
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: true,
				arrayBuffer: async () => new ArrayBuffer(8),
			})),
		);

		const peaks = await loadPeaks("https://example.com/audio.mp3");

		expect(peaks).toHaveLength(200);
		expect(Math.max(...peaks)).toBe(1);
	});

	it("throws when the audio cannot be fetched", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({ ok: false, status: 404 })),
		);

		await expect(loadPeaks("https://example.com/missing.mp3")).rejects.toThrow(
			"Failed to fetch audio: 404",
		);
	});
});
