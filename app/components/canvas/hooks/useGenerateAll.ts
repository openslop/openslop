import { useCallback } from "react";
import { Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { generationQueue, isStaleResult } from "@/lib/generation/queue";
import { buildGenerationJob } from "../utils/buildGenerationJob";
import { getGenerationInputs } from "../utils/getGenerationInputs";
import { getContentElements } from "../utils/nodeUtils";

export function useGenerateAll(editor: Editor) {
	const { connectorConfig } = useConfig();

	const generateAll = useCallback(() => {
		const jobs = getContentElements(editor.children)
			.filter((el) => {
				const snap = generationQueue.getElementSnapshot(el.id);
				return !snap.result || isStaleResult(snap, getGenerationInputs(el));
			})
			.map((el) => buildGenerationJob(el, connectorConfig))
			.filter((job): job is NonNullable<typeof job> => job !== null);
		generationQueue.enqueueAll(jobs);
	}, [editor, connectorConfig]);

	return { generateAll };
}
