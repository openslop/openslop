"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { Spinner } from "@/components/ui/spinner";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import type { UploadKind } from "@/lib/upload/upload-files";
import {
	commitUploaded,
	isUploadable,
	uploadKindOf,
} from "@/lib/upload/uploaded-result";
import { cn } from "@/lib/utils";
import { useElementGeneration } from "./element-generation-context";
import { MediaPicker, useMediaPickerUploading } from "./media-picker";

/** The element's Add button, a spinner and "Uploading…" while the picker's upload lands. */
function AddMediaPickerButton({
	kind,
	disabled,
	className,
	...props
}: ComponentProps<typeof Button> & { kind: UploadKind }) {
	const uploading = useMediaPickerUploading();
	const shown = uploading ? `Uploading ${kind}…` : `Add ${kind}`;
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			tooltip={shown}
			disabled={disabled || uploading}
			onMouseDown={keepFocus}
			className={cn("shrink-0", className)}
			{...props}
		>
			{uploading ? <Spinner /> : <Plus aria-hidden="true" />}
			<span className="hidden sm:inline">{shown}</span>
		</Button>
	);
}

/** Supplies the media an element would otherwise generate, on an element that takes it. */
export function AddMediaButton() {
	const queue = useGenerationQueue();
	const { element, node, status } = useElementGeneration();
	if (!isUploadable(element)) return null;
	const kind = uploadKindOf(element);
	return (
		<MediaPicker
			kind={kind}
			onPick={(url) => commitUploaded(queue, node, kind, url)}
		>
			<AddMediaPickerButton kind={kind} disabled={isGenerationActive(status)} />
		</MediaPicker>
	);
}
