import { useEffect, useState } from "react";
import {
	cancelRender,
	continueRender,
	delayRender,
	staticFile,
} from "remotion";
import {
	loadCaptionFonts,
	type CaptionFont as CaptionFontName,
} from "@/lib/video/captionFonts";

/**
 * Holds rendering until the one face this composition captions with is ready.
 * Without the delay a frame can be captured mid-load and bake in a fallback.
 */
export function CaptionFont({ font }: { font: CaptionFontName }) {
	const [handle] = useState(() => delayRender(`Loading caption font: ${font}`));

	useEffect(() => {
		loadCaptionFonts((file) => staticFile(`fonts/${file}`), [font]).then(
			() => continueRender(handle),
			// Throwing here would only make another rejected promise; `cancelRender`
			// fails the render with the real error instead of stalling on the handle.
			(error) => cancelRender(error),
		);
	}, [font, handle]);

	return null;
}
