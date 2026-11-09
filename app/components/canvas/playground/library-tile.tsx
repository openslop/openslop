"use client";

import { useSlateStatic } from "slate-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alternative, LayersPlus } from "@/components/ui/icon";
import { addElementReferences } from "@/lib/canvas/asset-ops";
import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/reference-images";
import type { GeneratedElement } from "@/lib/canvas/types";
import { buildNode } from "@/lib/generation/generation-graph";
import {
	useElementHistorySelector,
	useGenerationQueue,
} from "@/lib/generation/generation-queue-provider";
import { useBuildContext } from "@/lib/generation/use-build-context";
import type { MediaItem } from "@/lib/project/media";
import type { ElementVersion } from "@/lib/generation/versions";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { toastError } from "@/lib/toast-error";
import { commitUploaded } from "@/lib/upload/uploaded-result";
import { MediaLibraryItem } from "../elements/asset-tiles";
import { UploadedLabel } from "../elements/preview/uploaded-badge";
import { TileAction, TilePlayer } from "../elements/tile-actions";
import { usesFor, type MediaUse, type UseContext } from "./media-uses";

function useUseContext(): UseContext {
	const editor = useSlateStatic();
	const queue = useGenerationQueue();
	const buildContext = useBuildContext();
	return {
		editor,
		showAsResult: (element, { kind, url }) =>
			commitUploaded(queue, buildNode(element, buildContext()), kind, url),
	};
}

/** Mounted as the menu opens, so the targets are read from the canvas as it is then. */
function UseAsItems({ item, uses }: { item: MediaItem; uses: MediaUse[] }) {
	const context = useUseContext();
	const run = async (use: MediaUse, element: GeneratedElement) => {
		try {
			await use.apply(context, element, item);
		} catch (error) {
			toastError(
				error,
				`Couldn't use ${item.name} as a ${use.label.toLowerCase()}`,
			);
		}
	};
	return uses.map((use) => {
		const targets = use.targets(context.editor.children, item.kind);
		return (
			<DropdownMenuSub key={use.label}>
				<DropdownMenuSubTrigger disabled={targets.length === 0}>
					{use.label}
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent className="max-h-64 overflow-y-auto">
					{targets.map(({ label, element }) => (
						<DropdownMenuItem
							key={element.id}
							onSelect={() => run(use, element)}
						>
							{label}
						</DropdownMenuItem>
					))}
				</DropdownMenuSubContent>
			</DropdownMenuSub>
		);
	});
}

function UseAsMenu({ item }: { item: MediaItem }) {
	const uses = usesFor(item.kind);
	if (uses.length === 0) return null;
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<TileAction
					name={item.name}
					describe={(name) => `Use ${name} as`}
					tooltip="Use as"
					icon={Alternative}
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-40">
				<UseAsItems item={item} uses={uses} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function AddReferenceAction({
	item,
	elementId,
}: {
	item: MediaItem;
	elementId: string;
}) {
	const editor = useSlateStatic();
	if (item.kind !== "image") return null;
	return (
		<TileAction
			name={item.name}
			describe={(name) => `Add ${name} to references`}
			icon={LayersPlus}
			onClick={() =>
				addElementReferences(editor, elementId, REFERENCE_IMAGES_ATTR, [
					item.url,
				])
			}
		/>
	);
}

/** A piece of the project's media, with what the playground can do with it. */
export function LibraryTile({
	item,
	referencesOf,
	draftIds,
	onReuse,
}: {
	item: MediaItem;
	/** The element the tile adds itself to the references of, when it takes any. */
	referencesOf?: string;
	/** The drafts whose takes may have made this media. */
	draftIds: string[];
	onReuse: (take: ElementVersion) => void;
}) {
	const take = useElementHistorySelector((history) =>
		draftIds
			.flatMap((id) => history.get(id))
			.find(({ result }) => getPrimaryUrl(result, item.kind) === item.url),
	);
	const traced = useElementHistorySelector((history) =>
		draftIds.every((id) => history.status(id) === "ready"),
	);
	return (
		<MediaLibraryItem
			item={item}
			onReuse={take && (() => onReuse(take))}
			actions={
				<>
					{referencesOf && (
						<AddReferenceAction item={item} elementId={referencesOf} />
					)}
					<UseAsMenu item={item} />
				</>
			}
		>
			{item.kind === "video" && <TilePlayer src={item.url} name={item.name} />}
			{traced && !take && (
				<div className="absolute right-1 bottom-1">
					<UploadedLabel tooltip="Uploaded, not made in the playground" />
				</div>
			)}
		</MediaLibraryItem>
	);
}
