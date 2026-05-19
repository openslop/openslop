import { useMemo } from "react";
import sortedLastIndex from "lodash/sortedLastIndex";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { TextTimestamp } from "@/lib/connectors/types";

const MAX_LINE_WIDTH_RATIO = 0.8;
const FONT_SIZE_RATIO = 0.065;
// Approximate average glyph advance for uppercase bold Geist, in em units.
// Used to translate the max pixel width into a character cap without measuring.
const AVG_CHAR_WIDTH_EM = 0.6;

const container: React.CSSProperties = {
	justifyContent: "flex-end",
	alignItems: "center",
	paddingBottom: "5%",
	pointerEvents: "none",
	userSelect: "none",
};

// 8-direction layered shadow outline. Avoids the miter spikes that
// -webkit-text-stroke produces at acute glyph corners, and adds a soft drop
// shadow for legibility over busy frames.
const OUTLINE = "0.06em";
const textShadow = [
	`${OUTLINE} 0 0 black`,
	`-${OUTLINE} 0 0 black`,
	`0 ${OUTLINE} 0 black`,
	`0 -${OUTLINE} 0 black`,
	`${OUTLINE} ${OUTLINE} 0 black`,
	`-${OUTLINE} ${OUTLINE} 0 black`,
	`${OUTLINE} -${OUTLINE} 0 black`,
	`-${OUTLINE} -${OUTLINE} 0 black`,
	"0 0.08em 0.2em rgba(0, 0, 0, 0.55)",
].join(", ");

const text: React.CSSProperties = {
	fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
	fontWeight: 700,
	letterSpacing: "-0.01em",
	color: "white",
	textShadow,
	textAlign: "left",
	textTransform: "uppercase",
	whiteSpace: "nowrap",
};

function computeChunkStarts(
	timestamps: readonly TextTimestamp[],
	maxChars: number,
): number[] {
	const starts: number[] = [];
	if (timestamps.length === 0) return starts;
	starts.push(0);
	let len = timestamps[0].text.length;
	for (let i = 1; i < timestamps.length; i++) {
		const wordLen = timestamps[i].text.length;
		const next = len + 1 + wordLen;
		if (next > maxChars) {
			starts.push(i);
			len = wordLen;
		} else {
			len = next;
		}
	}
	return starts;
}

export function Captions({ timestamps }: { timestamps: TextTimestamp[] }) {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();
	const fontSizePx = height * FONT_SIZE_RATIO;
	const maxChars = Math.max(
		1,
		Math.floor(
			(width * MAX_LINE_WIDTH_RATIO) / (fontSizePx * AVG_CHAR_WIDTH_EM),
		),
	);

	const startTimes = useMemo(
		() => timestamps.map((ts) => ts.start),
		[timestamps],
	);
	const starts = useMemo(
		() => computeChunkStarts(timestamps, maxChars),
		[timestamps, maxChars],
	);

	if (starts.length === 0) return null;

	const seconds = frame / fps;
	const wordIndex = sortedLastIndex(startTimes, seconds) - 1;
	if (wordIndex < 0) return null;

	const chunkStart = starts[sortedLastIndex(starts, wordIndex) - 1];
	const visible = timestamps
		.slice(chunkStart, wordIndex + 1)
		.map((ts) => ts.text)
		.join(" ");

	return (
		<AbsoluteFill style={container}>
			<div
				style={{
					width: `${MAX_LINE_WIDTH_RATIO * 100}%`,
					fontSize: fontSizePx,
				}}
			>
				<span style={text}>{visible}</span>
			</div>
		</AbsoluteFill>
	);
}
