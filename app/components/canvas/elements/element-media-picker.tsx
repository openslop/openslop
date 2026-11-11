"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "@/components/ui/icon";
import { keepFocus } from "@/components/ui/keep-focus";
import { Spinner } from "@/components/ui/spinner";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import type { UploadKind } from "@/lib/upload/upload-files";
import { commitUploaded } from "@/lib/upload/uploaded-result";
import { cn } from "@/lib/utils";
import { useElementGeneration } from "./element-generation-context";
import { MediaPicker, useMediaPickerUploading } from "./media-picker";

/** The element's Add button, a spinner and "Uploading…" while the picker's upload lands. */
function AddMediaButton({
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

/** Supplies the media an element would otherwise generate. */
function ElementMediaPicker({
	kind,
	className,
}: {
	kind: UploadKind;
	className?: string;
}) {
	const queue = useGenerationQueue();
	const { node, status } = useElementGeneration();
	return (
		<MediaPicker
			kind={kind}
			onPick={(url) => commitUploaded(queue, node, kind, url)}
		>
			<AddMediaButton
				kind={kind}
				disabled={isGenerationActive(status)}
				className={className}
			/>
		</MediaPicker>
	);
}

export const AddImageButton = ({ className }: { className?: string }) => (
	<ElementMediaPicker kind="image" className={className} />
);

export const AddVideoButton = ({ className }: { className?: string }) => (
	<ElementMediaPicker kind="video" className={className} />
);

export const AddAudioButton = ({ className }: { className?: string }) => (
	<ElementMediaPicker kind="audio" className={className} />
);
