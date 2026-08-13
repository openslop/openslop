"use client";

import { useEffect } from "react";
import { loadCaptionFonts, type CaptionFont } from "@/lib/video/captionFonts";
import { useCaptionStyle } from "@/lib/video/useCaptionStyle";
import { useVideoSetting } from "@/lib/video/useVideoSetting";

const register = (fonts?: readonly CaptionFont[]) =>
	loadCaptionFonts((file) => `/fonts/${file}`, fonts).catch((error: unknown) =>
		console.error("Failed to load caption fonts", error),
	);

/** The one face the project captions with, so the preview draws what it exports. */
export function ActiveCaptionFont() {
	const enabled = useVideoSetting("captions");
	const [style] = useCaptionStyle();
	const font = enabled ? style.font : null;

	useEffect(() => {
		if (font) register([font]);
	}, [font]);

	return null;
}

/** The whole library, for the picker and presets that set each row in its own face. */
export function CaptionFontLibrary() {
	useEffect(() => {
		register();
	}, []);

	return null;
}
