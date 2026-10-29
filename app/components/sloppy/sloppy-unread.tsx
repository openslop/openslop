"use client";

import { useEffect, useRef } from "react";
import { useEditorPanel } from "@/app/components/canvas/panel/editor-panel-context";
import { useSloppy } from "./sloppy-provider";

/** A reply that lands while the Sloppy panel is closed marks its rail item unread. */
export function SloppyUnread() {
	const { loading } = useSloppy();
	const { notify } = useEditorPanel();
	const wasLoading = useRef(loading);

	useEffect(() => {
		if (wasLoading.current && !loading) notify("sloppy", "new reply");
		wasLoading.current = loading;
	}, [loading, notify]);

	return null;
}
