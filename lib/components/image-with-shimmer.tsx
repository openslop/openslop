"use client";

import { useCallback, useState, type SyntheticEvent } from "react";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * `next/image` with a shimmer overlay that hides once the image resolves.
 * Clears on error too, so a broken/expired URL falls back to the image's
 * own error state instead of shimmering forever.
 */
export function ImageWithShimmer({
	alt,
	onLoad,
	onError,
	...props
}: ImageProps) {
	const [settled, setSettled] = useState(false);
	const settleIfLoaded = useCallback((img: HTMLImageElement | null) => {
		if (img?.complete) setSettled(true);
	}, []);
	return (
		<>
			<Image
				{...props}
				ref={settleIfLoaded}
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
			{!settled && <Skeleton className="absolute inset-0" />}
		</>
	);
}
