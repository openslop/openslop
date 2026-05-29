"use client";

import { useState, type SyntheticEvent } from "react";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * `next/image` with a shimmer overlay that hides once the image loads.
 */
export function ImageWithShimmer({ alt, onLoad, ...props }: ImageProps) {
	const [loaded, setLoaded] = useState(false);
	return (
		<>
			<Image
				{...props}
				alt={alt}
				onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
					onLoad?.(event);
					setLoaded(true);
				}}
			/>
			{!loaded && (
				<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
			)}
		</>
	);
}
