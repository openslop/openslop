"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { isKindCaptionable } from "@/lib/canvas/types";
import { resolveModel } from "@/lib/connectors/models";
import { useCreateConnector } from "@/lib/connectors/use-create-connector";
import type { MediaItem } from "@/lib/project/media";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";

/** Transcribes a library file and keeps its timed words on the file. */
export function useCaptionMedia() {
	const editor = useSlateStatic();
	const createConnector = useCreateConnector();
	const store = useProjectStoreHandle();
	return useCallback(
		async (item: MediaItem) => {
			if (!isKindCaptionable(item.kind))
				throw new Error(`${item.name} has no audio to caption.`);
			const stt = resolveModel("stt", editor.defaultModels().stt);
			const { textTimestamps } = await createConnector("stt", stt).generate({
				prompt: "",
				mediaUrl: item.url,
			});
			store.getState().setMediaCaptions(item.url, textTimestamps);
		},
		[editor, createConnector, store],
	);
}
