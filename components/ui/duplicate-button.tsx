import * as React from "react";
import { Copy } from "@/components/ui/icon";
import {
	ICON_SIZES,
	IconButton,
	TooltipIconButton,
} from "@/components/ui/icon-button";

export function DuplicateButton({
	size = "default",
	...props
}: React.ComponentProps<typeof IconButton>) {
	return (
		<TooltipIconButton label="Duplicate" size={size} variant="quiet" {...props}>
			<Copy size={ICON_SIZES[size]} />
		</TooltipIconButton>
	);
}
