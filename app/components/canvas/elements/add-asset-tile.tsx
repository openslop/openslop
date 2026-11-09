"use client";

import type { ComponentProps } from "react";
import type { IconComponent } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
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
	...props
}: Omit<ComponentProps<"button">, "onClick"> & {
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
				{...props}
			>
				<ThumbnailFace look="dashed">
					{busy ? <Spinner /> : <Icon />}
				</ThumbnailFace>
				<ThumbnailCaption>{label}</ThumbnailCaption>
			</button>
		</Thumbnail>
	);
}
