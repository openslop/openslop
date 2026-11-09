import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toolbar as ToolbarPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const toolbarVariants = cva("group/toolbar inline-flex items-center", {
	variants: {
		variant: {
			default:
				"gap-0.5 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-elevation-5",
			/** The panel's toggle pill, over a tile's picture. */
			tile: "rounded-md bg-media-toggle-bg p-0.5",
		},
	},
	defaultVariants: { variant: "default" },
});

/** One tab stop; arrow keys move between its buttons. */
function Toolbar({
	className,
	variant = "default",
	...props
}: React.ComponentProps<typeof ToolbarPrimitive.Root> &
	VariantProps<typeof toolbarVariants>) {
	return (
		<ToolbarPrimitive.Root
			data-slot="toolbar"
			data-variant={variant}
			className={cn(toolbarVariants({ variant }), className)}
			{...props}
		/>
	);
}

// A tone outranks the tile toolbar's own color, which it restates under the same selector.
const TONES = {
	default: "",
	destructive:
		"text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 group-data-[variant=tile]/toolbar:text-destructive group-data-[variant=tile]/toolbar:hover:bg-destructive/10 group-data-[variant=tile]/toolbar:hover:text-destructive",
} as const;

function ToolbarButton({
	className,
	tone = "default",
	...props
}: React.ComponentProps<typeof ToolbarPrimitive.Button> & {
	tone?: keyof typeof TONES;
}) {
	return (
		<ToolbarPrimitive.Button
			data-slot="toolbar-button"
			className={cn(
				"inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring [&_svg]:size-4 [&_svg]:shrink-0",
				"group-data-[variant=tile]/toolbar:size-6 group-data-[variant=tile]/toolbar:rounded-sm group-data-[variant=tile]/toolbar:text-media-toggle-fg group-data-[variant=tile]/toolbar:hover:bg-media-toggle-hover-bg group-data-[variant=tile]/toolbar:hover:text-media-toggle-fg group-data-[variant=tile]/toolbar:[&_.icon]:size-3.5",
				TONES[tone],
				className,
			)}
			{...props}
		/>
	);
}

function ToolbarSeparator({ className }: { className?: string }) {
	return (
		<ToolbarPrimitive.Separator
			className={cn("mx-0.5 h-4 w-px bg-border", className)}
		/>
	);
}

export { Toolbar, ToolbarButton, ToolbarSeparator };
