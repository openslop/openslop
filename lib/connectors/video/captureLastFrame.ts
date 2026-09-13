import { ALL_FORMATS, CanvasSink, Input, UrlSource } from "mediabunny";
import { uploadImage } from "@/lib/upload/uploadImage";

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
 * Decodes a video's final frame straight from the file. Nothing plays, so a
 * background tab cannot pause it, and nothing seeks, so it cannot land short
 * of the end.
 */
async function decodeLastFrame(videoUrl: string): Promise<Blob> {
	const input = new Input({
		source: new UrlSource(videoUrl),
		formats: ALL_FORMATS,
	});
	try {
		const track = await input.getPrimaryVideoTrack();
		if (!track)
			throw new Error("The video has no picture to take a last frame from");
		const end = await track.computeDuration();
		const frame = await new CanvasSink(track).getCanvas(end);
		if (!frame) throw new Error("Could not decode the video's last frame");
		return await toJpeg(frame.canvas);
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

/** A hosted video never changes, so its last frame is decoded and uploaded once per session. */
const decoded = new Map<string, Promise<Blob>>();
const uploaded = new Map<string, Promise<string>>();

/** The last frame of a hosted video, as a JPEG. Runs in the browser only. */
export const lastFrame = (videoUrl: string): Promise<Blob> =>
	once(decoded, videoUrl, () => decodeLastFrame(videoUrl));

/** The last frame of a hosted video, as a hosted picture. Runs in the browser only. */
export const captureLastFrame = (videoUrl: string): Promise<string> =>
	once(uploaded, videoUrl, async () => {
		const jpeg = await lastFrame(videoUrl);
		return uploadImage(new File([jpeg], "last-frame.jpg", { type: jpeg.type }));
	});
