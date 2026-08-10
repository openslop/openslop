import type { CSSProperties } from "react";
import type { CaptionWord } from "@/lib/video/captionLayout";
import {
	CAPTION_FONT_STACKS,
	type CaptionCasing,
	type CaptionPosition,
	type CaptionStyle,
	type CaptionTextStyle,
} from "@/lib/video/captionStyle";

const ALIGN: Record<CaptionPosition, CSSProperties["alignItems"]> = {
	top: "flex-start",
	middle: "center",
	bottom: "flex-end",
};

const TRANSFORM: Record<CaptionCasing, CSSProperties["textTransform"]> = {
	none: "none",
	upper: "uppercase",
	lower: "lowercase",
};

/** Border width is a 0-100 dial; this maps it onto a legible em range. */
const BORDER_EM_PER_UNIT = 0.0025;

// 8-direction layered shadow outline. Avoids the miter spikes that
// -webkit-text-stroke produces at acute glyph corners, and adds a soft drop
// shadow for legibility over busy frames.
function outline(width: number, color: string): string {
	const o = `${width * BORDER_EM_PER_UNIT}em`;
	return [
		`${o} 0 0 ${color}`,
		`-${o} 0 0 ${color}`,
		`0 ${o} 0 ${color}`,
		`0 -${o} 0 ${color}`,
		`${o} ${o} 0 ${color}`,
		`-${o} ${o} 0 ${color}`,
		`${o} -${o} 0 ${color}`,
		`-${o} -${o} 0 ${color}`,
		"0 0.08em 0.2em rgba(0, 0, 0, 0.55)",
	].join(", ");
}

function wordStyle(style: CaptionTextStyle, scale: number): CSSProperties {
	return {
		fontSize: `${scale}em`,
		color: style.fill,
		textShadow: style.border
			? outline(style.border.width, style.border.color)
			: undefined,
		backgroundColor: style.background ?? undefined,
		padding: style.background ? "0.05em 0.2em" : undefined,
		borderRadius: style.background ? "0.12em" : undefined,
		overflowWrap: "break-word",
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
				justifyContent: "center",
				alignItems: ALIGN[style.position],
				padding: "6% 8%",
				pointerEvents: "none",
				userSelect: "none",
			}}
		>
			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "center",
					alignItems: "baseline",
					gap: "0.1em 0.28em",
					fontFamily: CAPTION_FONT_STACKS[style.font],
					fontWeight: 700,
					fontSize: fontSizePx,
					letterSpacing: "-0.01em",
					lineHeight: 1.25,
					textAlign: "center",
					textTransform: TRANSFORM[style.casing],
				}}
			>
				{words.map((word, i) => (
					<span
						// Words repeat within a line, so the position is the identity.
						key={i}
						style={
							word.active
								? wordStyle(style.activeWord, style.activeWord.scale / 100)
								: wordStyle(style.base, 1)
						}
					>
						{word.text}
					</span>
				))}
			</div>
		</div>
	);
}
