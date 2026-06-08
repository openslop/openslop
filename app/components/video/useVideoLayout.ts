import { useMemo } from "react";
import type { Editor } from "slate";
import type { CanvasElement, SceneElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { resolveElements } from "@/lib/video/resolve";
import { buildVideoLayout } from "@/lib/video/scene-builder";
import type { AspectRatio } from "@/lib/video/aspectRatio";
import type { TransitionType } from "@/lib/video/transitions";
import type { VideoLayout } from "@/lib/video/types";

export function useVideoLayout(
	editor: Editor,
	layoutKey: string,
	transitionType: TransitionType,
	aspectRatio: AspectRatio,
): {
	layout: VideoLayout | null;
	playerKey: string;
	scenes: SceneElement[];
} {
	const queue = useGenerationQueue();
	const resultVersion = useQueueSelector((q) => q.getResultVersion());

	const { layout, scenes } = useMemo(() => {
		const elements = editor.children as CanvasElement[];
		const resolved = resolveElements(elements, queue.getElementSnapshot);
		return {
			layout: buildVideoLayout(resolved, { transitionType, aspectRatio }),
			scenes: elements.filter(isSceneElement),
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editor, layoutKey, resultVersion, transitionType, aspectRatio, queue]);

	return { layout, playerKey: `${layoutKey}-${resultVersion}`, scenes };
}
