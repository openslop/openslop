import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageWithShimmer } from "@/lib/components/ImageWithShimmer";
import type { ResultKind } from "@/lib/canvas/types";

interface MediaWithSkeletonProps {
	outputKind: ResultKind;
	src: string;
	alt: string;
	videoInteractive?: boolean;
}

export function MediaWithSkeleton({
	outputKind,
	src,
	alt,
	videoInteractive = false,
}: MediaWithSkeletonProps) {
	const [videoLoaded, setVideoLoaded] = useState(false);

	if (outputKind === "image") {
		return (
			<ImageWithShimmer
				src={src}
				alt={alt}
				fill
				className="object-cover"
				unoptimized
			/>
		);
	}
	return (
		<>
			<video
				src={src}
				controls={videoInteractive}
				className={
					videoInteractive
						? "w-full h-full object-cover"
						: "w-full h-full object-cover pointer-events-none"
				}
				onLoadedData={() => setVideoLoaded(true)}
			/>
			{!videoLoaded && (
				<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
			)}
		</>
	);
}
