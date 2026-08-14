import * as React from "react";
import { Copy } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { IconButton, TooltipIconButton } from "@/components/ui/icon-button";

export function DuplicateButton({
	className,
	...props
}: React.ComponentProps<typeof IconButton>) {
	return (
		<TooltipIconButton
			label="Duplicate"
			className={cn("bg-muted text-muted-foreground", className)}
			{...props}
		>
			<Copy className="h-4 w-4" />
		</TooltipIconButton>
	);
}
