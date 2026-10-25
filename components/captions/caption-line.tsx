import { createContext, type ComponentType } from "react";
import type { CaptionWord } from "@/lib/captions/caption-layout";
import type { CaptionStyle } from "@/lib/captions/caption-style";
import type { ResolvedElement } from "@/lib/render/types";
import { CaptionOverlay } from "./caption-overlay";

export type CaptionLineProps = {
	style: CaptionStyle;
	words: CaptionWord[];
	fontSizePx: number;
	element: Pick<ResolvedElement, "id" | "type">;
	/** Where the line's first word sits in the element's words, so an edit can find each one. */
	firstWordIndex: number;
};

// The editor swaps in a line that edits; an export keeps the static one.
function StaticCaptionLine({ style, words, fontSizePx }: CaptionLineProps) {
	return <CaptionOverlay style={style} words={words} fontSizePx={fontSizePx} />;
}

export const CaptionLineContext =
	createContext<ComponentType<CaptionLineProps>>(StaticCaptionLine);
