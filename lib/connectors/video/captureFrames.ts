import {
	ALL_FORMATS,
	CanvasSink,
	Input,
	UrlSource,
	type WrappedCanvas,
} from "mediabunny";
import { uploadImage } from "@/lib/upload/uploadImage";

const JPEG_QUALITY = 0.92;

type Frames = [first: Blob, middle: Blob, last: Blob];

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
 * Decodes a video's first, middle and last frames straight from the file.
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
		const canvases: (WrappedCanvas | null)[] = [];
		for await (const canvas of new CanvasSink(track).canvasesAtTimestamps([
			start,
			(start + end) / 2,
			end,
		]))
			canvases.push(canvas);
		const [first, middle, last] = canvases;
		if (!first || !middle || !last)
			throw new Error("Could not decode the video's frames");
		return await Promise.all([
			toJpeg(first.canvas),
			toJpeg(middle.canvas),
			toJpeg(last.canvas),
		]);
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
const decoded = new Map<string, Promise<Frames>>();
const uploaded = new Map<string, Promise<string[]>>();

const frames = (videoUrl: string): Promise<Frames> =>
	once(decoded, videoUrl, () => decodeFrames(videoUrl));

/** A hosted video's last frame, the one a video continuing from it opens on. Browser only. */
export const lastFrame = async (videoUrl: string): Promise<Blob> =>
	(await frames(videoUrl))[2];

/** A hosted video's first, middle and last frames, as hosted pictures in that order. Browser only. */
export const captureFrames = (videoUrl: string): Promise<string[]> =>
	once(uploaded, videoUrl, async () =>
		Promise.all(
			(await frames(videoUrl)).map((jpeg, index) =>
				uploadImage(
					new File([jpeg], `frame-${index}.jpg`, { type: jpeg.type }),
				),
			),
		),
	);
