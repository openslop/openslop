import {
	Hourglass,
	Loader2,
	Wand2,
	type IconComponent,
} from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	isGenerationActive,
	type ElementSnapshot,
} from "@/lib/generation/queue";

type Status = ElementSnapshot["status"];

type Size = "sm" | "md";

const ICONS: Record<Status, IconComponent> = {
	idle: Wand2,
	queued: Hourglass,
	generating: Loader2,
};

const ICON_ANIMATION: Record<Status, string> = {
	idle: "",
	queued: "animate-pulse",
	generating: "animate-spin",
};

const SIZE_CLASSES: Record<Size, { wrapper: string; icon: string }> = {
	sm: { wrapper: "h-4 w-4 bg-on-media/55", icon: "h-2.5 w-2.5" },
	md: {
		wrapper:
			"h-7 w-7 bg-on-media/55 hover:bg-on-media/70 grain ring-1 ring-inset ring-border",
		icon: "h-3 w-3",
	},
};

function statusLabel(status: Status, seconds: number, idleLabel: string) {
	if (status === "queued") return "Queued…";
	if (status === "generating") return `Generating ${seconds}s`;
	return idleLabel;
}

export function GenerationIndicator({
	status,
	seconds = 0,
	idleLabel = "Generate",
	size = "md",
	onClick,
	className = "",
}: {
	status: Status;
	seconds?: number;
	idleLabel?: string;
	size?: Size;
	onClick?: () => void;
	className?: string;
}) {
	const Icon = ICONS[status];
	const sizes = SIZE_CLASSES[size];
	const label = statusLabel(status, seconds, idleLabel);
	const active = isGenerationActive(status);
	const iconEl = (
		<Icon
			className={cn(sizes.icon, "text-foreground", ICON_ANIMATION[status])}
		/>
	);
	const baseWrapper = cn(
		"relative flex items-center justify-center rounded-full overflow-hidden text-foreground",
		sizes.wrapper,
		className,
	);

	return (
		<SimpleTooltip label={label}>
			<button
				type="button"
				aria-label={label}
				className={cn(
					baseWrapper,
					"transition-[opacity,background-color] disabled:cursor-not-allowed",
				)}
				disabled={active || !onClick}
				onClick={onClick}
			>
				{iconEl}
			</button>
		</SimpleTooltip>
	);
}
