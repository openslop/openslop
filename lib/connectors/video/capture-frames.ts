import {
	ALL_FORMATS,
	CanvasSink,
	Input,
	UrlSource,
	type WrappedCanvas,
} from "mediabunny";
import zipObject from "lodash/zipObject";
import { memoAsync } from "@/lib/memo-async";
import { trimClip } from "@/lib/render/clip-trim";
import { uploadFile } from "@/lib/upload/upload-file";
import { type ClipRange, playsWhole } from "./clip-range";
import { FRAMES, FRAME_KEYS, type FrameKey } from "./start-frame";

const JPEG_QUALITY = 0.92;

const PREVIEW_VIDEOS_KEPT = 40;

export type Frames = Record<FrameKey, Blob>;

const rangeKey = (range: ClipRange | undefined) =>
	!range || playsWhole(range) ? "" : `${range.startSec}-${range.endSec ?? ""}`;

const toJpeg = (canvas: HTMLCanvasElement): Promise<Blob> =>
	new Promise((resolve, reject) =>
		canvas.toBlob(
			(blob) =>
				blob ? resolve(blob) : reject(new Error("Could not encode the frame")),
			"image/jpeg",
			JPEG_QUALITY,
		),
	);

async function decodeFrames(
	videoUrl: string,
	range?: ClipRange,
): Promise<Frames> {
	const input = new Input({
		source: new UrlSource(videoUrl),
		formats: ALL_FORMATS,
	});
	try {
		const track = await input.getPrimaryVideoTrack();
		if (!track) throw new Error("The video has no picture to take frames from");
		const [start, end] = await Promise.all([
			track.getFirstTimestamp(),
			track.computeDuration(),
		]);
		// Clamped the way the timeline plays the clip, so the end frame is where it cuts.
		const { trimStartSec, trimDurationSec } = range
			? trimClip(end - start, range.startSec, range.endSec)
			: { trimStartSec: 0, trimDurationSec: end - start };
		const from = start + trimStartSec;
		const frames: WrappedCanvas[] = [];
		for await (const frame of new CanvasSink(track).canvasesAtTimestamps(
			FRAME_KEYS.map((key) => from + trimDurationSec * FRAMES[key].at),
		)) {
			if (!frame) throw new Error("Could not decode the video's frames");
			frames.push(frame);
		}
		const jpegs = await Promise.all(
			frames.map(({ canvas }) => toJpeg(canvas as HTMLCanvasElement)),
		);
		return zipObject(FRAME_KEYS, jpegs) as Frames;
	} finally {
		input.dispose();
	}
}

/** Browser only. A hosted video never changes, so each range of it is decoded once while it is among the latest. */
export const previewFrames = memoAsync(
	decodeFrames,
	(videoUrl: string, range?: ClipRange) => `${rangeKey(range)}@${videoUrl}`,
	{ max: PREVIEW_VIDEOS_KEPT },
);

const uploadFrame = memoAsync(
	async (
		videoUrl: string,
		key: FrameKey,
		range: ClipRange | undefined,
	): Promise<string> => {
		const jpeg = (await previewFrames(videoUrl, range))[key];
		return uploadFile(
			"image",
			new File([jpeg], `frame-${key}.jpg`, { type: jpeg.type }),
		);
	},
	(videoUrl, key, range) => `${key}:${rangeKey(range)}@${videoUrl}`,
);

/** Browser only. */
export const captureFrames = (
	videoUrl: string,
	keys: readonly FrameKey[],
	range?: ClipRange,
): Promise<string[]> =>
	Promise.all(keys.map((key) => uploadFrame(videoUrl, key, range)));
