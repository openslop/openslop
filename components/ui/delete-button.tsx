import * as React from "react";
import { Trash2 } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { IconButton, TooltipIconButton } from "@/components/ui/icon-button";

export function DeleteButton({
	className,
	...props
}: React.ComponentProps<typeof IconButton>) {
	return (
		<TooltipIconButton
			label="Delete"
			className={cn(
				"text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20",
				className,
			)}
			{...props}
		>
			<Trash2 className="h-4 w-4" strokeWidth={1.5} />
		</TooltipIconButton>
	);
}
