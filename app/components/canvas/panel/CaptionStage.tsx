"use client";

import { useEffect, useState } from "react";
import { CaptionOverlay } from "@/components/captions/CaptionOverlay";
import { captionWordsAt } from "@/lib/video/captionLayout";
import type { CaptionStyle } from "@/lib/video/captionStyle";

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
			() => setIndex((prev) => (prev + 1) % wordCount),
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
	maxWordsPerLine = style.maxWordsPerLine,
}: {
	style: CaptionStyle;
	words: readonly string[];
	activeIndex: number;
	width: number;
	height: number;
	fontSizePx: number;
	maxWordsPerLine?: number;
}) {
	return (
		<div
			className="relative shrink-0 overflow-hidden rounded-lg bg-on-media"
			style={{ width, height }}
		>
			<CaptionOverlay
				style={style}
				words={captionWordsAt(words, activeIndex, {
					maxWordsPerLine,
					reveal: style.reveal,
				})}
				fontSizePx={fontSizePx}
			/>
		</div>
	);
}
