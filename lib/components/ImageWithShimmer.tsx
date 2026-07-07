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
	loader,
	quality,
	preload,
	priority,
	placeholder,
	blurDataURL,
	overrideSrc,
	onLoadingComplete,
	layout,
	objectFit,
	objectPosition,
	lazyBoundary,
	lazyRoot,
	...props
}: ImageProps) {
	const [loaded, setLoaded] = useState(false);
	const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
		onLoad?.(event);
		setLoaded(true);
	};

	if (unoptimized) {
		return (
			<>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					{...props}
					src={typeof src === "string" ? src : undefined}
					alt={alt}
					className={cn(fill && "absolute inset-0 h-full w-full", className)}
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
				loader={loader}
				quality={quality}
				preload={preload}
				priority={priority}
				placeholder={placeholder}
				blurDataURL={blurDataURL}
				overrideSrc={overrideSrc}
				onLoadingComplete={onLoadingComplete}
				layout={layout}
				objectFit={objectFit}
				objectPosition={objectPosition}
				lazyBoundary={lazyBoundary}
				lazyRoot={lazyRoot}
				onLoad={handleLoad}
			/>
			{!loaded && (
				<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
			)}
		</>
	);
}
