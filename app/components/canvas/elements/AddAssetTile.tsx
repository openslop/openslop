"use client";

import { Loader2, type LucideIcon } from "@/components/ui/icon";

/** Dashed "add" tile matching {@link AssetTile}'s footprint within the assets grid. */
export function AddAssetTile({
	label,
	ariaLabel,
	Icon,
	onClick,
	disabled,
	busy,
}: {
	label: string;
	ariaLabel: string;
	Icon: LucideIcon;
	onClick: () => void;
	disabled?: boolean;
	/** Swaps the icon for a spinner. */
	busy?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={ariaLabel}
			title={ariaLabel}
			disabled={disabled}
			className="flex w-16 flex-col gap-1 sm:w-20"
		>
			<div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground">
				{busy ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Icon className="h-4 w-4" />
				)}
			</div>
			<span className="truncate text-badge text-muted-foreground">{label}</span>
		</button>
	);
}
