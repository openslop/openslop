import { useCallback, useMemo } from "react";
import type { Editor } from "slate";
import { useSlateSelector } from "slate-react";
import type { CanvasElement, SceneElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { getLayoutKey } from "@/lib/video/layoutKey";
import { resolveElements } from "@/lib/video/resolve";
import { buildVideoLayout } from "@/lib/video/scene-builder";
import { useCaptionStyle } from "@/lib/video/useCaptionStyle";
import { useVideoSetting } from "@/lib/video/useVideoSetting";
import type { VideoLayout } from "@/lib/video/types";

export function useVideoLayout(editor: Editor): {
	layout: VideoLayout;
	scenes: SceneElement[];
} {
	const queue = useGenerationQueue();
	const resultVersion = useQueueSelector((q) => q.getResultVersion());
	const transitionType = useVideoSetting("transitionType");
	const aspectRatio = useVideoSetting("aspectRatio");
	const captionsEnabled = useVideoSetting("captions");
	const [captionStyle] = useCaptionStyle();

	// Selecting the key rather than the document keeps every layout consumer off
	// the per-keystroke render path: they update when the rendered video would.
	const layoutKey = useSlateSelector(
		useCallback(
			(e: Editor) => getLayoutKey(e.children, transitionType),
			[transitionType],
		),
	);

	const { layout, scenes } = useMemo(() => {
		const elements = editor.children as CanvasElement[];
		const resolved = resolveElements(elements, queue.getElementSnapshot, {
			captionsEnabled,
		});
		return {
			layout: buildVideoLayout(resolved, {
				transitionType,
				aspectRatio,
				captionStyle,
			}),
			scenes: elements.filter(isSceneElement),
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		editor,
		layoutKey,
		resultVersion,
		transitionType,
		aspectRatio,
		captionsEnabled,
		captionStyle,
		queue,
	]);

	return { layout, scenes };
}
