"use client";

import { useEffect } from "react";
import { toastError } from "@/lib/toastError";

export function GlobalErrorToaster() {
	useEffect(() => {
		const onRejection = (event: PromiseRejectionEvent) =>
			toastError(event.reason);
		const onError = (event: ErrorEvent) =>
			toastError(event.error ?? event.message);
		window.addEventListener("unhandledrejection", onRejection);
		window.addEventListener("error", onError);
		return () => {
			window.removeEventListener("unhandledrejection", onRejection);
			window.removeEventListener("error", onError);
		};
	}, []);

	return null;
}
