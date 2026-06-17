import * as React from "react";
import { Trash2 } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

export function DeleteButton({
	ariaLabel,
	className,
	...props
}: React.ComponentProps<typeof IconButton>) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<IconButton
					ariaLabel={ariaLabel}
					className={cn("bg-muted hover:text-destructive", className)}
					{...props}
				>
					<Trash2 className="h-4 w-4" strokeWidth={1.5} />
				</IconButton>
			</TooltipTrigger>
			<TooltipContent>Delete</TooltipContent>
		</Tooltip>
	);
}
