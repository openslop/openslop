"use client";

import { ReactEditor, useSlateStatic } from "slate-react";
import { MagicVideo } from "@/components/ui/icon";
import { useSloppy } from "@/app/components/sloppy/sloppy-provider";
import { parentSceneId, sceneIndexOf } from "@/lib/canvas/scenes";
import type { ContentElement } from "@/lib/canvas/types";
import { animateUnavailableReason } from "@/lib/components/unavailable-reasons";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { animateImagePrompt } from "@/lib/script/refine/animate-prompt";
import { useEditorPanel } from "../panel/editor-panel-context";
import { ElementActionButton } from "./element-action-button";
import { useElementGeneration } from "./element-generation-context";

export function AnimateButton({ element }: { element: ContentElement }) {
	const editor = useSlateStatic();
	const { result, status } = useElementGeneration();
	const { send, loading } = useSloppy();
	const { setActive } = useEditorPanel();
	const unavailableReason = animateUnavailableReason({
		sloppyBusy: loading,
		generating: isGenerationActive(status),
	});

	return (
		<ElementActionButton
			icon={<MagicVideo />}
			label="Animate"
			tooltip={
				unavailableReason ??
				`Turn this into a video element${result?.imageUrl ? " that starts from this image" : ""}`
			}
			unavailable={unavailableReason !== null}
			onClick={() => {
				const path = ReactEditor.findPath(editor, element);
				setActive("sloppy");
				void send(
					animateImagePrompt(
						sceneIndexOf(editor.children, parentSceneId(editor, path)),
					),
				);
			}}
		/>
	);
}
