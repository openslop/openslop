import * as React from "react";
import { Copy } from "@/components/ui/icon";
import { IconButton, TooltipIconButton } from "@/components/ui/icon-button";

export function DuplicateButton({
	...props
}: React.ComponentProps<typeof IconButton>) {
	return (
		<TooltipIconButton label="Duplicate" variant="quiet" {...props}>
			<Copy />
		</TooltipIconButton>
	);
}
