"use client";

import * as React from "react";
import { Check, Copy } from "@/components/ui/icon";
import { IconButton, TooltipIconButton } from "@/components/ui/icon-button";
import { toastError } from "@/lib/toast-error";

const COPIED_MS = 1500;

export function CopyButton({
	text,
	label = "Copy",
	...props
}: Omit<React.ComponentProps<typeof IconButton>, "ariaLabel" | "onClick"> & {
	text: string;
	label?: string;
}) {
	const [copied, setCopied] = React.useState(false);

	React.useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), COPIED_MS);
		return () => clearTimeout(timer);
	}, [copied]);

	const copy = () =>
		navigator.clipboard.writeText(text).then(
			() => setCopied(true),
			(error: unknown) => toastError(error, "Couldn't copy the text"),
		);

	return (
		<TooltipIconButton
			label={copied ? "Copied" : label}
			variant="quiet"
			onClick={copy}
			{...props}
		>
			{copied ? <Check /> : <Copy />}
		</TooltipIconButton>
	);
}
