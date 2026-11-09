"use client";

import { useSlateStatic } from "slate-react";
import { addElementReferences } from "@/lib/canvas/asset-ops";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import { RotateCcw } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
	parseReferenceImages,
	serializeReferenceImages,
} from "@/lib/connectors/attributes/reference-images";
import { useReferenceImages } from "@/app/components/canvas/hooks/use-reference-images";
import { ReferenceImagePicker } from "../reference-images";
import type { AttributeTarget, LaidOutTarget } from "./attribute-target";
import { AttributeTrigger } from "./attribute-trigger";
import { TileRow } from "./tile-row";

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
 * The element's reference images as tiles, with the tile that adds more. With no
 * override they are the project's; the first add or remove copies them onto it.
 */
export function ReferenceImagesEditor({ columns, ...target }: LaidOutTarget) {
	const { element, attrKey } = target;
	const editor = useSlateStatic();
	const { urls: projectImages } = useReferenceImages();
	const override = ownReferences(target);
	const urls = override ?? projectImages;
	const set = (next: string[] | null) =>
		mergeAttrs(editor, element.id, {
			[attrKey]: next && serializeReferenceImages(next),
		});
	return (
		<>
			<div className="flex items-center justify-between gap-2">
				<span className="text-label text-muted-foreground">
					{override ? "Custom for this element" : "Using project references"}
				</span>
				{override && (
					<TooltipIconButton
						label="Reset to project references"
						variant="quiet"
						onClick={() => set(null)}
					>
						<RotateCcw />
					</TooltipIconButton>
				)}
			</div>
			<TileRow columns={columns}>
				<ReferenceImagePicker
					urls={urls}
					onAdd={(added) =>
						addElementReferences(editor, element.id, attrKey, added)
					}
					onRemove={(index) => set(urls.filter((_, i) => i !== index))}
				/>
			</TileRow>
		</>
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
			<PopoverContent align="end" className="flex w-72 flex-col gap-2">
				<ReferenceImagesEditor {...target} columns={2} />
				{children}
			</PopoverContent>
		</Popover>
	);
}
