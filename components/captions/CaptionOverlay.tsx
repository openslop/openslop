import type { CSSProperties } from "react";
import type { CaptionWord } from "@/lib/video/captionLayout";
import { captionFontStack } from "@/lib/video/captionFonts";
import {
	type CaptionAlignX,
	type CaptionAlignY,
	type CaptionCasing,
	type CaptionStyle,
	type CaptionTextStyle,
} from "@/lib/video/captionStyle";

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

/** Border width is a 0-100 dial; this maps it onto a legible em range. */
const BORDER_EM_PER_UNIT = 0.0025;

const DROP_SHADOW = "0 0.08em 0.2em rgba(0, 0, 0, 0.55)";

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
		textShadow: DROP_SHADOW,
	};
}

function wordStyle(style: CaptionTextStyle, scale: number): CSSProperties {
	return {
		fontSize: `${scale}em`,
		color: style.fill,
		fontWeight: style.bold ? 700 : 400,
		fontStyle: style.italic ? "italic" : "normal",
		textDecoration: style.underline ? "underline" : "none",
		...(style.border && outline(style.border.width, style.border.color)),
		backgroundColor: style.background ?? undefined,
		// The padding is unconditional and carries the word spacing, so switching
		// a background on changes only the paint and never the layout.
		padding: "0.05em 0.11em",
		borderRadius: "0.12em",
		// `anywhere`, not `break-word`: only the former shrinks the span's
		// min-content size, so a word wider than the frame wraps instead of
		// overflowing this flex item.
		overflowWrap: "anywhere",
	};
}

/**
 * Draws one caption line over its parent (which must be positioned). Shared by
 * the Remotion composition and the editor's style previews, so it takes an
 * explicit pixel size instead of reading a video config.
 */
export function CaptionOverlay({
	style,
	words,
	fontSizePx,
}: {
	style: CaptionStyle;
	words: readonly CaptionWord[];
	fontSizePx: number;
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
					display: "flex",
					flexWrap: "wrap",
					justifyContent: ALIGN_X[style.alignX],
					alignItems: "baseline",
					gap: "0.1em 0.06em",
					fontFamily: captionFontStack(style.font),
					fontSize: fontSizePx,
					letterSpacing: "-0.01em",
					lineHeight: 1.25,
					textAlign: style.alignX,
					textTransform: TRANSFORM[style.casing],
				}}
			>
				{words.map((word, i) => (
					<span
						// Words repeat within a line, so the position is the identity.
						key={i}
						style={{
							...(word.active
								? wordStyle(style.activeWord, style.activeWord.scale / 100)
								: wordStyle(style.base, 1)),
							visibility: word.hidden ? "hidden" : "visible",
						}}
					>
						{word.text}
					</span>
				))}
			</div>
		</div>
	);
}
