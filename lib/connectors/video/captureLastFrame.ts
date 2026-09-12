import { uploadImage } from "@/lib/upload/uploadImage";

/** Seeking to the very end lands on nothing; a frame's width before it is the last frame that draws. */
const TAIL_SEC = 1 / 30;

/** Resolves once `event` fires, rejects on the element's error, after `act` starts the work. */
const settle = (
	video: HTMLVideoElement,
	event: "loadedmetadata" | "seeked",
	act: () => void,
) =>
	new Promise<void>((resolve, reject) => {
		video.addEventListener(event, () => resolve(), { once: true });
		video.onerror = () =>
			reject(new Error(`Could not read the video to capture its last frame`));
		act();
	});

const encode = (video: HTMLVideoElement) =>
	new Promise<Blob>((resolve, reject) => {
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		canvas.getContext("2d")?.drawImage(video, 0, 0);
		canvas.toBlob(
			(blob) =>
				blob ? resolve(blob) : reject(new Error("Could not encode the frame")),
			"image/jpeg",
			0.92,
		);
	});

async function capture(videoUrl: string): Promise<string> {
	const video = document.createElement("video");
	video.crossOrigin = "anonymous";
	video.muted = true;
	video.preload = "metadata";
	try {
		await settle(video, "loadedmetadata", () => (video.src = videoUrl));
		await settle(video, "seeked", () => {
			video.currentTime = Math.max(0, video.duration - TAIL_SEC);
		});
		const jpeg = await encode(video);
		return await uploadImage(
			new File([jpeg], "last-frame.jpg", { type: jpeg.type }),
		);
	} finally {
		video.removeAttribute("src");
		video.load();
	}
}

/** A hosted video never changes, so its last frame is captured once per session. */
const captured = new Map<string, Promise<string>>();

/** The last frame of a hosted video, as a hosted picture. Runs in the browser only. */
export function captureLastFrame(videoUrl: string): Promise<string> {
	const pending =
		captured.get(videoUrl) ??
		capture(videoUrl).catch((error: unknown) => {
			captured.delete(videoUrl);
			throw error;
		});
	captured.set(videoUrl, pending);
	return pending;
}
