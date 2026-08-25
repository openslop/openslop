"use client";

import { MagicVideo } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { animateImagePrompt } from "@/lib/script/refine/animatePrompt";
import { carryOverStill } from "@/lib/connectors/animated_image/plugins/still-frame";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useSloppy } from "@/app/components/sloppy/SloppyProvider";
import { useEditorPanel } from "../panel/EditorPanelContext";

export function AnimateButton({ element }: { element: CanvasContentElement }) {
	const { send, loading } = useSloppy();
	const { setActive } = useEditorPanel();
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();

	if (element.type !== "image") return null;

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			tooltip="Animate this image"
			className="shrink-0"
			disabled={loading}
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => {
				carryOverStill(element, queue, buildNode);
				setActive("sloppy");
				void send(animateImagePrompt(element.id));
			}}
		>
			<MagicVideo aria-hidden="true" />
			<span className="hidden @sm:inline">Animate</span>
		</Button>
	);
}
