"use client";

import { useState, type SyntheticEvent } from "react";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageWithShimmerProps extends ImageProps {
	pending?: boolean;
}

/**
 * `next/image` with a shimmer overlay that hides once the image resolves.
 * Clears on error too, so a broken/expired URL falls back to the image's
 * own error state instead of shimmering forever.
 */
export function ImageWithShimmer({
	alt,
	onLoad,
	onError,
	pending = false,
	...props
}: ImageWithShimmerProps) {
	const [settled, setSettled] = useState(false);
	return (
		<>
			<Image
				{...props}
				alt={alt}
				onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
					onLoad?.(event);
					setSettled(true);
				}}
				onError={(event: SyntheticEvent<HTMLImageElement>) => {
					onError?.(event);
					setSettled(true);
				}}
			/>
			{(pending || !settled) && <Skeleton className="absolute inset-0" />}
		</>
	);
}
