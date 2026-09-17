"use client";

import { useSlateStatic } from "slate-react";
import { Button } from "@/components/ui/button";
import { MagicVideo } from "@/components/ui/icon";
import { useSloppy } from "@/app/components/sloppy/SloppyProvider";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useResolveDefaultModels } from "@/lib/connectors/useDefaultModels";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { animateVideoPrompt } from "@/lib/script/refine/animatePrompt";
import { useEditorPanel } from "../panel/EditorPanelContext";
import { animateElement } from "../utils/nodeOps";
import { useElementGeneration } from "./ElementGenerationContext";

export function AnimateButton({ element }: { element: CanvasContentElement }) {
	const editor = useSlateStatic();
	const defaultModels = useResolveDefaultModels();
	const { result, status } = useElementGeneration();
	const { send, loading } = useSloppy();
	const { setActive } = useEditorPanel();

	if (element.type !== "image") return null;
	const picture = result?.imageUrl;

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			tooltip={`Turn this into a video element${picture ? " that starts from this image" : ""}`}
			className="shrink-0"
			disabled={loading || isGenerationActive(status)}
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => {
				const scene = animateElement(editor, element, picture, defaultModels());
				setActive("sloppy");
				void send(animateVideoPrompt(scene, picture));
			}}
		>
			<MagicVideo aria-hidden="true" />
			<span className="hidden @sm:inline">Animate</span>
		</Button>
	);
}
