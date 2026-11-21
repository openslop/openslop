"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { resolveModel } from "@/lib/connectors/models";
import { useCreateConnector } from "@/lib/connectors/use-create-connector";
import type { MediaItem } from "@/lib/project/media";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";

/** Transcribes a library file once and keeps its timed words on the file. */
export function useCaptionMedia() {
	const editor = useSlateStatic();
	const createConnector = useCreateConnector();
	const store = useProjectStoreHandle();
	return useCallback(
		async (item: MediaItem) => {
			if (item.captions) return;
			if (item.kind === "image")
				throw new Error(`${item.name} has no audio to caption.`);
			const stt = resolveModel("stt", editor.defaultModels().stt);
			const { textTimestamps } = await createConnector("stt", stt).generate({
				prompt: "",
				mediaUrl: item.url,
			});
			store.getState().saveMediaCaptions(item.url, textTimestamps);
		},
		[editor, createConnector, store],
	);
}
