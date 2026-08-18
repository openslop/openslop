"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "@/components/ui/icon";
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

export function TurnStatus({
	streaming,
	status,
	seconds,
}: {
	streaming: boolean;
	status: string;
	seconds: number | undefined;
}) {
	const elapsed = useElapsed(streaming);

	return (
		<div className="flex items-center gap-1.5 self-start px-1 py-0.5 text-label-xs text-muted-foreground">
			{streaming ? (
				<OrbLoader />
			) : (
				<Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
			)}
			<span className={streaming ? "shimmer" : undefined}>
				{streaming ? `${status} · ${elapsed}s` : workedLabel(seconds)}
			</span>
		</div>
	);
}
