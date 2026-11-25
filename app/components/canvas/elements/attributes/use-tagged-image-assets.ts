"use client";

import { useSlateSelector } from "slate-react";
import { shallow } from "zustand/shallow";
import { findImageAsset } from "@/lib/canvas/assets";
import type { GeneratedElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { referencedNames } from "@/lib/connectors/name-refs";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import { getPromptText } from "@/lib/generation/inputs";

/** The named assets tagged in the prompt, and how many have an image generation adds as a reference. */
export function useTaggedImageAssets(element: GeneratedElement) {
	const names = referencedNames(getPromptText(element));
	const ids = useSlateSelector(
		(editor) =>
			names.flatMap((name) => findImageAsset(editor.children, name)?.id ?? []),
		shallow,
	);
	const count = useQueueSelector(
		(q) =>
			ids.filter((id) =>
				getPrimaryUrl(q.getElementSnapshot(id).result, "image"),
			).length,
	);
	return { names, count };
}
