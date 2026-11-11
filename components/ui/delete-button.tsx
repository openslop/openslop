import * as React from "react";
import { Trash2 } from "@/components/ui/icon";
import { IconButton, TooltipIconButton } from "@/components/ui/icon-button";

export function DeleteButton({
	...props
}: React.ComponentProps<typeof IconButton>) {
	return (
		<TooltipIconButton label="Delete" variant="destructive" {...props}>
			<Trash2 />
		</TooltipIconButton>
	);
}
