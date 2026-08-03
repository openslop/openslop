import type { ReactNode } from "react";
import type { CanvasElementType } from "@/lib/canvas/types";
import { AnimatedImagePreview } from "./AnimatedImagePreview";
import { AudioPreview } from "./AudioPreview";
import { ClipPreview } from "./ClipPreview";
import { ImagePreview } from "./ImagePreview";
import type { ElementPreviewProps } from "./status";

type ElementPreview = (props: ElementPreviewProps) => ReactNode;

/** How each element type renders its generated output. */
export const ELEMENT_PREVIEWS: Record<CanvasElementType, ElementPreview> = {
	narration: AudioPreview,
	character: AudioPreview,
	sound: AudioPreview,
	music: AudioPreview,
	image: ImagePreview,
	clip: ClipPreview,
	animated_image: AnimatedImagePreview,
};
