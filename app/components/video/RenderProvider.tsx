"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { toast } from "sonner";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { ExportDoneToast, ExportProgressToast } from "./ExportToast";
import { useRendering } from "./useRendering";

type RenderContextValue = ReturnType<typeof useRendering> & {
	open: boolean;
	setOpen: (open: boolean) => void;
};

const [RenderContext, useRender] =
	createRequiredContext<RenderContextValue>("RenderContext");
export { useRender };

const TOAST_ID = "export";
const TOAST_OPTIONS = {
	id: TOAST_ID,
	duration: Number.POSITIVE_INFINITY,
	position: "bottom-right" as const,
};

export function RenderProvider({ children }: { children: ReactNode }) {
	const { state, render, reset } = useRendering();
	const [open, setOpenState] = useState(false);

	// The toasts open the popover from inside sonner's list. Sonner returns focus
	// to whatever had it before the toast as soon as focus leaves the list, and
	// Radix reads that restored focus as a focus-outside and dismisses the popover
	// it just opened. Dropping focus first lets the restore run while nothing is
	// listening.
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
		if (state.status === "invoking" || state.status === "rendering") {
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

	const value = useMemo(
		() => ({ state, render, reset, open, setOpen }),
		[state, render, reset, open, setOpen],
	);
	return <RenderContext value={value}>{children}</RenderContext>;
}
