"use client";

import { useEffect, useMemo, useState } from "react";
import { CaptionOverlay } from "@/components/captions/caption-overlay";
import { groupIntoLines, wordsAt } from "@/lib/captions/caption-layout";
import type { Caption } from "@remotion/captions";
import { SAMPLE_WORD_MS } from "@/lib/captions/caption-presets";
import type { CaptionStyle } from "@/lib/captions/caption-style";

/** Advances through `wordCount` words on a loop while `playing`. */
export function useCaptionCycle(wordCount: number, playing: boolean): number {
	const [index, setIndex] = useState(0);
	const [wasPlaying, setWasPlaying] = useState(playing);

	if (wasPlaying !== playing) {
		setWasPlaying(playing);
		setIndex(0);
	}

	useEffect(() => {
		if (
			!playing ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		)
			return;

		const id = setInterval(
			() => setIndex((current) => (current + 1) % wordCount),
			SAMPLE_WORD_MS,
		);
		return () => clearInterval(id);
	}, [playing, wordCount]);

	return index;
}

/**
 * A miniature video frame showing one caption line, so styling changes read the
 * same way they will over footage.
 */
export function CaptionStage({
	style,
	captions,
	activeIndex,
	width,
	height,
	fontSizePx,
	lineMs = style.lineMs,
}: {
	style: CaptionStyle;
	captions: Caption[];
	activeIndex: number;
	width: number;
	height: number;
	fontSizePx: number;
	lineMs?: number;
}) {
	const lines = useMemo(
		() => groupIntoLines(captions, lineMs),
		[captions, lineMs],
	);
	const seconds = captions[activeIndex].startMs / 1000;
	const line = lines.find(
		({ firstWordIndex, tokens }) =>
			activeIndex < firstWordIndex + tokens.length,
	);
	return (
		<div
			className="relative shrink-0 overflow-hidden rounded-lg bg-on-media"
			style={{ width, height }}
		>
			<CaptionOverlay
				style={style}
				words={line ? wordsAt(line.tokens, seconds) : []}
				fontSizePx={fontSizePx}
			/>
		</div>
	);
}
