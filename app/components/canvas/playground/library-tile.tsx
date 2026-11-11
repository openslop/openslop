"use client";

import { useSlateStatic } from "slate-react";
import {
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Alternative, LayersPlus } from "@/components/ui/icon";
import { addElementReferences } from "@/lib/canvas/asset-ops";
import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/reference-images";
import type { GeneratedElement } from "@/lib/canvas/types";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { useBuildContext } from "@/lib/generation/use-build-context";
import type { MediaItem } from "@/lib/project/media";
import { toastError } from "@/lib/toast-error";
import { MediaLibraryItem } from "../elements/asset-tiles";
import { UploadedLabel } from "../elements/preview/uploaded-badge";
import { TileMenuItem } from "../elements/tile-actions";
import { useTake } from "./use-take";
import { usesFor, type MediaUse } from "./media-uses";

/** Mounted as the menu opens, so the targets are read from the canvas as it is then. */
function UseAsItems({ item, uses }: { item: MediaItem; uses: MediaUse[] }) {
	const editor = useSlateStatic();
	const queue = useGenerationQueue();
	const buildContext = useBuildContext();
	const run = async (use: MediaUse, element: GeneratedElement) => {
		try {
			await use.apply({ editor, queue, buildContext }, element, item);
		} catch (error) {
			toastError(
				error,
				`Couldn't use ${item.name} as a ${use.label.toLowerCase()}`,
			);
		}
	};
	return uses.map((use) => {
		const targets = use.targets(editor.children, item.kind);
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

/** Where the media can go on the canvas, each use a submenu of its targets. */
function UseAsItem({ item }: { item: MediaItem }) {
	const uses = usesFor(item.kind);
	if (uses.length === 0) return null;
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<Alternative />
				Use as
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent className="min-w-40">
				<UseAsItems item={item} uses={uses} />
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

function AddReferenceItem({
	item,
	elementId,
}: {
	item: MediaItem;
	elementId: string;
}) {
	const editor = useSlateStatic();
	if (item.kind !== "image") return null;
	return (
		<TileMenuItem
			icon={LayersPlus}
			onSelect={() =>
				addElementReferences(editor, elementId, REFERENCE_IMAGES_ATTR, [
					item.url,
				])
			}
		>
			Add to references
		</TileMenuItem>
	);
}

/** A piece of the project's media, with what the playground can do with it. */
export function LibraryTile({
	item,
	referencesOf,
}: {
	item: MediaItem;
	/** The element the tile adds itself to the references of, when it takes any. */
	referencesOf?: string;
}) {
	const { take, traced } = useTake(item);
	return (
		<MediaLibraryItem
			item={item}
			menu={
				<>
					{referencesOf && (
						<AddReferenceItem item={item} elementId={referencesOf} />
					)}
					<UseAsItem item={item} />
				</>
			}
		>
			{traced && !take && (
				<div className="absolute right-1 bottom-1">
					<UploadedLabel tooltip="Uploaded, not made in the playground" />
				</div>
			)}
		</MediaLibraryItem>
	);
}
