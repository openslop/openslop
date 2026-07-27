import { useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
import { useNearViewport } from "@/lib/components/useNearViewport";
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
	const videoRef = useRef<HTMLVideoElement>(null);
	// `<video>` has no `loading="lazy"` counterpart, so an off-screen preview
	// would otherwise fetch and decode its whole clip on mount.
	const near = useNearViewport(videoRef);
	const [videoLoaded, setVideoLoaded] = useState(false);
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
				ref={videoRef}
				src={near ? src : undefined}
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
