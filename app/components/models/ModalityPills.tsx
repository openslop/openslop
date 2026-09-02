import { groupFor } from "@/lib/connectors/modelGroups";
import type { ConnectorType } from "@/lib/connectors/types";
import { cn } from "@/lib/utils";
import { IconChip } from "./IconChip";

export function ModalityPills({
	modalities,
	className,
}: {
	modalities: ConnectorType[];
	className?: string;
}) {
	return (
		<div className={cn("flex flex-wrap items-center gap-1", className)}>
			{[
				...new Map(
					modalities.map((type) => [groupFor(type).key, groupFor(type)]),
				).values(),
			].map(({ key, label, Icon }) => (
				<IconChip key={key} icon={Icon} label={label} iconClassName="size-3" />
			))}
		</div>
	);
}
