"use client";

import { getImageProps } from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ICON_SIZES } from "@/components/ui/icon-button";
import { useImageAsset } from "../hooks/use-image-asset";
import { ASSET_KIND_ICONS } from "./asset-kinds";

const IMAGE_PX = { sm: 24, xs: 18 };
const FALLBACK_ICON_PX = { sm: ICON_SIZES.header, xs: ICON_SIZES.sm };

/** A named asset's image, or its kind's icon until it has one. */
export function NamedAssetImage({
	name,
	size = "sm",
	className,
}: {
	name?: string;
	size?: keyof typeof IMAGE_PX;
	className?: string;
}) {
	const { url, kind = "character" } = useImageAsset(name);
	const Icon = ASSET_KIND_ICONS[kind];
	return (
		// Radix keeps its "loaded" status after the image unmounts, so a new url remounts it.
		<Avatar key={url} size={size} className={className}>
			{/* Radix preloads whatever `src` it gets, so hand it the optimizer's size, not the original. */}
			{url && (
				<AvatarImage
					{...getImageProps({
						src: url,
						alt: name ?? "",
						width: IMAGE_PX[size],
						height: IMAGE_PX[size],
					}).props}
					className="object-cover object-center"
				/>
			)}
			<AvatarFallback className="bg-transparent text-current">
				<Icon size={FALLBACK_ICON_PX[size]} />
			</AvatarFallback>
		</Avatar>
	);
}
