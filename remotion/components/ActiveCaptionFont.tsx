import { useEffect, useState } from "react";
import {
	cancelRender,
	continueRender,
	delayRender,
	staticFile,
} from "remotion";
import { loadCaptionFonts, type CaptionFont } from "@/lib/video/captionFonts";

/**
 * The one face this composition captions with. Rendering is held until it is
 * ready, so a frame cannot be captured mid-load and bake in a fallback.
 */
export function ActiveCaptionFont({ font }: { font: CaptionFont }) {
	const [handle] = useState(() => delayRender(`Loading caption font: ${font}`));

	useEffect(() => {
		loadCaptionFonts((file) => staticFile(`fonts/${file}`), [font]).then(
			() => continueRender(handle),
			// Throwing would only make another rejected promise; `cancelRender`
			// fails the render with the real error instead of stalling the handle.
			(error) => cancelRender(error),
		);
	}, [font, handle]);

	return null;
}
