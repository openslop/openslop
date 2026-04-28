import { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResultKind } from "../types";

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
	const [loaded, setLoaded] = useState(false);

	return (
		<>
			{outputKind === "image" ? (
				<Image
					src={src}
					alt={alt}
					fill
					className="object-cover"
					unoptimized
					onLoad={() => setLoaded(true)}
				/>
			) : (
				<video
					src={src}
					controls={videoInteractive}
					className={
						videoInteractive
							? "w-full h-full object-cover"
							: "w-full h-full object-cover pointer-events-none"
					}
					onLoadedData={() => setLoaded(true)}
				/>
			)}
			{!loaded && (
				<Skeleton className="absolute inset-0 animate-none shimmer-surface" />
			)}
		</>
	);
}
