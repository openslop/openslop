"use client";

import { useSlateStatic } from "slate-react";
import { addElementReferences } from "@/lib/canvas/asset-ops";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { RotateCcw, User } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { THUMBNAIL_POPOVER_WIDTH } from "@/components/ui/thumbnail";
import {
	parseReferenceImages,
	serializeReferenceImages,
} from "@/lib/connectors/attributes/reference-images";
import { useCharacterAvatar } from "@/app/components/canvas/hooks/use-character-avatar";
import { useReferenceImages } from "@/app/components/canvas/hooks/use-reference-images";
import { MediaPicker } from "../media-picker";
import { AddButton } from "@/components/ui/add-button";
import { AssetTile } from "../asset-tile";
import { ReferenceTile } from "../asset-tiles";
import { NoReferenceImages } from "../reference-images";
import { TileRow } from "./tile-row";
import type { GeneratedElement } from "@/lib/canvas/types";
import type { AttributeTarget, LaidOutTarget } from "./attribute-target";
import { AttributePopoverSection, AttributeTrigger } from "./attribute-trigger";
import { useTaggedAvatars } from "./use-tagged-avatars";

const summarize = (override: string[] | undefined, projectCount: number) => {
	if (!override) return `Project (${projectCount})`;
	return override.length ? `${override.length} custom` : "None";
};

export type ReferenceImagesPopoverProps = AttributeTarget & {
	/** References the element adds beyond these, counted in the summary. */
	added?: number;
	children?: React.ReactNode;
};

const ownReferences = ({ element, attrKey }: AttributeTarget) =>
	parseReferenceImages(element.generationAttributes?.[attrKey]);

/**
 * The element's reference images as tiles, under the menu that adds more. With no
 * override they are the project's; the first add or remove copies them onto it.
 * Under them, read-only, the avatars its tagged characters add.
 */
export function ReferenceImagesEditor({
	Section,
	empty,
	...target
}: LaidOutTarget & { empty?: React.ReactNode }) {
	const { element, attrKey, label } = target;
	const editor = useSlateStatic();
	const { urls: projectImages } = useReferenceImages();
	const override = ownReferences(target);
	const urls = override ?? projectImages;
	const setOverride = (next: string[] | null) =>
		mergeAttrs(editor, element.id, {
			[attrKey]: next && serializeReferenceImages(next),
		});
	return (
		<Section
			title={label}
			action={
				<>
					{override && (
						<TooltipIconButton
							label="Reset references"
							variant="inherit"
							onClick={() => setOverride(null)}
						>
							<RotateCcw />
						</TooltipIconButton>
					)}
					<MediaPicker
						kind="image"
						onPickMany={(picked) =>
							addElementReferences(editor, element.id, attrKey, picked)
						}
					>
						<AddButton label="Add reference image" />
					</MediaPicker>
				</>
			}
		>
			{urls.length > 0 ? (
				<div className="flex flex-col gap-2">
					{!override && (
						<span className="text-label">Using project references</span>
					)}
					<TileRow columns={2}>
						{urls.map((url, index) => (
							<ReferenceTile
								key={url}
								url={url}
								index={index}
								onRemove={() => setOverride(urls.filter((_, i) => i !== index))}
							/>
						))}
					</TileRow>
				</div>
			) : (
				empty
			)}
			<TaggedReferences element={element} />
		</Section>
	);
}

/** References generation adds on its own, under the element's: read-only. */
export function AddedReferences({
	caption,
	action,
	children,
}: {
	caption: string;
	action?: React.ReactNode;
	children?: React.ReactNode;
}) {
	return (
		<section className="mt-3 border-t border-border pt-3">
			<div className="mb-2 flex items-center justify-between gap-2">
				<p className="text-label">{caption}</p>
				{action}
			</div>
			{children}
		</section>
	);
}

function TaggedAvatarTile({ name }: { name: string }) {
	const { url } = useCharacterAvatar(name);
	if (!url) return null;
	return (
		<AssetTile name={name} previewUrl={url} context="Character" Icon={User} />
	);
}

function TaggedReferences({ element }: { element: GeneratedElement }) {
	const tagged = useTaggedAvatars(element);
	if (tagged.count === 0) return null;
	return (
		<AddedReferences caption={`+${tagged.count} from tagged characters`}>
			<TileRow columns={2}>
				{tagged.names.map((name) => (
					<TaggedAvatarTile key={name} name={name} />
				))}
			</TileRow>
		</AddedReferences>
	);
}

export function ReferenceImagesPopover({
	added = 0,
	children,
	...target
}: ReferenceImagesPopoverProps) {
	const { urls: projectImages } = useReferenceImages();
	const tagged = useTaggedAvatars(target.element);
	const total = added + tagged.count;
	const summary =
		summarize(ownReferences(target), projectImages.length) +
		(total > 0 ? ` + ${total}` : "");

	return (
		<Popover>
			<AttributeTrigger tooltip={`${target.label}: ${summary}`}>
				{summary}
			</AttributeTrigger>
			<PopoverContent align="end" className={THUMBNAIL_POPOVER_WIDTH}>
				<ReferenceImagesEditor
					{...target}
					Section={AttributePopoverSection}
					empty={<NoReferenceImages />}
				/>
				{children}
			</PopoverContent>
		</Popover>
	);
}
