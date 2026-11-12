"use client";

import { Badge } from "@/components/ui/badge";
import { CloudUploadFilled } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useElementGeneration } from "../element-generation-context";

/** Marks media the user supplied rather than generated, saying what that means here. */
export function UploadedLabel({ tooltip }: { tooltip: string }) {
	return (
		<SimpleTooltip label={tooltip}>
			<Badge variant="indicator" size="xs">
				<CloudUploadFilled size={12} />
				<span aria-hidden="true">Uploaded</span>
				<span className="sr-only">{tooltip}</span>
			</Badge>
		</SimpleTooltip>
	);
}

export function UploadedBadge() {
	const { uploaded } = useElementGeneration();
	if (!uploaded) return null;
	return <UploadedLabel tooltip="Uploaded, so it is never regenerated" />;
}
