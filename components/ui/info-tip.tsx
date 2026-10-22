import { Info } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** The icon carries the text for screen readers too, since a tooltip only shows on hover. */
export function InfoTip({
	label,
	side = "right",
	className,
}: {
	label: string;
	side?: "top" | "right" | "bottom" | "left";
	className?: string;
}) {
	return (
		<SimpleTooltip label={label} side={side}>
			<span
				role="img"
				aria-label={label}
				className={cn(
					"flex shrink-0 items-center text-muted-foreground transition-colors hover:text-foreground",
					className,
				)}
			>
				<Info className="size-3.5" />
			</span>
		</SimpleTooltip>
	);
}
