"use client";

import { useEffect } from "react";
import { toastError } from "@/lib/toastError";

export function GlobalErrorToaster() {
	useEffect(() => {
		const onRejection = (e: PromiseRejectionEvent) => {
			toastError(e.reason);
		};
		const onError = (e: ErrorEvent) => {
			toastError(e.error ?? e.message);
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
