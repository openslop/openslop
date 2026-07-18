"use client";

import { useState, type SyntheticEvent } from "react";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * `next/image` with a shimmer overlay that hides once the image loads.
 */
export function ImageWithShimmer({ alt, onLoad, ...props }: ImageProps) {
	const [loadedSrc, setLoadedSrc] = useState<ImageProps["src"] | null>(null);
	return (
		<>
			<Image
				{...props}
				alt={alt}
				onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
					onLoad?.(event);
					setLoadedSrc(props.src);
				}}
			/>
			{loadedSrc !== props.src && (
				<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
			)}
		</>
	);
}
