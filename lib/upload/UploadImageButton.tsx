"use client";

import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "@/components/ui/icon";
import { useImageUpload } from "@/lib/upload/useImageUpload";

export function UploadImageButton({
	onUpload,
	disabled = false,
	className,
}: {
	onUpload: (url: string) => void;
	disabled?: boolean;
	className?: string;
}) {
	const { openPicker, uploading, inputElement } = useImageUpload({
		onUpload: ([url]) => {
			if (url) onUpload(url);
		},
	});

	return (
		<>
			{inputElement}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				// tooltip doubles as aria-label — must change while uploading, since
				// the label text is sm:hidden.
				tooltip={uploading ? "Uploading image…" : "Upload your own image"}
				className={className}
				disabled={uploading || disabled}
				onMouseDown={(e) => e.preventDefault()}
				onClick={openPicker}
			>
				{uploading ? (
					<Loader2 className="animate-spin" aria-hidden="true" />
				) : (
					<ImagePlus aria-hidden="true" />
				)}
				<span className="hidden sm:inline">
					{uploading ? "Uploading…" : "Upload"}
				</span>
			</Button>
		</>
	);
}
