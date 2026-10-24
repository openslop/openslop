import type { ComponentProps } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { keepFocus } from "@/components/ui/keep-focus";

export function HeaderIconButton(props: ComponentProps<typeof IconButton>) {
	return (
		<IconButton
			size="header"
			variant="quiet"
			onMouseDown={keepFocus}
			{...props}
		/>
	);
}
