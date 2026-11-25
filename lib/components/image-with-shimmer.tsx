"use client";

import { useState, type SyntheticEvent } from "react";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * `next/image` with a shimmer overlay that hides once the image resolves.
 * Clears on error too, so a broken/expired URL falls back to the image's
 * own error state instead of shimmering forever.
 */
export function ImageWithShimmer({
	src,
	alt,
	onLoad,
	onError,
	pending = false,
	...props
}: ImageProps & { pending?: boolean }) {
	const [settledSrc, setSettledSrc] = useState<ImageProps["src"]>();
	const loading = pending || settledSrc !== src;
	return (
		<>
			<Image
				{...props}
				src={src}
				alt={alt}
				onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
					onLoad?.(event);
					setSettledSrc(src);
				}}
				onError={(event: SyntheticEvent<HTMLImageElement>) => {
					onError?.(event);
					setSettledSrc(src);
				}}
			/>
			{loading && <Skeleton className="absolute inset-0" />}
		</>
	);
}
