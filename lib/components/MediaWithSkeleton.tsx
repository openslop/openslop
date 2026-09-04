"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithShimmer } from "./ImageWithShimmer";
import type { ResultKind } from "@/lib/canvas/types";

interface MediaWithSkeletonProps {
	outputKind: ResultKind;
	src: string;
	alt: string;
	videoInteractive?: boolean;
	objectFit?: "cover" | "contain";
	/** CSS width the media renders at, so an image is fetched at that size and not at the generator's full 2560px output. */
	sizes: string;
}

export function MediaWithSkeleton({
	outputKind,
	src,
	alt,
	videoInteractive = false,
	objectFit = "cover",
	sizes,
}: MediaWithSkeletonProps) {
	const [videoLoaded, setVideoLoaded] = useState(false);
	const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";

	if (outputKind === "image") {
		return (
			<ImageWithShimmer
				src={src}
				alt={alt}
				fill
				sizes={sizes}
				className={fitClass}
			/>
		);
	}
	return (
		<>
			<video
				src={src}
				controls={videoInteractive}
				className={`w-full h-full ${fitClass} ${videoInteractive ? "" : "pointer-events-none"}`}
				onLoadedData={() => setVideoLoaded(true)}
			/>
			{!videoLoaded && (
				<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
			)}
		</>
	);
}
