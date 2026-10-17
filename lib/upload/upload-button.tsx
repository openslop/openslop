"use client";

import { Button } from "@/components/ui/button";
import {
	ImagePlus,
	Loader2,
	Video,
	type IconComponent,
} from "@/components/ui/icon";
import type { UploadTarget } from "./pending-uploads";
import type { UploadKind } from "./upload-files";
import { useFileUpload } from "./use-file-upload";

const ICONS: Record<UploadKind, IconComponent> = {
	image: ImagePlus,
	video: Video,
};

export function UploadButton({
	kind,
	feeds,
	onUpload,
	disabled = false,
	className,
}: {
	kind: UploadKind;
	feeds: UploadTarget;
	onUpload: (url: string) => void | Promise<void>;
	disabled?: boolean;
	className?: string;
}) {
	const { openPicker, uploading, inputElement } = useFileUpload({
		kind,
		feeds,
		onUpload: async ([url]) => {
			if (url) await onUpload(url);
		},
	});
	const Icon = ICONS[kind];

	return (
		<>
			{inputElement}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				// tooltip doubles as aria-label — must change while uploading, since
				// the label text is sm:hidden.
				tooltip={uploading ? `Uploading ${kind}…` : `Upload your own ${kind}`}
				className={className}
				disabled={uploading || disabled}
				onMouseDown={(e) => e.preventDefault()}
				onClick={openPicker}
			>
				{uploading ? (
					<Loader2 className="animate-spin" aria-hidden="true" />
				) : (
					<Icon aria-hidden="true" />
				)}
				<span className="hidden sm:inline">
					{uploading ? "Uploading…" : "Upload"}
				</span>
			</Button>
		</>
	);
}
