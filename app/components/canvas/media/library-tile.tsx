"use client";

import { useState, useTransition } from "react";
import { useSlateStatic } from "slate-react";
import {
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ActionMenuItems,
	type ActionMenuItem,
} from "@/components/ui/action-menu";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Alternative, LayersPlus, MagicCaptions } from "@/components/ui/icon";
import { addElementReferences } from "@/lib/canvas/asset-ops";
import { REFERENCE_IMAGES_ATTR } from "@/lib/connectors/attributes/reference-images";
import { isKindCaptionable, type GeneratedElement } from "@/lib/canvas/types";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { useBuildContext } from "@/lib/generation/use-build-context";
import { useCaptionMedia } from "@/lib/captions/use-caption-media";
import type { MediaItem } from "@/lib/project/media";
import { useProject } from "@/lib/project/use-project";
import { toastError } from "@/lib/toast-error";
import { MediaLibraryItem } from "../elements/asset-tiles";
import { UploadedLabel } from "../elements/preview/uploaded-badge";
import { captionsActions, captionsPending } from "../elements/captions-menu";
import { TileMenuItem } from "../elements/tile-actions";
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

/** A library file's captions: generated from its menu, kept on the file. */
function useMediaCaptions(item: MediaItem) {
	const captionMedia = useCaptionMedia();
	const setMediaCaptions = useProject((state) => state.setMediaCaptions);
	const [generating, startGenerating] = useTransition();
	const [removing, setRemoving] = useState(false);
	const captions = {
		captioned: item.captions !== undefined,
		generate: () =>
			startGenerating(async () => {
				try {
					await captionMedia(item);
				} catch (error) {
					toastError(error, `Couldn't generate captions for ${item.name}`);
				}
			}),
	};
	return {
		items: captionsActions(captions, () => setRemoving(true)),
		pending: captionsPending(generating ? "generating" : "idle"),
		dialog: (
			<ConfirmDeleteDialog
				target={removing ? item.name : undefined}
				onClose={() => setRemoving(false)}
				title={(name) => `Remove ${name}'s captions?`}
				description="Elements already using this file keep their captions. Getting them back means generating them again."
				actionLabel="Remove captions"
				onConfirm={() => setMediaCaptions(item.url, undefined)}
			/>
		),
	};
}

/** Captions as a submenu of their actions; while they generate, the spinner in their place. */
function CaptionsItem({
	items,
	pending,
}: {
	items: ActionMenuItem[];
	pending: ReturnType<typeof captionsPending>;
}) {
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger disabled={pending !== null}>
				{pending?.icon ?? <MagicCaptions />}
				{pending?.label ?? "Captions"}
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<ActionMenuItems items={items} />
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

/** A piece of the project's media, with what the Media panel can do with it. */
export function LibraryTile({
	item,
	referencesOf,
}: {
	item: MediaItem;
	/** The element the tile adds itself to the references of, when it takes any. */
	referencesOf?: string;
}) {
	const captions = useMediaCaptions(item);
	return (
		<>
			<MediaLibraryItem
				item={item}
				menu={
					<>
						{referencesOf && (
							<AddReferenceItem item={item} elementId={referencesOf} />
						)}
						{isKindCaptionable(item.kind) && <CaptionsItem {...captions} />}
						<UseAsItem item={item} />
					</>
				}
			>
				{item.uploaded && (
					<div className="absolute right-1 bottom-1">
						<UploadedLabel tooltip="Uploaded, not generated" />
					</div>
				)}
			</MediaLibraryItem>
			{captions.dialog}
		</>
	);
}
