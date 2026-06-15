import * as React from "react";

import { cn } from "@/lib/utils";

function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="toolbar"
			role="toolbar"
			className={cn(
				"inline-flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-elevation-5",
				className,
			)}
			{...props}
		/>
	);
}

function ToolbarButton({
	className,
	...props
}: React.ComponentProps<"button">) {
	return (
		<button
			type="button"
			data-slot="toolbar-button"
			className={cn(
				"inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring [&_svg]:size-4 [&_svg]:shrink-0",
				className,
			)}
			{...props}
		/>
	);
}

function ToolbarSeparator({ className }: { className?: string }) {
	return <div className={cn("mx-0.5 h-4 w-px bg-border", className)} />;
}

export { Toolbar, ToolbarButton, ToolbarSeparator };
