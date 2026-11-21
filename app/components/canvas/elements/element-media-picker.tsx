"use client";

import type { ComponentProps } from "react";
import { Plus } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { mediaOfKind } from "@/lib/project/media";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import type { UploadKind } from "@/lib/upload/upload-files";
import {
	commitUploaded,
	isUploadable,
	uploadKindOf,
} from "@/lib/upload/uploaded-result";
import { ElementActionButton } from "./element-action-button";
import { useElementGeneration } from "./element-generation-context";
import { MediaPicker, useMediaPickerUploading } from "./media-picker";

/** The element's Add button, a spinner and "Uploading…" while the picker's upload lands. */
function AddMediaPickerButton({
	kind,
	disabled,
	...props
}: Omit<ComponentProps<typeof ElementActionButton>, "icon" | "label"> & {
	kind: UploadKind;
}) {
	const uploading = useMediaPickerUploading();
	const label = uploading ? `Uploading ${kind}…` : `Add ${kind}`;
	return (
		<ElementActionButton
			icon={uploading ? <Spinner /> : <Plus />}
			label={label}
			tooltip={label}
			disabled={disabled || uploading}
			{...props}
		/>
	);
}

/** Supplies the media an element would otherwise generate, on an element that takes it. */
export function AddMediaButton() {
	const queue = useGenerationQueue();
	const store = useProjectStoreHandle();
	const { element, node, status } = useElementGeneration();
	if (!isUploadable(element)) return null;
	const kind = uploadKindOf(element);
	return (
		<MediaPicker
			kind={kind}
			onPick={(url) =>
				commitUploaded(
					queue,
					node,
					mediaOfKind(store.getState().media, url, kind),
				)
			}
		>
			<AddMediaPickerButton kind={kind} disabled={isGenerationActive(status)} />
		</MediaPicker>
	);
}
