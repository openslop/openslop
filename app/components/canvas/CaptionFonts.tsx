"use client";

import { useEffect } from "react";
import { loadCaptionFonts } from "@/lib/video/captionFonts";

/**
 * Registers the caption faces once for the editor. The renderer loads the same
 * files itself, so a caption previews with the glyphs it will export with.
 */
export function CaptionFonts() {
	useEffect(() => {
		loadCaptionFonts((file) => `/fonts/${file}`);
	}, []);

	return null;
}
