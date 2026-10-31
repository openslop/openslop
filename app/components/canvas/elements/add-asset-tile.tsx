"use client";

import { Loader2, type IconComponent } from "@/components/ui/icon";
import {
	Thumbnail,
	ThumbnailCaption,
	ThumbnailFace,
} from "@/components/ui/thumbnail";

/** Dashed "add" tile matching {@link AssetTile}'s footprint within the assets grid. */
export function AddAssetTile({
	label,
	ariaLabel,
	Icon,
	onClick,
	disabled,
	busy,
}: {
	label: string;
	ariaLabel: string;
	Icon: IconComponent;
	onClick: () => void;
	disabled?: boolean;
	/** Swaps the icon for a spinner. */
	busy?: boolean;
}) {
	return (
		<Thumbnail asChild>
			<button
				type="button"
				onClick={onClick}
				aria-label={ariaLabel}
				title={ariaLabel}
				disabled={disabled}
				className="focus-ring"
			>
				<ThumbnailFace look="dashed">
					{busy ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Icon className="h-4 w-4" />
					)}
				</ThumbnailFace>
				<ThumbnailCaption>{label}</ThumbnailCaption>
			</button>
		</Thumbnail>
	);
}
