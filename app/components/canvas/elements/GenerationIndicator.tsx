import { Hourglass, Loader2, type IconComponent } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ActiveGenerationStatus } from "@/lib/generation/snapshots";

type Size = "sm" | "md";

const STATUS: Record<
	ActiveGenerationStatus,
	{ icon: IconComponent; animation: string; label: (seconds: number) => string }
> = {
	queued: {
		icon: Hourglass,
		animation: "animate-pulse",
		label: () => "Queued…",
	},
	generating: {
		icon: Loader2,
		animation: "animate-spin",
		label: (seconds) => `Generating ${seconds}s`,
	},
};

const SIZE_CLASSES: Record<Size, { wrapper: string; icon: string }> = {
	sm: { wrapper: "h-4 w-4 bg-on-media/55", icon: "h-2.5 w-2.5" },
	md: {
		wrapper:
			"h-7 w-7 bg-on-media/55 hover:bg-on-media/70 grain ring-1 ring-inset ring-border",
		icon: "h-3 w-3",
	},
};

export function GenerationIndicator({
	status,
	seconds = 0,
	size = "md",
	className = "",
}: {
	status: ActiveGenerationStatus;
	seconds?: number;
	size?: Size;
	className?: string;
}) {
	const { icon: Icon, animation, label: labelFor } = STATUS[status];
	const sizes = SIZE_CLASSES[size];
	const label = labelFor(seconds);

	return (
		<SimpleTooltip label={label}>
			<button
				type="button"
				aria-label={label}
				className={cn(
					"relative flex items-center justify-center rounded-full overflow-hidden text-foreground",
					sizes.wrapper,
					className,
					"transition-[opacity,background-color] disabled:cursor-not-allowed",
				)}
				disabled
			>
				<Icon className={cn(sizes.icon, "text-foreground", animation)} />
			</button>
		</SimpleTooltip>
	);
}
