"use client";

import { useSlateStatic } from "slate-react";
import { ImagePlus, Link } from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { updateElementAttrs } from "@/app/components/canvas/utils/nodeOps";
import type { CanvasContentElement } from "@/lib/canvas/types";
import {
	parseStartFrame,
	PREVIOUS_SCENE,
} from "@/lib/connectors/video/startFrame";
import { useImageUpload } from "@/lib/upload/useImageUpload";

const UPLOAD = "upload";

/** The picture a clip opens on: the end of the visual before it, or one of the user's own. */
export function StartFrameToggle({
	element,
	attrKey,
	label,
}: {
	element: CanvasContentElement;
	attrKey: string;
	label: string;
}) {
	const editor = useSlateStatic();
	const frame = parseStartFrame(element.generationAttributes?.[attrKey]);
	const setFrame = (next: string) =>
		updateElementAttrs(editor, element, { [attrKey]: next });
	const { openPicker, uploading, inputElement } = useImageUpload({
		onUpload: ([url]) => url && setFrame(url),
	});

	return (
		<>
			<MediaToggle
				value={frame?.kind === "url" ? UPLOAD : PREVIOUS_SCENE}
				onChange={(next) =>
					next === UPLOAD ? openPicker() : setFrame(PREVIOUS_SCENE)
				}
				ariaLabel={label}
				options={[
					{ value: PREVIOUS_SCENE, icon: Link, label: "Previous scene" },
					{
						value: UPLOAD,
						icon: ImagePlus,
						label: uploading ? "Uploading…" : "Upload your own",
						disabled: uploading,
					},
				]}
			/>
			{inputElement}
		</>
	);
}
