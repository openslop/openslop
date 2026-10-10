"use client";

import { ReactEditor, useSlateStatic } from "slate-react";
import { Button } from "@/components/ui/button";
import { MagicVideo } from "@/components/ui/icon";
import { useSloppy } from "@/app/components/sloppy/sloppy-provider";
import { parentSceneId, sceneIndexOf } from "@/lib/canvas/scenes";
import type { ContentElement } from "@/lib/canvas/types";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { animateImagePrompt } from "@/lib/script/refine/animate-prompt";
import { useEditorPanel } from "../panel/editor-panel-context";
import { useElementGeneration } from "./element-generation-context";

export function AnimateButton({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	const { result, status } = useElementGeneration();
	const { send, loading } = useSloppy();
	const { setActive } = useEditorPanel();

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
				const path = ReactEditor.findPath(editor, element);
				setActive("sloppy");
				void send(
					animateImagePrompt(
						sceneIndexOf(editor.children, parentSceneId(editor, path)),
					),
				);
			}}
		>
			<MagicVideo aria-hidden="true" />
			<span className="hidden @sm:inline">Animate</span>
		</Button>
	);
}
