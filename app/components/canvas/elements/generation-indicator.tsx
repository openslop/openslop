import { Hourglass, Loader2, type IconComponent } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ActiveGenerationStatus } from "@/lib/generation/snapshots";
import { useElapsedSeconds } from "@/lib/components/use-elapsed-seconds";

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

const SIZE_CLASSES: Record<
	Size,
	{ wrapper: string; icon: string; label: string }
> = {
	sm: {
		wrapper: "h-4 w-4 bg-on-media/55",
		icon: "h-2.5 w-2.5",
		label: "hidden",
	},
	md: {
		wrapper:
			"h-7 w-7 bg-on-media/70 hover:bg-on-media/80 grain ring-1 ring-inset ring-border md:w-auto md:gap-1.5 md:px-2.5",
		icon: "h-3 w-3",
		label: "hidden md:inline",
	},
};

export function GenerationIndicator({
	status,
	startedAt,
	queuedReason,
	size = "md",
	className,
}: {
	status: ActiveGenerationStatus;
	startedAt: number | null;
	/** What a queued element waits on, for its tooltip; the visible label stays short. */
	queuedReason?: string | null;
	size?: Size;
	className?: string;
}) {
	const { icon: Icon, animation, label: labelFor } = STATUS[status];
	const sizes = SIZE_CLASSES[size];
	const seconds = useElapsedSeconds(startedAt);
	const label = labelFor(seconds);
	const description = queuedReason ?? label;

	return (
		<SimpleTooltip label={description}>
			<span
				role="status"
				aria-label={description}
				className={cn(
					"relative flex items-center justify-center rounded-full overflow-hidden text-on-media-foreground transition-[opacity,background-color]",
					sizes.wrapper,
					className,
				)}
			>
				<Icon className={cn("shrink-0", sizes.icon, animation)} />
				<span
					aria-hidden
					className={cn("shimmer text-label-xs whitespace-nowrap", sizes.label)}
				>
					{label}
				</span>
			</span>
		</SimpleTooltip>
	);
}
