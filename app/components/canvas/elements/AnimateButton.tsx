"use client";

import { MagicVideo } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ReactEditor, useSlateStatic } from "slate-react";
import { animateImagePrompt } from "@/lib/script/refine/animatePrompt";
import { parentSceneId, sceneIndexOf } from "@/lib/canvas/scenes";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useSloppy } from "@/app/components/sloppy/SloppyProvider";
import { useEditorPanel } from "../panel/EditorPanelContext";

export function AnimateButton({ element }: { element: CanvasContentElement }) {
	const { send, loading } = useSloppy();
	const { setActive } = useEditorPanel();
	const editor = useSlateStatic();

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
