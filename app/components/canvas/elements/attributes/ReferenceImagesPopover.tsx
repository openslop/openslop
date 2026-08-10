"use client";

import { useSlateStatic } from "slate-react";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import type { CanvasContentElement } from "@/lib/canvas/types";
import {
	parseReferenceImages,
	serializeReferenceImages,
} from "@/lib/connectors/attributes/referenceImages";
import { useProject } from "@/lib/project/useProject";
import { ReferenceImagePicker } from "../ReferenceImages";
import { AttributeTrigger } from "./AttributeTrigger";

const summarize = (override: string[] | undefined, projectCount: number) => {
	if (!override) return `Project (${projectCount})`;
	return override.length ? `${override.length} custom` : "None";
};

interface ReferenceImagesPopoverProps {
	element: CanvasContentElement;
	attrKey: string;
	label: string;
	hideLabel?: boolean;
}

/**
 * This element's reference images. With no override it shows the project's and
 * says so; the first add or remove copies them onto the element, from where they
 * stop tracking the project until reset.
 */
export function ReferenceImagesPopover({
	element,
	attrKey,
	label,
	hideLabel = false,
}: ReferenceImagesPopoverProps) {
	const editor = useSlateStatic();
	const projectImages = useProject((s) => s.referenceImages);
	const override = parseReferenceImages(element.customAttributes?.[attrKey]);
	const urls = override ?? projectImages;

	const setOverride = (next: string[]) =>
		updateElementAttrs(editor, element, {
			[attrKey]: serializeReferenceImages(next),
		});

	const summary = summarize(override, projectImages.length);
	const tooltip = `${label}: ${summary}`;

	return (
		<Popover>
			<AttributeTrigger tooltip={tooltip}>
				{!hideLabel && <span className="opacity-70 mr-1">{label}</span>}
				{summary}
			</AttributeTrigger>
			<PopoverContent align="start" className="w-72">
				<div className="mb-2 flex items-baseline justify-between gap-2">
					<span className="text-label text-muted-foreground">
						{override ? "Custom for this element" : "Using project references"}
					</span>
					{override && (
						<Button
							variant="link"
							size="sm"
							className="h-auto p-0"
							tooltip="Use the project's reference images"
							onClick={() =>
								updateElementAttrs(editor, element, { [attrKey]: null })
							}
						>
							Reset
						</Button>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					<ReferenceImagePicker
						urls={urls}
						onAdd={(added) => setOverride([...urls, ...added])}
						onRemove={(index) =>
							setOverride(urls.filter((_, i) => i !== index))
						}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
