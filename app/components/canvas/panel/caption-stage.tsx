"use client";

import { useEffect, useMemo, useState } from "react";
import { CaptionOverlay } from "@/components/captions/caption-overlay";
import { groupIntoLines, wordsOnLine } from "@/lib/captions/caption-layout";
import type { CaptionStyle } from "@/lib/captions/caption-style";

const WORD_MS = 420;

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
			WORD_MS,
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
	words,
	activeIndex,
	width,
	height,
	fontSizePx,
	lineMs = style.lineMs,
}: {
	style: CaptionStyle;
	words: readonly string[];
	activeIndex: number;
	width: number;
	height: number;
	fontSizePx: number;
	lineMs?: number;
}) {
	const lines = useMemo(
		() =>
			groupIntoLines(
				words.map((text, at) => ({
					text,
					start: (at * WORD_MS) / 1000,
					end: ((at + 1) * WORD_MS) / 1000,
				})),
				lineMs,
			),
		[words, lineMs],
	);
	const line = lines.find(({ to }) => activeIndex < to);
	return (
		<div
			className="relative shrink-0 overflow-hidden rounded-lg bg-on-media"
			style={{ width, height }}
		>
			<CaptionOverlay
				style={style}
				words={line ? wordsOnLine(words, activeIndex, line) : []}
				fontSizePx={fontSizePx}
			/>
		</div>
	);
}
