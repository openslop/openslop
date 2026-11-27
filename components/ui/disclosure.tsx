"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "@/components/ui/icon";

/** The body only mounts while open, so costly children belong in a component. */
export function Disclosure({
	icon,
	label,
	children,
	marker,
	pending = false,
	defaultOpen = false,
	disabled = false,
}: {
	icon?: ReactNode;
	label: ReactNode;
	children: ReactNode;
	/** Stands in for the chevron, such as a loader while work is in flight. */
	marker?: ReactNode;
	/** Work still in flight, shown the way the rest of the editor shows it. */
	pending?: boolean;
	defaultOpen?: boolean;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);
	const bodyId = useId();
	const Chevron = open ? ChevronDown : ChevronRight;

	return (
		<div className="flex flex-col gap-1.5">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-expanded={open}
				aria-controls={bodyId}
				disabled={disabled}
				className="flex items-center gap-1.5 self-start rounded-md px-1 py-0.5 text-left text-label-xs text-muted-foreground transition-colors enabled:hover:text-foreground focus-ring"
			>
				{marker ?? <Chevron className="h-3 w-3" />}
				{icon}
				<span className={pending ? "shimmer" : undefined}>{label}</span>
			</button>
			{open && (
				<div id={bodyId} className="pl-3">
					{children}
				</div>
			)}
		</div>
	);
}

export function DisclosureText({ children }: { children: string }) {
	return (
		<pre className="max-h-72 overflow-auto whitespace-pre-wrap wrap-break-word rounded-md bg-surface-recessed p-2 font-numeric text-label-xs text-muted-foreground">
			{children}
		</pre>
	);
}

export function DisclosureJson({ value }: { value: unknown }) {
	return <DisclosureText>{JSON.stringify(value, null, 2)}</DisclosureText>;
}
