"use client";

import { useState, type SyntheticEvent } from "react";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * `next/image` with a shimmer overlay that hides once the image loads.
 *
 * When `unoptimized` is set, we skip `next/image` entirely and render a plain
 * `<img>`: `next/image` calls `img.decode()` on every load to avoid flicker,
 * which can throw a (harmless, already-swallowed) `EncodingError` in some
 * browsers for `fill`-positioned images — `unoptimized` means we're not using
 * Next's image pipeline anyway, so there's nothing to gain from routing
 * through it.
 */
export function ImageWithShimmer({
	alt,
	onLoad,
	unoptimized,
	fill,
	className,
	src,
	...props
}: ImageProps) {
	const [loaded, setLoaded] = useState(false);

	if (unoptimized) {
		return (
			<>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={typeof src === "string" ? src : undefined}
					alt={alt}
					className={cn(fill && "absolute inset-0 h-full w-full", className)}
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

	return (
		<>
			<Image
				{...props}
				src={src}
				fill={fill}
				className={className}
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
