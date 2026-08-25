"use client";

import { Badge } from "@/components/ui/badge";
import { Pin } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useElementGeneration } from "../ElementGenerationContext";

export function UploadedBadge() {
	const { pinned, hasResult } = useElementGeneration();
	if (!pinned || !hasResult) return null;
	return (
		<SimpleTooltip label="Uploaded, so it is never regenerated">
			<Badge
				variant="outline"
				className="border-transparent bg-on-media/70 text-on-media-foreground shadow-elevation-1"
			>
				<Pin className="h-3 w-3" />
				Uploaded
			</Badge>
		</SimpleTooltip>
	);
}
