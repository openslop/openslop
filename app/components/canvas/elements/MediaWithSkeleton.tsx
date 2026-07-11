import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
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
	const [loadedVideoSrc, setLoadedVideoSrc] = useState<string | null>(null);
	const videoLoaded = loadedVideoSrc === src;
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
				src={src}
				controls={videoInteractive}
				className={`w-full h-full ${fitClass} ${videoInteractive ? "" : "pointer-events-none"}`}
				onLoadedData={() => setLoadedVideoSrc(src)}
			/>
			{!videoLoaded && (
				<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
			)}
		</>
	);
}
