"use client";

import { Badge } from "@/components/ui/badge";
import { CloudUploadFilled } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useElementGeneration } from "../element-generation-context";

/** Marks media the user supplied rather than generated, saying what that means here. */
export function UploadedLabel({ tooltip }: { tooltip: string }) {
	return (
		<SimpleTooltip label={tooltip}>
			<Badge variant="muted" size="xs">
				<CloudUploadFilled />
				<span aria-hidden="true">Uploaded</span>
				<span className="sr-only">{tooltip}</span>
			</Badge>
		</SimpleTooltip>
	);
}

export function UploadedBadge() {
	const { result } = useElementGeneration();
	if (!result?.uploaded) return null;
	return <UploadedLabel tooltip="Uploaded, so Generate All skips it" />;
}
