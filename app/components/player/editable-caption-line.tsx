"use client";

import { useRef, useState } from "react";
import type { CaptionLineProps } from "@/components/captions/caption-line";
import { CaptionOverlay } from "@/components/captions/caption-overlay";
import { scrollToElement } from "@/app/components/canvas/utils/scroll-to";
import { editCaption } from "@/lib/captions/caption-edits";
import { isGenerationActive } from "@/lib/generation/snapshots";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import { usePlayerPlaying } from "./use-player-state";

const OUTLINE =
	"pointer-events-auto rounded-[0.12em] outline-solid outline-0 outline-offset-[0.1em] outline-ring";

const FIELD = {
	font: "inherit",
	border: "none",
	textTransform: "inherit",
} as const;

type Draft = { index: number; text: string };

/** A paused line edits one word at a click and saves to its element, but never while the element regenerates. */
export function EditableCaptionLine({
	style,
	words,
	fontSizePx,
	element,
	firstWordIndex,
}: CaptionLineProps) {
	const playing = usePlayerPlaying();
	const queue = useGenerationQueue();
	const regenerating = useQueueSelector((q) =>
		isGenerationActive(q.getElementSnapshot(element.id).status),
	);
	const [draft, setDraft] = useState<Draft | null>(null);
	const cancelled = useRef(false);
	const overlay = { style, words, fontSizePx };

	if (playing || regenerating) return <CaptionOverlay {...overlay} />;

	const open = (index: number) => {
		scrollToElement(element.id);
		cancelled.current = false;
		setDraft({ index, text: words[index].text });
	};

	const save = ({ index, text }: Draft) => {
		setDraft(null);
		if (cancelled.current || text.trim() === words[index].text) return;
		queue.reviseResult(element, (result) =>
			editCaption(result, firstWordIndex + index, text),
		);
	};

	return (
		<CaptionOverlay
			{...overlay}
			renderWord={(word, wordStyle, index) =>
				draft?.index === index ? (
					<input
						autoFocus
						aria-label="Caption word, clear it to delete the word"
						name="caption-word"
						autoComplete="off"
						className={`${OUTLINE} outline-[0.06em]`}
						value={draft.text}
						onChange={(event) =>
							setDraft({ ...draft, text: event.target.value })
						}
						onBlur={() => save(draft)}
						onKeyDown={(event) => {
							if (event.key === "Escape") cancelled.current = true;
							if (event.key === "Enter" || event.key === "Escape")
								event.currentTarget.blur();
						}}
						style={{ ...FIELD, ...wordStyle, fieldSizing: "content" }}
					/>
				) : (
					<button
						type="button"
						aria-label={`Edit caption word: ${word.text}`}
						className={`${OUTLINE} cursor-text hover:outline-[0.06em] focus-visible:outline-[0.06em]`}
						onClick={() => open(index)}
						style={{ ...FIELD, ...wordStyle }}
					>
						{word.text}
					</button>
				)
			}
		/>
	);
}
