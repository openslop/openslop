"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Editor } from "slate";
import { useSlateSelector, useSlateStatic } from "slate-react";
import { shallow } from "zustand/shallow";
import { restoreDraft } from "@/lib/canvas/asset-ops";
import { getAssets } from "@/lib/canvas/assets";
import {
	CONTENT_TYPES,
	draftedType,
	isPlaygroundType,
	type PlaygroundContentType,
} from "@/lib/canvas/types";
import type { UploadKind } from "@/lib/upload/upload-files";
import { useLoadElementHistory } from "../hooks/use-element-history";
import { createRequiredContext } from "@/lib/components/create-required-context";
import type { ElementVersion } from "@/lib/generation/versions";
import { useEditorPanel } from "../panel/editor-panel-context";

/** The drafts, or only those whose takes are `kind`. */
export const draftIdsOf = (editor: Editor, kind?: UploadKind) =>
	getAssets(editor.children)
		.filter(
			(asset) =>
				isPlaygroundType(asset.type) &&
				(!kind || CONTENT_TYPES[draftedType(asset.type)].outputKind === kind),
		)
		.map((asset) => asset.id);

type PlaygroundValue = {
	type: PlaygroundContentType;
	setType: (type: PlaygroundContentType) => void;
	/** Loads what made a take back into its draft and opens the playground on it. */
	reuse: (take: ElementVersion) => void;
	/** Every draft, its takes loaded so media can be traced back to what made it. */
	draftIds: string[];
};

const [PlaygroundContext, usePlayground] =
	createRequiredContext<PlaygroundValue>("PlaygroundProvider");
export { usePlayground };

/** What the playground is making, kept while it is closed so a request loaded from anywhere opens on its type. */
export function PlaygroundProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const { setActive } = useEditorPanel();
	const [type, setType] = useState<PlaygroundContentType>("image");
	const draftIds = useSlateSelector(draftIdsOf, shallow);
	const load = useLoadElementHistory();
	useEffect(() => draftIds.forEach(load), [draftIds, load]);
	const reuse = (take: ElementVersion) => {
		if (!isPlaygroundType(take.elementType))
			throw new Error(`"${take.elementType}" is not a playground draft`);
		restoreDraft(editor, take.elementType, take);
		setType(draftedType(take.elementType));
		setActive("playground");
	};
	return (
		<PlaygroundContext value={{ type, setType, reuse, draftIds }}>
			{children}
		</PlaygroundContext>
	);
}
