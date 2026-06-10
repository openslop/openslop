"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { stringifyError } from "@/lib/errors";

export function GlobalErrorToaster() {
	useEffect(() => {
		const onRejection = (e: PromiseRejectionEvent) => {
			toast.error(stringifyError(e.reason));
		};
		const onError = (e: ErrorEvent) => {
			toast.error(stringifyError(e.error ?? e.message));
		};
		window.addEventListener("unhandledrejection", onRejection);
		window.addEventListener("error", onError);
		return () => {
			window.removeEventListener("unhandledrejection", onRejection);
			window.removeEventListener("error", onError);
		};
	}, []);

	return null;
}
