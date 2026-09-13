import { beforeEach, describe, expect, it, vi } from "vitest";

const media = vi.hoisted(() => ({
	track: null as { computeDuration: () => Promise<number> } | null,
	getCanvas: vi.fn(),
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
		getCanvas = media.getCanvas;
	},
}));

vi.mock("@/lib/upload/uploadImage", () => ({ uploadImage: vi.fn() }));

const { lastFrame } = await import("../video/captureLastFrame");

const jpeg = new Blob(["jpeg"], { type: "image/jpeg" });
const canvas = { convertToBlob: vi.fn(() => Promise.resolve(jpeg)) };

beforeEach(() => {
	media.track = { computeDuration: () => Promise.resolve(7.5) };
	media.getCanvas.mockReset().mockResolvedValue({
		canvas,
		timestamp: 7.46,
		duration: 0.04,
	});
	media.dispose.mockReset();
	media.inputs = 0;
});

describe("lastFrame", () => {
	it("decodes the frame at the track's end and releases the file", async () => {
		await expect(lastFrame("https://vid/a.mp4")).resolves.toBe(jpeg);
		expect(media.getCanvas).toHaveBeenCalledWith(7.5);
		expect(media.dispose).toHaveBeenCalledOnce();
	});

	it("fails loudly for a file with no picture, still releasing it", async () => {
		media.track = null;
		await expect(lastFrame("https://vid/audio-only.mp4")).rejects.toThrow(
			/no picture/,
		);
		expect(media.dispose).toHaveBeenCalledOnce();
	});

	it("decodes a video once however often its frame is asked for", async () => {
		await lastFrame("https://vid/once.mp4");
		await lastFrame("https://vid/once.mp4");
		expect(media.inputs).toBe(1);
	});

	it("tries again after a failed decode", async () => {
		media.getCanvas.mockResolvedValueOnce(null);
		await expect(lastFrame("https://vid/retry.mp4")).rejects.toThrow(
			/Could not decode/,
		);
		await expect(lastFrame("https://vid/retry.mp4")).resolves.toBe(jpeg);
	});
});
