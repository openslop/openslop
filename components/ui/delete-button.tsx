import * as React from "react";
import { Trash2 } from "@/components/ui/icon";
import {
	ICON_SIZES,
	IconButton,
	TooltipIconButton,
} from "@/components/ui/icon-button";

export function DeleteButton({
	size = "default",
	...props
}: React.ComponentProps<typeof IconButton>) {
	return (
		<TooltipIconButton
			label="Delete"
			size={size}
			variant="destructive"
			{...props}
		>
			<Trash2 size={ICON_SIZES[size]} />
		</TooltipIconButton>
	);
}
