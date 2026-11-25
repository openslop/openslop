"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithShimmer } from "./image-with-shimmer";
import { useMediaSettled } from "./use-media-settled";
import type { ResultKind } from "@/lib/canvas/types";

interface MediaWithSkeletonProps {
	outputKind: ResultKind;
	src: string;
	alt: string;
	videoInteractive?: boolean;
	objectFit?: "cover" | "contain";
}

export function MediaWithSkeleton({
	outputKind,
	src,
	alt,
	videoInteractive = false,
	objectFit = "cover",
}: MediaWithSkeletonProps) {
	const [video, setVideo] = useState<HTMLVideoElement | null>(null);
	const videoSettled = useMediaSettled(video);
	const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";

	if (outputKind === "image") {
		return (
			<ImageWithShimmer
				src={src}
				alt={alt}
				fill
				className={fitClass}
				unoptimized
			/>
		);
	}
	return (
		<>
			<video
				ref={setVideo}
				src={src}
				controls={videoInteractive}
				className={`w-full h-full ${fitClass} ${videoInteractive ? "" : "pointer-events-none"}`}
			/>
			{!videoSettled && <Skeleton className="absolute inset-0" />}
		</>
	);
}
