import { Badge } from "@/components/ui/badge";
import type { IconComponent } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";

/**
 * An icon standing in for its label, which appears on hover. Dense rows carry
 * several of these, so the mark does the reading and the words stay available
 * to anyone who needs them.
 */
export function IconChip({
	icon: Icon,
	label,
	iconClassName,
}: {
	icon: IconComponent;
	label: string;
	/** Marks that read heavy at the default size can take a smaller one. */
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
