import { Badge } from "@/components/ui/badge";
import type { IconComponent } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";

export function IconChip({
	icon: Icon,
	label,
	iconClassName,
}: {
	icon: IconComponent;
	label: string;
	iconClassName?: string;
}) {
	return (
		<SimpleTooltip label={label}>
			<Badge size="icon" className="text-foreground">
				<Icon aria-hidden="true" className={iconClassName} />
				<span className="sr-only">{label}</span>
			</Badge>
		</SimpleTooltip>
	);
}
