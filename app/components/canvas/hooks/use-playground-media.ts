import { useEffect } from "react";
import {
	CONTENT_TYPES,
	draftedType,
	isPlaygroundType,
} from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { useProject } from "@/lib/project/use-project";

/** Every take the playground makes lands in the project's media. */
export function usePlaygroundMedia(): void {
	const queue = useGenerationQueue();
	const addMedia = useProject((state) => state.addMedia);
	useEffect(
		() =>
			queue.onCommitted(({ elementType, result }) => {
				if (!isPlaygroundType(elementType)) return;
				const name = draftedType(elementType);
				const kind = CONTENT_TYPES[name].outputKind;
				const url = getPrimaryUrl(result, kind);
				if (!url) throw new Error(`The ${name} came back without its ${kind}`);
				addMedia([{ kind, name, url }]);
			}),
		[queue, addMedia],
	);
}
