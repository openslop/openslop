"use client";

import { useState } from "react";
import { useSlateSelector } from "slate-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbnailGrid } from "@/components/ui/thumbnail";
import { shallow } from "zustand/shallow";
import { getAssets, requireAsset } from "@/lib/canvas/assets";
import { elementOffers } from "@/lib/canvas/element-connector";
import {
	CONTENT_TYPES,
	draftedType,
	isMediaDraftType,
	mediaDraftTypeOf,
	type MediaContentType,
} from "@/lib/canvas/types";
import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/reference-images";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { useMediaLibrary } from "@/lib/project/use-media-library";
import type { UploadKind } from "@/lib/upload/upload-files";
import { AssetTile } from "../elements/asset-tile";
import { AudioCard } from "../elements/audio-card";
import { ELEMENT_CONFIGS } from "../elements/element-configs";
import { GenerationIndicator } from "../elements/generation-indicator";
import {
	EmptyLibrary,
	MEDIA_KINDS,
	MediaLibraryFilter,
} from "../elements/media-kinds";
import { uploadingTiles } from "../elements/uploading-tile";
import { PanelCard } from "../panel/panel-card";
import { AddButton } from "@/components/ui/add-button";
import { LibraryTile } from "./library-tile";
import { draftIdsOf } from "./media-panel-context";

/** Holds the place of a take still on its way; gone once it lands in the media. */
function PendingTile({ id, kind }: { id: string; kind: UploadKind }) {
	const type = useSlateSelector(
		(editor) =>
			getAssets(editor.children).find((asset) => asset.id === id)?.type,
	);
	const { status, startedAt } = useQueueSelector((q) =>
		q.getElementSnapshot(id),
	);
	if (!type || !isMediaDraftType(type) || !isGenerationActive(status))
		return null;
	const { label, Icon } = ELEMENT_CONFIGS[draftedType(type)];
	if (kind === "audio")
		return (
			<AudioCard name={label}>
				<GenerationIndicator status={status} startedAt={startedAt} />
				<Skeleton className="h-5 flex-1 rounded-md" />
			</AudioCard>
		);
	return (
		<AssetTile
			name={label}
			Icon={Icon}
			fallback="icon"
			status="generating"
			startedAt={startedAt}
		/>
	);
}

/** Every take and upload of one kind, newest first, under whatever the Media panel is making now; switching type shows its kind. */
export function MediaLibrary({ type }: { type: MediaContentType }) {
	const { outputKind } = CONTENT_TYPES[type];
	const {
		kind,
		setKind,
		query,
		setQuery,
		items,
		openPicker,
		uploadingCount,
		inputElement,
	} = useMediaLibrary(outputKind);
	const [shownFor, setShownFor] = useState(outputKind);
	if (shownFor !== outputKind) {
		setShownFor(outputKind);
		setKind(outputKind);
	}
	const referencesOf = useSlateSelector((editor) => {
		const draft = requireAsset(editor.children, mediaDraftTypeOf(type));
		return elementOffers(draft, REFERENCE_IMAGES_ATTR) ? draft.id : undefined;
	});
	const draftIds = useSlateSelector(
		(editor) => draftIdsOf(editor, kind),
		shallow,
	);
	const pending = useQueueSelector((q) =>
		draftIds.some((id) => isGenerationActive(q.getElementSnapshot(id).status)),
	);

	return (
		<>
			{inputElement}
			<PanelCard
				title="Library"
				action={<AddButton label="Upload media" onClick={openPicker} />}
			>
				<MediaLibraryFilter
					kind={kind}
					onKindChange={setKind}
					query={query}
					onQueryChange={setQuery}
				/>
				{items.length === 0 && !pending && uploadingCount === 0 ? (
					<EmptyLibrary kind={kind} query={query} />
				) : (
					<ThumbnailGrid columns={MEDIA_KINDS[kind].columns}>
						{uploadingTiles(uploadingCount, kind)}
						{draftIds.map((id) => (
							<PendingTile key={id} id={id} kind={kind} />
						))}
						{items.map((item) => (
							<LibraryTile
								key={item.name}
								item={item}
								referencesOf={referencesOf}
							/>
						))}
					</ThumbnailGrid>
				)}
			</PanelCard>
		</>
	);
}
