import {
	ALL_FORMATS,
	CanvasSink,
	Input,
	UrlSource,
	type WrappedCanvas,
} from "mediabunny";
import { uploadImage } from "@/lib/upload/uploadImage";
import { HANDED_ON_FRAMES } from "./startFrame";

const JPEG_QUALITY = 0.92;

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
async function decodeFrames(videoUrl: string): Promise<Blob[]> {
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
			HANDED_ON_FRAMES.map(({ at }) => start + (end - start) * at),
		)) {
			if (!frame) throw new Error("Could not decode the video's frames");
			frames.push(frame);
		}
		return await Promise.all(frames.map(({ canvas }) => toJpeg(canvas)));
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

/** A hosted video never changes, so its frames are decoded and uploaded once per session. */
const decoded = new Map<string, Promise<Blob[]>>();
const uploaded = new Map<string, Promise<string[]>>();

/** The frames a hosted video hands on, decoded here to preview them. Browser only. */
export const previewFrames = (videoUrl: string): Promise<Blob[]> =>
	once(decoded, videoUrl, () => decodeFrames(videoUrl));

/** The frames a hosted video hands on, as hosted pictures in time order. Browser only. */
export const captureFrames = (videoUrl: string): Promise<string[]> =>
	once(uploaded, videoUrl, async () =>
		Promise.all(
			(await previewFrames(videoUrl)).map((jpeg, index) =>
				uploadImage(
					new File([jpeg], `frame-${index}.jpg`, { type: jpeg.type }),
				),
			),
		),
	);
