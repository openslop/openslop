"use client";

import { MagicVideo } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { animateImagePrompt } from "@/lib/script/refine/animatePrompt";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useSloppy } from "@/app/components/sloppy/SloppyProvider";
import { useEditorPanel } from "../panel/EditorPanelContext";

export function AnimateButton({ element }: { element: CanvasContentElement }) {
	const { send, loading } = useSloppy();
	const { setActive } = useEditorPanel();

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
				setActive("sloppy");
				void send(animateImagePrompt(element.id));
			}}
		>
			<MagicVideo aria-hidden="true" />
			<span className="hidden @sm:inline">Animate</span>
		</Button>
	);
}
