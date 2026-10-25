"use client";

import uniqBy from "lodash/uniqBy";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MagicCaptions } from "@/components/ui/icon";
import { captionsNodeId } from "@/lib/captions/captions-job";
import type { ElementRef } from "@/lib/canvas/types";
import { plural } from "@/lib/format";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import type { GenerationQueue } from "@/lib/generation/queue";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { captionableSequences } from "@/lib/render/caption-rule";
import { useLayout } from "@/app/components/player/render-layout-context";
import { useGenerateSTT } from "../hooks/use-element-captions";

const uncaptioned = (queue: GenerationQueue, elements: ElementRef[]) =>
	elements.filter(({ id }) => {
		const { status, result } = queue.getElementSnapshot(id);
		return !isGenerationActive(status) && result?.textTimestamps === undefined;
	});

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

	const captionable = useMemo(
		() =>
			uniqBy(
				captionableSequences(layout).map(({ element }) => element),
				"id",
			),
		[layout],
	);
	const pending = useQueueSelector((q) => uncaptioned(q, captionable).length);
	const active = useQueueSelector((q) =>
		captionable.some(({ id }) =>
			isGenerationActive(q.getElementSnapshot(captionsNodeId(id)).status),
		),
	);

	return (
		<Button
			size="sm"
			variant="generate"
			className="w-full"
			tooltip={describe(active, pending, captionable.length)}
			unavailable={active || pending === 0}
			onClick={() => generateSTT(uncaptioned(queue, captionable))}
		>
			<MagicCaptions aria-hidden="true" />
			Auto captions
		</Button>
	);
}
