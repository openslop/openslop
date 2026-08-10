import { continueRender, delayRender, staticFile } from "remotion";
import { loadCaptionFonts } from "@/lib/video/captionFonts";

/**
 * Holds rendering until the caption faces are ready. Without the delay a frame
 * can be captured mid-load and bake in a fallback face.
 */
const handle = delayRender("Loading caption fonts");

loadCaptionFonts((file) => staticFile(`fonts/${file}`)).then(
	() => continueRender(handle),
	(error) => {
		throw error;
	},
);
