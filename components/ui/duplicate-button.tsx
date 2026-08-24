import * as React from "react";
import { Copy } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
	IconButton,
	LOOKS,
	TooltipIconButton,
} from "@/components/ui/icon-button";

export function DuplicateButton({
	className,
	size = "default",
	...props
}: React.ComponentProps<typeof IconButton> & {
	size?: keyof typeof LOOKS;
}) {
	const { icon, chip } = LOOKS[size];

	return (
		<TooltipIconButton
			label="Duplicate"
			size={size}
			className={cn(
				chip,
				"text-muted-foreground hover:text-foreground",
				className,
			)}
			{...props}
		>
			<Copy size={icon} />
		</TooltipIconButton>
	);
}
