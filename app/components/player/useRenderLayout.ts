import { useCallback, useMemo } from "react";
import type { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import type { SceneElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { getLayoutKey } from "@/lib/render/layoutKey";
import { resolveElements } from "@/lib/render/resolve";
import { buildRenderLayout } from "@/lib/render/scene-builder";
import { useVideoSetting } from "@/lib/project/useVideoSetting";
import type { RenderLayout } from "@/lib/render/types";

export function useRenderLayout(editor: Editor): {
	layout: RenderLayout;
	scenes: SceneElement[];
} {
	const queue = useGenerationQueue();
	const resultVersion = useQueueSelector((q) => q.getResultVersion());
	const transitionType = useVideoSetting("transitionType");
	const aspectRatio = useVideoSetting("aspectRatio");
	const captionsEnabled = useVideoSetting("captions");

	// Selecting the key rather than the document keeps every layout consumer off
	// the per-keystroke render path: they update when the rendered video would.
	const layoutKey = useSlateSelector(
		useCallback(
			({ children }: Editor) => getLayoutKey(children, transitionType),
			[transitionType],
		),
	);

	return useMemo(() => {
		const scenes = editor.children.filter(isSceneElement);
		const resolved = resolveElements(scenes, queue.getElementSnapshot, {
			captionsEnabled,
		});
		return {
			layout: buildRenderLayout(resolved, {
				transitionType,
				aspectRatio,
			}),
			scenes,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		editor,
		layoutKey,
		resultVersion,
		transitionType,
		aspectRatio,
		captionsEnabled,
		queue,
	]);
}
