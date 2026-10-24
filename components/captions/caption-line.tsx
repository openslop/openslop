import { createContext, type ReactNode } from "react";
import type { CaptionWord } from "@/lib/captions/caption-layout";
import type { CaptionStyle } from "@/lib/captions/caption-style";
import type { ResolvedElement } from "@/lib/render/types";
import { CaptionOverlay } from "./caption-overlay";

export type CaptionLineProps = {
	style: CaptionStyle;
	words: CaptionWord[];
	fontSizePx: number;
	clip: Pick<ResolvedElement, "id" | "sceneId" | "type">;
	/** The span of the clip's words the line shows, which an edit replaces. */
	from: number;
	to: number;
};

// The editor swaps in a line that edits; an export keeps the static one.
export const CaptionLineContext = createContext<
	(props: CaptionLineProps) => ReactNode
>(({ style, words, fontSizePx }) => (
	<CaptionOverlay style={style} words={words} fontSizePx={fontSizePx} />
));
