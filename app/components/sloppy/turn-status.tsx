"use client";

import { useState, type ReactNode } from "react";
import { Sparkles } from "@/components/ui/icon";
import { useElapsedSeconds } from "@/lib/components/use-elapsed-seconds";
import OrbLoader from "../orb-loader";

function StatusRow({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center gap-1.5 self-start px-1 py-0.5 text-label-xs text-muted-foreground">
			{children}
		</div>
	);
}

export function WorkingStatus({ status }: { status: string }) {
	const [startedAt] = useState(Date.now);
	const elapsed = useElapsedSeconds(startedAt);

	return (
		<StatusRow>
			<OrbLoader />
			<span className="shimmer">{`${status} · ${elapsed}s`}</span>
		</StatusRow>
	);
}

export function WorkedStatus({ seconds }: { seconds: number | undefined }) {
	return (
		<StatusRow>
			<Sparkles className="h-3 w-3" />
			<span>{seconds === undefined ? "Worked" : `Worked for ${seconds}s`}</span>
		</StatusRow>
	);
}
