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

const ICONS: Record<UploadKind, IconComponent> = {
	image: ImagePlus,
	video: Video,
	audio: Music,
};

export function UploadButton({
	kind,
	uploading,
	onClick,
	disabled = false,
	className,
}: {
	kind: UploadKind;
	uploading: boolean;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
}) {
	const Icon = ICONS[kind];

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			// Also the aria-label, so it must change while uploading: the text is sm:hidden.
			tooltip={uploading ? `Uploading ${kind}…` : `Upload your own ${kind}`}
			className={className}
			disabled={uploading || disabled}
			onMouseDown={keepFocus}
			onClick={onClick}
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
	);
}
