import * as React from "react";
import { Trash2 } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
	IconButton,
	LOOKS,
	TooltipIconButton,
} from "@/components/ui/icon-button";

export function DeleteButton({
	className,
	size = "default",
	...props
}: React.ComponentProps<typeof IconButton> & {
	size?: keyof typeof LOOKS;
}) {
	const { icon, chip } = LOOKS[size];

	return (
		<TooltipIconButton
			label="Delete"
			size={size}
			className={cn(
				chip,
				"text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20",
				className,
			)}
			{...props}
		>
			<Trash2 size={icon} />
		</TooltipIconButton>
	);
}
