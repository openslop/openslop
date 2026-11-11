import type { ComponentProps } from "react";
import { Plus } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";

/** A heading's add action, in the color of the title beside it; also a menu's or popover's trigger. */
export function AddButton(
	props: Omit<ComponentProps<typeof TooltipIconButton>, "children">,
) {
	return (
		<TooltipIconButton variant="inherit" {...props}>
			<Plus />
		</TooltipIconButton>
	);
}
