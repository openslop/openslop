import { beforeEach, describe, expect, it, vi } from "vitest";

const media = vi.hoisted(() => ({
	track: null as {
		getFirstTimestamp: () => Promise<number>;
		computeDuration: () => Promise<number>;
	} | null,
	timestamps: [] as number[][],
	missing: false,
	unencodable: false,
	dispose: vi.fn(),
	inputs: 0,
	uploads: 0,
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
								toBlob: (done: (blob: Blob | null) => void) =>
									done(
										media.unencodable
											? null
											: new Blob([`frame@${timestamp}`], {
													type: "image/jpeg",
												}),
									),
							},
						};
		}
	},
}));

vi.mock("@/lib/upload/upload-file", () => ({
	uploadFile: async (_kind: string, file: File) => {
		media.uploads++;
		return `https://img/${await file.text()}`;
	},
}));

const { previewFrames, captureFrames } = await import("../capture-frames");
const { clipRange } = await import("../clip-range");
const { element } = await import("@/lib/canvas/__tests__/_assets");

beforeEach(() => {
	media.track = {
		getFirstTimestamp: () => Promise.resolve(0.5),
		computeDuration: () => Promise.resolve(8.5),
	};
	media.timestamps = [];
	media.missing = false;
	media.unencodable = false;
	media.dispose.mockReset();
	media.inputs = 0;
	media.uploads = 0;
});

describe("captureFrames", () => {
	it("decodes the beginning, middle and end once, uploads the frames asked for in that order, and releases the file", async () => {
		await expect(
			captureFrames("https://vid/a.mp4", ["middle", "first"]),
		).resolves.toEqual(["https://img/frame@4.5", "https://img/frame@0.5"]);
		await expect(captureFrames("https://vid/a.mp4", ["last"])).resolves.toEqual(
			["https://img/frame@8.5"],
		);
		expect(media.timestamps).toEqual([[0.5, 4.5, 8.5]]);
		expect(media.dispose).toHaveBeenCalledOnce();
	});

	it("fails loudly for a file with no picture, still releasing it", async () => {
		media.track = null;
		await expect(
			captureFrames("https://vid/audio-only.mp4", ["last"]),
		).rejects.toThrow(/no picture/);
		expect(media.dispose).toHaveBeenCalledOnce();
	});

	it("tries again after a failed decode", async () => {
		media.missing = true;
		await expect(
			captureFrames("https://vid/retry.mp4", ["last"]),
		).rejects.toThrow(/Could not decode/);
		media.missing = false;
		await expect(
			captureFrames("https://vid/retry.mp4", ["last"]),
		).resolves.toHaveLength(1);
	});

	it("fails loudly for a frame that will not encode", async () => {
		media.unencodable = true;
		await expect(
			captureFrames("https://vid/unencodable.mp4", ["last"]),
		).rejects.toThrow(/Could not encode/);
		expect(media.dispose).toHaveBeenCalledOnce();
	});
});

describe("previewFrames", () => {
	it("gives every frame by key from the same decode as the capture", async () => {
		const frames = await previewFrames("https://vid/shared.mp4");
		await captureFrames("https://vid/shared.mp4", ["first"]);
		expect(await frames.first.text()).toBe("frame@0.5");
		expect(await frames.middle.text()).toBe("frame@4.5");
		expect(await frames.last.text()).toBe("frame@8.5");
		expect(media.inputs).toBe(1);
	});

	it("drops the frames of old videos without ever uploading a frame twice", async () => {
		await captureFrames("https://vid/old.mp4", ["last"]);
		for (let n = 0; n < 60; n++)
			await previewFrames(`https://vid/newer-${n}.mp4`);
		expect(media.inputs).toBe(61);
		expect(media.uploads).toBe(1);

		await captureFrames("https://vid/old.mp4", ["last"]);
		expect(media.inputs).toBe(61);
		expect(media.uploads).toBe(1);

		await captureFrames("https://vid/old.mp4", ["first"]);
		expect(media.inputs).toBe(62);
		expect(media.uploads).toBe(2);

		await previewFrames("https://vid/newer-59.mp4");
		expect(media.inputs).toBe(62);
	});
});

describe("a trimmed clip", () => {
	it("takes the beginning, middle and end of the part that plays", async () => {
		await expect(
			captureFrames("https://vid/trimmed.mp4", ["first", "middle", "last"], {
				startSec: 2,
				endSec: 6,
			}),
		).resolves.toEqual([
			"https://img/frame@2.5",
			"https://img/frame@4.5",
			"https://img/frame@6.5",
		]);
		expect(media.timestamps).toEqual([[2.5, 4.5, 6.5]]);
	});

	it("plays to the end of its media without an out-point, and keeps the timeline's shortest clip", async () => {
		await previewFrames("https://vid/in-only.mp4", { startSec: 6 });
		await previewFrames("https://vid/past-end.mp4", {
			startSec: 7.9,
			endSec: 20,
		});
		expect(media.timestamps).toEqual([
			[6.5, 7.5, 8.5],
			[7.5, 8, 8.5],
		]);
	});

	it("decodes each played range once, apart from the whole video", async () => {
		await previewFrames("https://vid/ranges.mp4");
		await previewFrames("https://vid/ranges.mp4", { startSec: 0 });
		expect(media.inputs).toBe(1);
		await previewFrames("https://vid/ranges.mp4", { startSec: 0, endSec: 4 });
		await previewFrames("https://vid/ranges.mp4", { startSec: 0, endSec: 4 });
		expect(media.inputs).toBe(2);
		await previewFrames("https://vid/ranges.mp4", { startSec: 1, endSec: 4 });
		expect(media.inputs).toBe(3);
	});
});

describe("clipRange", () => {
	it("is the trim of a trimmed video, and nothing for one that plays whole", () => {
		expect(
			clipRange(element("v", "video", "", { trimStart: "1.5", trimEnd: "4" })),
		).toEqual({ startSec: 1.5, endSec: 4 });
		expect(clipRange(element("v", "video", "", { trimEnd: "4" }))).toEqual({
			startSec: 0,
			endSec: 4,
		});
		expect(clipRange(element("v", "video", "", { trimStart: "0" }))).toBe(
			undefined,
		);
		expect(clipRange(element("v", "video"))).toBe(undefined);
	});
});
