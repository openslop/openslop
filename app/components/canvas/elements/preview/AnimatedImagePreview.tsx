"use client";

import { useState } from "react";
import { Image as ImageIcon, Video } from "@/components/ui/icon";
import { MediaToggle } from "@/components/ui/media-toggle";
import { MediaPreview, MediaPlaceholder } from "./results";
import type { PlaceholderProps } from "./status";

type AnimatedImagePreviewProps = PlaceholderProps & {
	imageUrl?: string;
	videoUrl?: string;
};

export function AnimatedImagePreview({
	imageUrl,
	videoUrl,
	status,
	seconds,
	error,
	onDiscard,
}: AnimatedImagePreviewProps) {
	const [mode, setMode] = useState<"animated" | "still">("animated");
	const url = mode === "animated" ? videoUrl : imageUrl;

	return (
		<div className="relative w-full">
			{url ? (
				<MediaPreview
					key={url}
					url={url}
					outputKind={mode === "animated" ? "video" : "image"}
					status={status}
					seconds={seconds}
				/>
			) : (
				<MediaPlaceholder
					status={status}
					seconds={seconds}
					error={error}
					onDiscard={onDiscard}
				/>
			)}
			<MediaToggle
				className="absolute top-2 right-2 z-10 shadow-sm"
				value={mode}
				onChange={setMode}
				options={[
					{ value: "animated", label: "Video", icon: Video },
					{ value: "still", label: "Still", icon: ImageIcon },
				]}
			/>
		</div>
	);
}
