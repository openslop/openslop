"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MagicCaptions } from "@/components/ui/icon";
import {
	captionableClips,
	isCaptioning,
	planCaptions,
} from "@/lib/captions/auto-captions";
import { plural } from "@/lib/format";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import type { GenerationQueue } from "@/lib/generation/queue";
import { useLayout } from "@/app/components/player/render-layout-context";
import { useGenerateSTT } from "../hooks/use-element-captions";

function describe(active: boolean, pending: number, captionable: number) {
	if (captionable === 0) return "No clips to caption";
	if (active) return "Captioning…";
	if (pending === 0) return "Every clip is captioned";
	return `Caption ${pending} ${plural(pending, "clip")}`;
}

/** Generates speech to text for every element on the timeline that would show captions and has no words yet. */
export function AutoCaptionsButton() {
	const queue = useGenerationQueue();
	const { layout } = useLayout();
	const generateSTT = useGenerateSTT();

	const captionable = useMemo(() => captionableClips(layout), [layout]);
	const uncaptioned = (q: GenerationQueue) =>
		planCaptions(captionable, q.getElementSnapshot, { recaption: false }).ready;
	const pending = useQueueSelector((q) => uncaptioned(q).length);
	const active = useQueueSelector((q) =>
		captionable.some(({ id }) => isCaptioning(q.getElementSnapshot, id)),
	);

	return (
		<Button
			size="sm"
			variant="generate"
			className="w-full"
			tooltip={describe(active, pending, captionable.length)}
			unavailable={active || pending === 0}
			onClick={() => generateSTT(uncaptioned(queue))}
		>
			<MagicCaptions aria-hidden="true" />
			Auto captions
		</Button>
	);
}
