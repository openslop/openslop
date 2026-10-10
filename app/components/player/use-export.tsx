"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/errors";
import { runRender, type RenderUpdate } from "@/lib/render/render-client";
import type { RenderLayout } from "@/lib/render/types";
import { ExportDoneToast, ExportProgressToast } from "./export-toast";

type ExportState =
	| { status: "idle" }
	| { status: "starting" }
	| RenderUpdate
	| { status: "error"; message: string };

const TOAST_ID = "export";
const TOAST_OPTIONS = {
	id: TOAST_ID,
	duration: Number.POSITIVE_INFINITY,
	position: "bottom-right" as const,
};

/** The export the popover shows. A toast stands in while the popover is closed. */
export function useExport() {
	const [state, setState] = useState<ExportState>({ status: "idle" });
	const [open, setOpenState] = useState(false);

	// Sonner restores focus when it leaves the toast list, and Radix treats that
	// as a focus-outside that dismisses the popover. Blur first so nothing listens.
	const setOpen = useCallback((next: boolean) => {
		if (next && document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
		setOpenState(next);
	}, []);

	useEffect(() => {
		if (open || state.status === "idle") {
			toast.dismiss(TOAST_ID);
			return;
		}
		if (state.status === "starting" || state.status === "rendering") {
			const progress = state.status === "rendering" ? state.progress : 0;
			toast.custom(
				() => (
					<ExportProgressToast
						progress={progress}
						onView={() => setOpen(true)}
					/>
				),
				TOAST_OPTIONS,
			);
			return;
		}
		if (state.status === "done") {
			const { url, size } = state;
			toast.custom(
				(id) => (
					<ExportDoneToast
						url={url}
						size={size}
						toastId={id}
						onView={() => setOpen(true)}
					/>
				),
				TOAST_OPTIONS,
			);
			return;
		}
		toast.error(state.message, {
			id: TOAST_ID,
			position: "bottom-right",
		});
	}, [state, open, setOpen]);

	useEffect(() => {
		return () => {
			toast.dismiss(TOAST_ID);
		};
	}, []);

	const exportVideo = async (layout: RenderLayout, scale?: number) => {
		setState({ status: "starting" });
		try {
			for await (const update of runRender(layout, scale)) setState(update);
		} catch (error) {
			setState({ status: "error", message: errorMessage(error) });
		}
	};

	return {
		state,
		exportVideo,
		reset: () => setState({ status: "idle" }),
		open,
		setOpen,
	};
}
