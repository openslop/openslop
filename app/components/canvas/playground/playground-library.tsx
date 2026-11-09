"use client";

import { useEffect, useState } from "react";
import { useSlateSelector } from "slate-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbnailGrid } from "@/components/ui/thumbnail";
import { shallow } from "zustand/shallow";
import type { Editor } from "slate";
import { findAsset, getAssets } from "@/lib/canvas/assets";
import { elementOffers } from "@/lib/canvas/element-connector";
import {
	CONTENT_TYPES,
	draftedType,
	isPlaygroundType,
	playgroundTypeOf,
	type PlaygroundContentType,
} from "@/lib/canvas/types";
import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/reference-images";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import type { ElementVersion } from "@/lib/generation/versions";
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
import { useLoadElementHistory } from "../hooks/use-element-history";
import { PanelCard, PanelCardAddButton } from "../panel/panel-card";
import { LibraryTile } from "./library-tile";

/** The drafts, or only those whose takes are `kind`. */
const draftIdsOf = (editor: Editor, kind?: UploadKind) =>
	getAssets(editor.children)
		.filter(
			(asset) =>
				isPlaygroundType(asset.type) &&
				(!kind || CONTENT_TYPES[draftedType(asset.type)].outputKind === kind),
		)
		.map((asset) => asset.id);

/** Every draft's takes, so a take in the media can be traced back to what made it. */
function useDraftHistories(): string[] {
	const draftIds = useSlateSelector(draftIdsOf, shallow);
	const load = useLoadElementHistory();
	useEffect(() => draftIds.forEach(load), [draftIds, load]);
	return draftIds;
}

/** Holds the place of a take still on its way; gone once it lands in the media. */
function PendingTile({ id, kind }: { id: string; kind: UploadKind }) {
	const type = useSlateSelector(
		(editor) =>
			getAssets(editor.children).find((asset) => asset.id === id)?.type,
	);
	const { status, startedAt } = useQueueSelector((q) =>
		q.getElementSnapshot(id),
	);
	if (!type || !isPlaygroundType(type) || !isGenerationActive(status))
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

/** Every take and upload of one kind, newest first, under whatever the playground is making now; switching type shows its kind. */
export function PlaygroundLibrary({
	type,
	onReuse,
}: {
	type: PlaygroundContentType;
	onReuse: (take: ElementVersion) => void;
}) {
	const allDraftIds = useDraftHistories();
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
		const draft = findAsset(editor.children, playgroundTypeOf(type));
		return draft && elementOffers(draft, REFERENCE_IMAGES_ATTR)
			? draft.id
			: undefined;
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
				title="Media library"
				action={
					<PanelCardAddButton label="Upload media" onClick={openPicker} />
				}
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
								draftIds={allDraftIds}
								onReuse={onReuse}
							/>
						))}
					</ThumbnailGrid>
				)}
			</PanelCard>
		</>
	);
}
