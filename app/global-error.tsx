"use client";

import { useEffect } from "react";
import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import "./globals.css";

/**
 * Root-level recovery for errors thrown by the root layout itself. Replaces
 * the root layout while active, so it owns `<html>`/`<body>` and imports
 * global styles explicitly. Offers `retry()` (re-fetch + re-render) and a
 * full reload as the last-resort recovery.
 */
export default function GlobalError({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body>
				<main
					role="alert"
					className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
				>
					<h1 className="font-title text-heading text-foreground text-balance">
						OpenSlop hit a snag
					</h1>
					<p className="text-body text-muted-foreground text-balance">
						{errorMessage(error)}
					</p>
					<div className="flex gap-2">
						<Button onClick={retry}>Try again</Button>
						<Button variant="outline" onClick={() => window.location.reload()}>
							Reload page
						</Button>
					</div>
				</main>
			</body>
		</html>
	);
}
