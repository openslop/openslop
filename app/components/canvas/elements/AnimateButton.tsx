"use client";

import { MagicVideo } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { animateImagePrompt } from "@/lib/script/refine/animatePrompt";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useRefine } from "../RefineProvider";

export function AnimateButton({ element }: { element: CanvasContentElement }) {
	const { refineScript, refineLoading } = useRefine();

	if (element.type !== "image") return null;

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			tooltip="Animate this image"
			className="shrink-0"
			disabled={refineLoading}
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => refineScript(animateImagePrompt(element.id))}
		>
			<MagicVideo aria-hidden="true" />
			<span className="hidden sm:inline">Animate</span>
		</Button>
	);
}
