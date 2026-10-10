import uniqBy from "lodash/uniqBy";
import { groupFor } from "@/lib/connectors/model-groups";
import type { ConnectorType } from "@/lib/connectors/types";
import { cn } from "@/lib/utils";
import { IconChip } from "./icon-chip";

export function ModalityPills({
	modalities,
	className,
}: {
	modalities: ConnectorType[];
	className?: string;
}) {
	return (
		<div className={cn("flex flex-wrap items-center gap-1", className)}>
			{uniqBy(modalities.map(groupFor), "key").map(({ key, label, Icon }) => (
				<IconChip key={key} icon={Icon} label={label} iconClassName="size-3" />
			))}
		</div>
	);
}
