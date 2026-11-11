"use client";

import { useSlateStatic } from "slate-react";
import { addElementReferences } from "@/lib/canvas/asset-ops";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { RotateCcw } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { THUMBNAIL_POPOVER_WIDTH } from "@/components/ui/thumbnail";
import {
	parseReferenceImages,
	serializeReferenceImages,
} from "@/lib/connectors/attributes/reference-images";
import { useReferenceImages } from "@/app/components/canvas/hooks/use-reference-images";
import { MediaPicker } from "../media-picker";
import { AddButton } from "@/components/ui/add-button";
import { ReferenceTile } from "../asset-tiles";
import { NoReferenceImages } from "../reference-images";
import { TileRow } from "./tile-row";
import type { AttributeTarget, LaidOutTarget } from "./attribute-target";
import { AttributePopoverSection, AttributeTrigger } from "./attribute-trigger";

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
	const set = (next: string[] | null) =>
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
							onClick={() => set(null)}
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
								onRemove={() => set(urls.filter((_, i) => i !== index))}
							/>
						))}
					</TileRow>
				</div>
			) : (
				empty
			)}
		</Section>
	);
}

export function ReferenceImagesPopover({
	added = 0,
	children,
	...target
}: ReferenceImagesPopoverProps) {
	const { urls: projectImages } = useReferenceImages();
	const summary =
		summarize(ownReferences(target), projectImages.length) +
		(added > 0 ? ` + ${added}` : "");

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
