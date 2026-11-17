import { Badge } from "@/components/ui/badge";
import type { IconComponent } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function IconChip({
	icon: Icon,
	label,
	iconClassName,
	className,
}: {
	icon: IconComponent;
	label: string;
	iconClassName?: string;
	className?: string;
}) {
	return (
		<SimpleTooltip label={label}>
			<Badge size="icon" className={cn("text-foreground", className)}>
				<Icon className={iconClassName} />
				<span className="sr-only">{label}</span>
			</Badge>
		</SimpleTooltip>
	);
}
