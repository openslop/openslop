"use client";

import { Badge } from "@/components/ui/badge";
import { Pin } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useElementGeneration } from "../element-generation-context";

export function UploadedBadge() {
	const { pinned, hasResult } = useElementGeneration();
	if (!pinned || !hasResult) return null;
	return (
		<SimpleTooltip label="Uploaded, so it is never regenerated">
			<Badge variant="onMedia">
				<Pin className="h-3 w-3" />
				Uploaded
			</Badge>
		</SimpleTooltip>
	);
}
