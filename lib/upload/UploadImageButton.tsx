"use client";

import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2 } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { useImageUpload } from "@/lib/upload/useImageUpload";

// The one "upload your own image instead of generating" affordance. What
// happens with the uploaded url is up to the caller.
export function UploadImageButton({
	onUpload,
	disabled = false,
	variant = "toolbar",
	className,
}: {
	onUpload: (url: string) => void;
	disabled?: boolean;
	/** "toolbar": labeled ghost button. "icon": compact button to float over a preview. */
	variant?: "toolbar" | "icon";
	className?: string;
}) {
	const { openPicker, uploading, inputElement } = useImageUpload({
		onUpload: ([url]) => {
			if (url) onUpload(url);
		},
	});

	if (variant === "icon") {
		return (
			<>
				{inputElement}
				<TooltipIconButton
					label="Upload your own image"
					onClick={openPicker}
					disabled={uploading || disabled}
					className={className}
				>
					{uploading ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<ImagePlus className="h-3.5 w-3.5" />
					)}
				</TooltipIconButton>
			</>
		);
	}

	return (
		<>
			{inputElement}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				tooltip="Upload your own image"
				className={className}
				disabled={uploading || disabled}
				onMouseDown={(e) => e.preventDefault()}
				onClick={openPicker}
			>
				<ImagePlus aria-hidden="true" />
				<span className="hidden sm:inline">
					{uploading ? "Uploading…" : "Upload"}
				</span>
			</Button>
		</>
	);
}
