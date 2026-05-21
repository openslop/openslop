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

function buildCaptionData(
	timestamps: readonly TextTimestamp[],
	maxChars: number,
): { startTimes: number[]; visibleByWordIndex: string[] } {
	const startTimes = timestamps.map((ts) => ts.start);
	const visibleByWordIndex: string[] = [];
	if (timestamps.length === 0) return { startTimes, visibleByWordIndex };

	let currentLine = timestamps[0].text;
	let currentLineLen = currentLine.length;
	visibleByWordIndex.push(currentLine);

	for (let i = 1; i < timestamps.length; i++) {
		const word = timestamps[i].text;
		const nextLen = currentLineLen + 1 + word.length;
		if (nextLen > maxChars) {
			currentLine = word;
			currentLineLen = word.length;
		} else {
			currentLine = `${currentLine} ${word}`;
			currentLineLen = nextLen;
		}
		visibleByWordIndex.push(currentLine);
	}

	return { startTimes, visibleByWordIndex };
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

	const { startTimes, visibleByWordIndex } = useMemo(
		() => buildCaptionData(timestamps, maxChars),
		[timestamps, maxChars],
	);

	if (visibleByWordIndex.length === 0) return null;

	const seconds = frame / fps;
	const wordIndex = sortedLastIndex(startTimes, seconds) - 1;
	if (wordIndex < 0) return null;

	const visible = visibleByWordIndex[wordIndex];

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
