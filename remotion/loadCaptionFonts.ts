import {
	cancelRender,
	continueRender,
	delayRender,
	staticFile,
} from "remotion";
import { loadCaptionFonts } from "@/lib/video/captionFonts";

/**
 * Holds rendering until the caption faces are ready. Without the delay a frame
 * can be captured mid-load and bake in a fallback face.
 */
const handle = delayRender("Loading caption fonts");

loadCaptionFonts((file) => staticFile(`fonts/${file}`)).then(
	() => continueRender(handle),
	// Throwing here would only make another rejected promise; `cancelRender`
	// fails the render with the real error instead of stalling on the handle.
	(error) => cancelRender(error),
);
