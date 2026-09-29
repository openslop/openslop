import {
	ALL_FORMATS,
	CanvasSink,
	Input,
	UrlSource,
	type WrappedCanvas,
} from "mediabunny";
import zipObject from "lodash/zipObject";
import { memoAsync } from "@/lib/memoAsync";
import { uploadImage } from "@/lib/upload/uploadImage";
import { FRAMES, type FrameKey } from "./startFrame";

const JPEG_QUALITY = 0.92;

const FRAME_KEYS = Object.keys(FRAMES) as FrameKey[];

export type Frames = Record<FrameKey, Blob>;

const toJpeg = (canvas: HTMLCanvasElement): Promise<Blob> =>
	new Promise((resolve, reject) =>
		canvas.toBlob(
			(blob) =>
				blob ? resolve(blob) : reject(new Error("Could not encode the frame")),
			"image/jpeg",
			JPEG_QUALITY,
		),
	);

async function decodeFrames(videoUrl: string): Promise<Frames> {
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
		const frames: WrappedCanvas[] = [];
		for await (const frame of new CanvasSink(track).canvasesAtTimestamps(
			FRAME_KEYS.map((key) => start + (end - start) * FRAMES[key].at),
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

/** Browser only. A hosted video never changes, so it is decoded once. */
export const previewFrames = memoAsync(decodeFrames, (videoUrl) => videoUrl);

const uploadFrame = memoAsync(
	async (videoUrl: string, key: FrameKey): Promise<string> => {
		const jpeg = (await previewFrames(videoUrl))[key];
		return uploadImage(
			new File([jpeg], `frame-${key}.jpg`, { type: jpeg.type }),
		);
	},
	(videoUrl, key) => `${key}@${videoUrl}`,
);

/** Browser only. */
export const captureFrames = (
	videoUrl: string,
	keys: readonly FrameKey[],
): Promise<string[]> =>
	Promise.all(keys.map((key) => uploadFrame(videoUrl, key)));
