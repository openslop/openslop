import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { CaptionWord } from "@/lib/captions/caption-layout";
import { spaceBetween } from "@/lib/captions/word-spacing";
import { captionFontStack } from "@/lib/captions/caption-fonts";
import {
	type CaptionAlignX,
	type CaptionAlignY,
	type CaptionCasing,
	type CaptionStyle,
	type CaptionTextStyle,
} from "@/lib/captions/caption-style";

const ALIGN_Y: Record<CaptionAlignY, CSSProperties["alignItems"]> = {
	top: "flex-start",
	middle: "center",
	bottom: "flex-end",
};

const ALIGN_X: Record<CaptionAlignX, CSSProperties["justifyContent"]> = {
	left: "flex-start",
	center: "center",
	right: "flex-end",
};

const TRANSFORM: Record<CaptionCasing, CSSProperties["textTransform"]> = {
	none: "none",
	upper: "uppercase",
	lower: "lowercase",
};

/** Maps the border-width dial onto a legible em range. */
const BORDER_EM_PER_UNIT = 0.0025;

/**
 * `paint-order` lays the stroke down before the fill, so the glyph keeps its
 * full weight and the outline joins cleanly — unlike stacked text shadows,
 * which show their individual copies once the text gets large.
 */
function outline(width: number, color: string): CSSProperties {
	return {
		// The fill covers the stroke's inner half, so the width is doubled to keep
		// the visible outline at the dialled size.
		WebkitTextStrokeWidth: `${width * BORDER_EM_PER_UNIT * 2}em`,
		WebkitTextStrokeColor: color,
		paintOrder: "stroke fill",
	};
}

function captionWordStyle(style: CaptionTextStyle): CSSProperties {
	return {
		color: style.fill,
		fontWeight: style.bold ? 700 : 400,
		fontStyle: style.italic ? "italic" : "normal",
		textDecoration: style.underline ? "underline" : "none",
		...(style.border && outline(style.border.width, style.border.color)),
		backgroundColor: style.background ?? undefined,
		// Shadows widen the background past the glyphs without taking up room,
		// so switching one on changes only the paint and never the layout.
		boxShadow: style.background
			? `-0.06em 0 0 0.05em ${style.background}, 0.06em 0 0 0.05em ${style.background}`
			: undefined,
		padding: 0,
		borderRadius: "0.12em",
	};
}

type RenderWord = (
	word: CaptionWord,
	style: CSSProperties,
	index: number,
) => ReactNode;

const renderSpan: RenderWord = (word, style) => (
	<span style={style}>{word.text}</span>
);

/**
 * Draws one caption line over its parent (which must be positioned). Shared by
 * the Remotion composition and the editor's style previews, so it takes an
 * explicit pixel size instead of reading a video config.
 */
export function CaptionOverlay({
	style,
	words,
	fontSizePx,
	renderWord = renderSpan,
}: {
	style: CaptionStyle;
	words: readonly CaptionWord[];
	fontSizePx: number;
	/** Draws each word, such as a field that edits it, instead of a span. */
	renderWord?: RenderWord;
}) {
	if (words.length === 0) return null;

	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				display: "flex",
				justifyContent: ALIGN_X[style.alignX],
				alignItems: ALIGN_Y[style.alignY],
				padding: "6% 8%",
				pointerEvents: "none",
				userSelect: "none",
			}}
		>
			<div
				style={{
					// `anywhere`, not `break-word`: only the former shrinks this flex
					// item's min-content size, so a word wider than the frame wraps.
					overflowWrap: "anywhere",
					fontFamily: captionFontStack(style.font),
					fontSize: fontSizePx,
					letterSpacing: "-0.01em",
					// The shadow lifts the caption off the footage whatever else is
					// switched on, so legibility never depends on the border being set.
					textShadow: "0 0.08em 0.2em rgba(0, 0, 0, 0.55)",
					lineHeight: 1.25,
					textAlign: style.alignX,
					textTransform: TRANSFORM[style.casing],
				}}
			>
				{words.map((word, index) => (
					// Words repeat within a line, so the position is the identity.
					<Fragment key={index}>
						{spaceBetween(words[index - 1]?.text, word.text)}
						{renderWord(
							word,
							captionWordStyle(word.active ? style.activeWord : style.base),
							index,
						)}
					</Fragment>
				))}
			</div>
		</div>
	);
}
