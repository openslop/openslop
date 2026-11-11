"use client";

import { useRef } from "react";

/** Where focus belongs once a dialog opened from the focused element closes: a menu item's menu button, else the element itself. */
function returnTarget(): HTMLElement | null {
	const active = document.activeElement;
	const menu = active?.closest("[role=menu][aria-labelledby]");
	const button = menu?.getAttribute("aria-labelledby");
	if (button) return document.getElementById(button);
	return active instanceof HTMLElement && active !== document.body
		? active
		: null;
}

type AutoFocusHandlers = {
	onOpenAutoFocus?: (event: Event) => void;
	onCloseAutoFocus?: (event: Event) => void;
};

/** For keyboard and screen-reader users: a closing dialog hands focus back to what opened it, since Radix sends it to the body without a trigger. A caller's handler can prevent it. */
export function useReturnFocus({
	onOpenAutoFocus,
	onCloseAutoFocus,
}: AutoFocusHandlers): Required<AutoFocusHandlers> {
	const opener = useRef<HTMLElement | null>(null);
	return {
		onOpenAutoFocus: (event) => {
			opener.current = returnTarget();
			onOpenAutoFocus?.(event);
		},
		onCloseAutoFocus: (event) => {
			onCloseAutoFocus?.(event);
			if (event.defaultPrevented || !opener.current?.isConnected) return;
			event.preventDefault();
			opener.current.focus();
		},
	};
}
