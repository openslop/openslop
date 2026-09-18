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
	media.unencodable = false;
	media.dispose.mockReset();
	media.inputs = 0;
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
});
