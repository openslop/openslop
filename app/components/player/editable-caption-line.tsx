"use client";

import { useRef, useState } from "react";
import type { CaptionLineProps } from "@/components/captions/caption-line";
import {
	CaptionOverlay,
	captionWordStyle,
} from "@/components/captions/caption-overlay";
import { scrollToElement } from "@/app/components/canvas/utils/scroll-to";
import { useSetActiveSceneId } from "@/app/components/scene-selection/active-scene-context";
import { editCaptions } from "@/lib/captions/caption-edits";
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
function EditableCaptionLine({
	style,
	words,
	fontSizePx,
	element,
	firstWord,
}: CaptionLineProps) {
	const playing = usePlayerPlaying();
	const setActiveSceneId = useSetActiveSceneId();
	const queue = useGenerationQueue();
	const regenerating = useQueueSelector((q) =>
		isGenerationActive(q.getElementSnapshot(element.id).status),
	);
	const [draft, setDraft] = useState<Draft | null>(null);
	const cancelled = useRef(false);
	const overlay = { style, words, fontSizePx };

	if (playing || regenerating) return <CaptionOverlay {...overlay} />;

	const open = (index: number) => {
		setActiveSceneId(element.sceneId);
		scrollToElement(element.id);
		cancelled.current = false;
		setDraft({ index, text: words[index].text });
	};

	const save = ({ index, text }: Draft) => {
		setDraft(null);
		if (cancelled.current || text.trim() === words[index].text) return;
		queue.reviseResult(element, (result) =>
			editCaptions(result, firstWord + index, text),
		);
	};

	return (
		<CaptionOverlay {...overlay}>
			{words.map((word, index) => {
				const wordStyle = captionWordStyle(
					word.active ? style.activeWord : style.base,
				);
				if (draft?.index === index)
					return (
						<input
							// Words repeat within a line, so the position is the identity.
							key={index}
							autoFocus
							aria-label="Caption word, clear it to delete the word"
							name="caption-word"
							autoComplete="off"
							className={`${OUTLINE} outline-[0.06em]`}
							value={draft.text}
							onChange={(event) =>
								setDraft({ index, text: event.target.value })
							}
							onBlur={() => save(draft)}
							onKeyDown={(event) => {
								if (event.key === "Escape") cancelled.current = true;
								if (event.key === "Enter" || event.key === "Escape")
									event.currentTarget.blur();
							}}
							style={{
								...FIELD,
								...wordStyle,
								fieldSizing: "content",
							}}
						/>
					);
				return (
					<button
						key={index}
						type="button"
						aria-label={`Edit caption word: ${word.text}`}
						className={`${OUTLINE} cursor-text hover:outline-[0.06em] focus-visible:outline-[0.06em]`}
						onClick={() => open(index)}
						style={{ ...FIELD, ...wordStyle }}
					>
						{word.text}
					</button>
				);
			})}
		</CaptionOverlay>
	);
}

export const renderEditableCaptionLine = (props: CaptionLineProps) => (
	<EditableCaptionLine {...props} />
);
