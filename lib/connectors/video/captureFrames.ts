import {
	ALL_FORMATS,
	CanvasSink,
	Input,
	UrlSource,
	type WrappedCanvas,
} from "mediabunny";
import zipObject from "lodash/zipObject";
import { uploadImage } from "@/lib/upload/uploadImage";
import { FRAMES, type FrameKey } from "./startFrame";

const JPEG_QUALITY = 0.92;

const FRAME_KEYS = Object.keys(FRAMES) as FrameKey[];

export type Frames = Record<FrameKey, Blob>;

const toJpeg = (canvas: HTMLCanvasElement | OffscreenCanvas): Promise<Blob> =>
	"convertToBlob" in canvas
		? canvas.convertToBlob({ type: "image/jpeg", quality: JPEG_QUALITY })
		: new Promise((resolve, reject) =>
				canvas.toBlob(
					(blob) =>
						blob
							? resolve(blob)
							: reject(new Error("Could not encode the frame")),
					"image/jpeg",
					JPEG_QUALITY,
				),
			);

/**
 * Decodes the frames a video hands on straight from the file.
 * Nothing plays, so a background tab cannot pause it, and nothing seeks, so the
 * last frame cannot land short of the end.
 */
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
		const jpegs = await Promise.all(frames.map(({ canvas }) => toJpeg(canvas)));
		return zipObject(FRAME_KEYS, jpegs) as Frames;
	} finally {
		input.dispose();
	}
}

/** Runs `make` once per key; a failure is forgotten so the next call tries again. */
function once<T>(
	cache: Map<string, Promise<T>>,
	key: string,
	make: () => Promise<T>,
): Promise<T> {
	const pending =
		cache.get(key) ??
		make().catch((error: unknown) => {
			cache.delete(key);
			throw error;
		});
	cache.set(key, pending);
	return pending;
}

/** A hosted video never changes, so its frames are decoded once, and each uploaded once, per session. */
const decoded = new Map<string, Promise<Frames>>();
const uploaded = new Map<string, Promise<string>>();

/** Every frame a hosted video hands on, decoded here to preview them. Browser only. */
export const previewFrames = (videoUrl: string): Promise<Frames> =>
	once(decoded, videoUrl, () => decodeFrames(videoUrl));

/** The given frames of a hosted video, as hosted pictures in the order asked. Browser only. */
export const captureFrames = (
	videoUrl: string,
	keys: readonly FrameKey[],
): Promise<string[]> =>
	Promise.all(
		keys.map((key) =>
			once(uploaded, `${key}@${videoUrl}`, async () => {
				const jpeg = (await previewFrames(videoUrl))[key];
				return uploadImage(
					new File([jpeg], `frame-${key}.jpg`, { type: jpeg.type }),
				);
			}),
		),
	);
