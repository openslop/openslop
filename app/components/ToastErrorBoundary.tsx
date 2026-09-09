"use client";

import { useEffect } from "react";
import { catchError, type ErrorInfo } from "next/error";
import { toastError } from "@/lib/toastError";

export type ToastErrorBoundaryProps = { label?: string };

/**
 * Recoverable fallback rendered when `ToastErrorBoundary` catches a render
 * error. Toasts the error once (on mount) and offers a retry affordance; the
 * boundary itself clears the error on client navigation via `catchError`.
 */
export function ToastErrorFallback(
	{ label }: ToastErrorBoundaryProps,
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
			<p className="text-sm text-muted-foreground">
				{label ? `${label} failed to render.` : "Something went wrong."}
			</p>
			<button
				type="button"
				onClick={retry}
				className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-primary-foreground transition-[filter] hover:brightness-110 active:brightness-95"
			>
				Try again
			</button>
		</div>
	);
}

/**
 * Catches render errors in its subtree, surfaces them via a sonner toast, and
 * shows a recoverable fallback with a retry affordance instead of the broken
 * subtree. Built on Next.js `catchError`, so the error state clears on client
 * navigation and `retry()` re-fetches and re-renders the children — a single
 * render error can never permanently blank the app. Use around self-contained
 * widgets (e.g. the Remotion player) or at the root as a safety net beneath
 * `app/error.tsx`.
 */
export const ToastErrorBoundary = catchError(ToastErrorFallback);
