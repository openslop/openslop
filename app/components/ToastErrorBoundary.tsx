"use client";

import { useEffect } from "react";
import { catchError, type ErrorInfo } from "next/error";
import { toastError } from "@/lib/toastError";
import { Button } from "@/components/ui/button";

function ToastErrorFallback(
	{ label }: { label?: string },
	{ error, retry }: ErrorInfo,
) {
	useEffect(() => {
		toastError(error, label);
	}, [error, label]);

	return (
		<div
			role="alert"
			className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center"
		>
			<p className="text-body text-muted-foreground">
				{label ? `${label} failed to render.` : "Something went wrong."}
			</p>
			<Button size="sm" onClick={retry}>
				Try again
			</Button>
		</div>
	);
}

/**
 * Catches render errors in its subtree, toasts them, and shows a fallback with
 * a retry button. Built on Next's `catchError` so the error clears on navigation.
 */
export const ToastErrorBoundary = catchError(ToastErrorFallback);
