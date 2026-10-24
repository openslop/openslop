"use client";

import { useRef, useState } from "react";
import type { CaptionLineProps } from "@/components/captions/caption-line";
import {
	CaptionOverlay,
	CaptionWords,
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

/** A paused line edits on a click and saves to its element, but never while the element regenerates. */
function EditableCaptionLine({
	style,
	words,
	fontSizePx,
	element,
	from,
	to,
}: CaptionLineProps) {
	const playing = usePlayerPlaying();
	const setActiveSceneId = useSetActiveSceneId();
	const queue = useGenerationQueue();
	const regenerating = useQueueSelector((q) =>
		isGenerationActive(q.getElementSnapshot(element.id).status),
	);
	const [draft, setDraft] = useState<string | null>(null);
	const cancelled = useRef(false);
	const overlay = { style, words, fontSizePx };

	if (playing || regenerating) return <CaptionOverlay {...overlay} />;

	const text = words.map((word) => word.text).join(" ");

	const open = () => {
		setActiveSceneId(element.sceneId);
		scrollToElement(element.id);
		cancelled.current = false;
		setDraft(text);
	};

	const save = (value: string) => {
		setDraft(null);
		if (cancelled.current || value.trim() === text) return;
		queue.reviseResult(element, (result) =>
			editCaptions(result, from, to, value),
		);
	};

	if (draft === null)
		return (
			<CaptionOverlay
				{...overlay}
				asChild
				lineClassName={`${OUTLINE} cursor-text border-0 bg-transparent p-0 hover:outline-[0.06em] focus-visible:outline-[0.06em]`}
			>
				<button
					type="button"
					aria-label={`Edit caption: ${text}`}
					onClick={open}
				>
					<CaptionWords style={style} words={words} />
				</button>
			</CaptionOverlay>
		);

	return (
		<CaptionOverlay {...overlay} lineClassName={`${OUTLINE} outline-[0.06em]`}>
			<input
				autoFocus
				aria-label="Caption"
				name="caption"
				autoComplete="off"
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				onBlur={() => save(draft)}
				onKeyDown={(event) => {
					if (event.key === "Escape") cancelled.current = true;
					if (event.key === "Enter" || event.key === "Escape")
						event.currentTarget.blur();
				}}
				style={{
					font: "inherit",
					...captionWordStyle(style.base),
					fieldSizing: "content",
					border: "none",
					outline: "none",
					textAlign: "inherit",
					textTransform: "inherit",
				}}
			/>
		</CaptionOverlay>
	);
}

export const renderEditableCaptionLine = (props: CaptionLineProps) => (
	<EditableCaptionLine {...props} />
);
