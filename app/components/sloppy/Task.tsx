"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sparkles } from "@/components/ui/icon";
import { Disclosure } from "@/components/ui/disclosure";
import OrbLoader from "../OrbLoader";

function useElapsed(running: boolean): number {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		if (!running) return;
		const id = setInterval(() => setSeconds((prev) => prev + 1), 1000);
		return () => clearInterval(id);
	}, [running]);

	return seconds;
}

function workedLabel(seconds: number | undefined): string {
	return seconds === undefined ? "Worked" : `Worked for ${seconds}s`;
}

/** Every step of a turn, under one header. */
export function Task({
	streaming,
	status,
	seconds,
	children,
}: {
	streaming: boolean;
	status: string;
	seconds: number | undefined;
	children: ReactNode;
}) {
	const elapsed = useElapsed(streaming);

	return (
		<Disclosure
			// Shuts itself when the turn ends, without overriding a reader's toggle.
			key={String(streaming)}
			defaultOpen={streaming}
			pending={streaming}
			icon={
				streaming ? (
					<OrbLoader />
				) : (
					<Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
				)
			}
			label={streaming ? `${status} · ${elapsed}s` : workedLabel(seconds)}
		>
			<div className="flex flex-col gap-2">{children}</div>
		</Disclosure>
	);
}
