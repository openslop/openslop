"use client";

import { Button } from "@/components/ui/button";
import { keepFocus } from "@/components/ui/keep-focus";
import {
	ImagePlus,
	Loader2,
	Music,
	Video,
	type IconComponent,
} from "@/components/ui/icon";
import type { UploadKind } from "./upload-files";
import { useFileUpload } from "./use-file-upload";

const ICONS: Record<UploadKind, IconComponent> = {
	image: ImagePlus,
	video: Video,
	audio: Music,
};

export function UploadButton({
	kind,
	onUpload,
	disabled = false,
	className,
}: {
	kind: UploadKind;
	onUpload: (url: string) => void | Promise<void>;
	disabled?: boolean;
	className?: string;
}) {
	const { openPicker, uploading, inputElement } = useFileUpload({
		kind,
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
				// Also the aria-label, so it must change while uploading: the text is sm:hidden.
				tooltip={uploading ? `Uploading ${kind}…` : `Upload your own ${kind}`}
				className={className}
				disabled={uploading || disabled}
				onMouseDown={keepFocus}
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
