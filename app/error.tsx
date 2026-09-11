"use client";

import { errorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
	error,
	retry,
}: {
	error: Error;
	retry: () => void;
}) {
	return (
		<main
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
		</main>
	);
}
