"use client";

import { useState } from "react";

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

/** For a dialog with no trigger: notes what opened it as it opens, and hands focus back there as it closes. */
export function useReturnFocus(open: boolean) {
	const [opened, setOpened] = useState({
		open,
		from: null as HTMLElement | null,
	});
	// The render that opens it is the last moment the opener is still focused.
	if (open !== opened.open)
		setOpened({ open, from: open ? returnTarget() : opened.from });
	return (event: Event) => {
		if (!opened.from?.isConnected) return;
		event.preventDefault();
		opened.from.focus();
	};
}
