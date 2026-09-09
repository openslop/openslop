"use client";

import { useEffect } from "react";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";

/**
 * Segment-level recovery for render errors thrown by `page.tsx` and nested
 * segments during client navigation. Next.js mounts a recovery-capable error
 * boundary around the segment (clearing the error on path change and wiring
 * `retry()`/`reset()`), so a render failure here is surfaced as durable UI —
 * not a permanent blank or an auto-dismissing toast.
 */
export default function Error({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	useEffect(() => {
		// Surface the error to monitoring just like the production default.
		console.error(error);
	}, [error]);

	return (
		<div
			role="alert"
			className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
		>
			<h1 className="font-title text-heading text-foreground text-balance">
				Something went wrong
			</h1>
			<p className="text-body text-muted-foreground text-balance">
				{errorMessage(error)}
			</p>
			<Button size="sm" onClick={retry}>
				Try again
			</Button>
		</div>
	);
}
