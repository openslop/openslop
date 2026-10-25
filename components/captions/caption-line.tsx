import { createContext, type ReactNode } from "react";
import type { CaptionWord } from "@/lib/captions/caption-layout";
import type { CaptionStyle } from "@/lib/captions/caption-style";
import type { ResolvedElement } from "@/lib/render/types";
import { CaptionOverlay } from "./caption-overlay";

export type CaptionLineProps = {
	style: CaptionStyle;
	words: CaptionWord[];
	fontSizePx: number;
	element: Pick<ResolvedElement, "id" | "sceneId" | "type">;
	/** Where the line's first word sits in the element's words, so an edit can find each one. */
	firstWord: number;
};

// The editor swaps in a line that edits; an export keeps the static one.
export const CaptionLineContext = createContext<
	(props: CaptionLineProps) => ReactNode
>(({ style, words, fontSizePx }) => (
	<CaptionOverlay style={style} words={words} fontSizePx={fontSizePx} />
));
