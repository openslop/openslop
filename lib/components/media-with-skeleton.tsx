"use client";

import { useCallback, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithShimmer } from "./image-with-shimmer";
import type { ResultKind } from "@/lib/canvas/types";

const HAVE_METADATA = 1;

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
	const [videoSettled, setVideoSettled] = useState(false);
	const settleIfLoaded = useCallback((video: HTMLVideoElement | null) => {
		if (video && video.readyState >= HAVE_METADATA) {
			setVideoSettled(true);
		}
	}, []);
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
				ref={settleIfLoaded}
				src={src}
				controls={videoInteractive}
				className={`w-full h-full ${fitClass} ${videoInteractive ? "" : "pointer-events-none"}`}
				onLoadedMetadata={() => setVideoSettled(true)}
				onError={() => setVideoSettled(true)}
			/>
			{!videoSettled && <Skeleton className="absolute inset-0" />}
		</>
	);
}
