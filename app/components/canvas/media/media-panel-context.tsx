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
	isMediaDraftType,
	type MediaContentType,
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
				isMediaDraftType(asset.type) &&
				(!kind || CONTENT_TYPES[draftedType(asset.type)].outputKind === kind),
		)
		.map((asset) => asset.id);

type MediaPanelValue = {
	type: MediaContentType;
	setType: (type: MediaContentType) => void;
	/** Loads what made a take back into its draft and opens the Media panel on it. */
	reuse: (take: ElementVersion) => void;
	/** Every draft, its takes loaded so media can be traced back to what made it. */
	draftIds: string[];
};

const [MediaPanelContext, useMediaPanel] =
	createRequiredContext<MediaPanelValue>("MediaPanelProvider");
export { useMediaPanel };

/** What the Media panel is making, kept while it is closed so a request loaded from anywhere opens on its type. */
export function MediaPanelProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const { setActive } = useEditorPanel();
	const [type, setType] = useState<MediaContentType>("image");
	const draftIds = useSlateSelector(draftIdsOf, shallow);
	const load = useLoadElementHistory();
	useEffect(() => draftIds.forEach(load), [draftIds, load]);
	const reuse = (take: ElementVersion) => {
		if (!isMediaDraftType(take.elementType))
			throw new Error(`"${take.elementType}" is not a media draft`);
		restoreDraft(editor, take.elementType, take);
		setType(draftedType(take.elementType));
		setActive("media");
	};
	return (
		<MediaPanelContext value={{ type, setType, reuse, draftIds }}>
			{children}
		</MediaPanelContext>
	);
}
