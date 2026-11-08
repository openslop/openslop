"use client";

import type { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import { Button } from "@/components/ui/button";
import { MagicCaptions } from "@/components/ui/icon";
import {
	captionableElements,
	isCaptioning,
	planCaptions,
	withoutCaptions,
} from "@/lib/captions/auto-captions";
import { plural } from "@/lib/format";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import type { GenerationQueue } from "@/lib/generation/queue";
import { useGenerateSTT } from "../hooks/use-element-captions";

function describe(active: boolean, pending: number) {
	if (active) return "Captioning…";
	if (pending === 0) return "No elements to caption";
	return `Caption ${pending} ${plural(pending, "element")}`;
}

const selectCaptionable = (editor: Editor) =>
	captionableElements(editor.children);

/** Generates speech to text for every captionable element that has a result and no words yet. */
export function AutoCaptionsButton() {
	const queue = useGenerationQueue();
	const generateSTT = useGenerateSTT();

	const captionable = useSlateSelector(selectCaptionable, shallow);
	const uncaptioned = (q: GenerationQueue) =>
		planCaptions(
			withoutCaptions(captionable, q.getElementSnapshot),
			q.getElementSnapshot,
		).ready;
	const pending = useQueueSelector((q) => uncaptioned(q).length);
	const active = useQueueSelector((q) =>
		captionable.some(({ id }) => isCaptioning(q.getElementSnapshot, id)),
	);

	return (
		<Button
			size="sm"
			variant="generate"
			className="w-full"
			tooltip={describe(active, pending)}
			unavailable={active || pending === 0}
			onClick={() => generateSTT(uncaptioned(queue))}
		>
			<MagicCaptions aria-hidden="true" />
			Auto captions
		</Button>
	);
}
