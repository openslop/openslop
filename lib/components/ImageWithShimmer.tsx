"use client";

import { useCallback, useState, type SyntheticEvent } from "react";
import omit from "lodash/omit";
import Image, { type ImageProps } from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Props next/image understands but a plain <img> doesn't — stripped before
// spreading onto <img> in the unoptimized path below.
const NEXT_ONLY_IMAGE_PROPS = [
	"loader",
	"quality",
	"preload",
	"priority",
	"placeholder",
	"blurDataURL",
	"overrideSrc",
	"onLoadingComplete",
	"layout",
	"objectFit",
	"objectPosition",
	"lazyBoundary",
	"lazyRoot",
] as const;

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
	const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
		onLoad?.(event);
		setLoaded(true);
	};
	// next/image's own <img> does the same complete-on-mount check — a cached
	// image's `load` event may never fire, which would otherwise leave the
	// shimmer stuck on top forever. useCallback keeps the ref identity stable
	// so React doesn't detach/reattach it on every render.
	const checkAlreadyLoaded = useCallback((img: HTMLImageElement | null) => {
		if (img?.complete) setLoaded(true);
	}, []);

	if (unoptimized) {
		return (
			<>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					{...omit(props, NEXT_ONLY_IMAGE_PROPS)}
					src={typeof src === "string" ? src : undefined}
					alt={alt}
					className={cn(fill && "absolute inset-0 h-full w-full", className)}
					ref={checkAlreadyLoaded}
					onLoad={handleLoad}
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
				onLoad={handleLoad}
			/>
			{!loaded && (
				<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
			)}
		</>
	);
}
