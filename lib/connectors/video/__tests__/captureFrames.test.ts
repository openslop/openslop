import { beforeEach, describe, expect, it, vi } from "vitest";

const media = vi.hoisted(() => ({
	track: null as {
		getFirstTimestamp: () => Promise<number>;
		computeDuration: () => Promise<number>;
	} | null,
	timestamps: [] as number[][],
	missing: false,
	dispose: vi.fn(),
	inputs: 0,
}));

vi.mock("mediabunny", () => ({
	ALL_FORMATS: [],
	UrlSource: class {
		constructor(readonly url: string) {}
	},
	Input: class {
		constructor() {
			media.inputs++;
		}
		getPrimaryVideoTrack = () => Promise.resolve(media.track);
		dispose = media.dispose;
	},
	CanvasSink: class {
		async *canvasesAtTimestamps(timestamps: number[]) {
			media.timestamps.push(timestamps);
			for (const timestamp of timestamps)
				yield media.missing
					? null
					: {
							timestamp,
							canvas: {
								convertToBlob: () =>
									Promise.resolve(
										new Blob([`frame@${timestamp}`], { type: "image/jpeg" }),
									),
							},
						};
		}
	},
}));

vi.mock("@/lib/upload/uploadImage", () => ({
	uploadImage: async (file: File) => `https://img/${await file.text()}`,
}));

const { previewFrames, captureFrames } = await import("../captureFrames");

beforeEach(() => {
	media.track = {
		getFirstTimestamp: () => Promise.resolve(0.5),
		computeDuration: () => Promise.resolve(8.5),
	};
	media.timestamps = [];
	media.missing = false;
	media.dispose.mockReset();
	media.inputs = 0;
});

describe("captureFrames", () => {
	it("uploads the first, middle and last frames in order, and releases the file", async () => {
		await expect(captureFrames("https://vid/a.mp4")).resolves.toEqual([
			"https://img/frame@0.5",
			"https://img/frame@4.5",
			"https://img/frame@8.5",
		]);
		expect(media.timestamps).toEqual([[0.5, 4.5, 8.5]]);
		expect(media.dispose).toHaveBeenCalledOnce();
	});

	it("fails loudly for a file with no picture, still releasing it", async () => {
		media.track = null;
		await expect(captureFrames("https://vid/audio-only.mp4")).rejects.toThrow(
			/no picture/,
		);
		expect(media.dispose).toHaveBeenCalledOnce();
	});

	it("tries again after a failed decode", async () => {
		media.missing = true;
		await expect(captureFrames("https://vid/retry.mp4")).rejects.toThrow(
			/Could not decode/,
		);
		media.missing = false;
		await expect(captureFrames("https://vid/retry.mp4")).resolves.toHaveLength(
			3,
		);
	});
});

describe("previewFrames", () => {
	it("gives the first, middle and last frames from the same decode as the capture", async () => {
		const frames = await previewFrames("https://vid/shared.mp4");
		await captureFrames("https://vid/shared.mp4");
		expect(await Promise.all(frames.map((frame) => frame.text()))).toEqual([
			"frame@0.5",
			"frame@4.5",
			"frame@8.5",
		]);
		expect(media.inputs).toBe(1);
	});
});
