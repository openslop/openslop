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
			variant="quiet"
			className={cn(chip, className)}
			{...props}
		>
			<Copy size={icon} />
		</TooltipIconButton>
	);
}
