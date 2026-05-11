import { useMemo } from "react";
import type { Editor } from "slate";
import type { CanvasElement } from "@/app/components/canvas/types";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { resolveElements } from "@/lib/video/resolve";
import { buildVideoLayout } from "@/lib/video/scene-builder";
import { useTransitionType } from "@/lib/video/useTransitionType";
import type { VideoLayout } from "@/lib/video/types";

export function useVideoLayout(
	getEditor: () => Editor | null,
	layoutKey: string,
): { layout: VideoLayout | null; playerKey: string } {
	const queue = useGenerationQueue();
	const resultVersion = useQueueSelector((q) => q.getResultVersion());
	const transitionType = useTransitionType();

	const layout = useMemo(() => {
		const editor = getEditor();
		if (!editor) return null;
		const elements = editor.children as CanvasElement[];
		const resolved = resolveElements(elements, queue.getElementSnapshot);
		return buildVideoLayout(resolved, { transitionType });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getEditor, layoutKey, resultVersion, transitionType, queue]);

	return { layout, playerKey: `${layoutKey}-${resultVersion}` };
}
