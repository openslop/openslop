"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Sparkles } from "@/components/ui/icon";
import OrbLoader from "../OrbLoader";

function StatusRow({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-center gap-1.5 self-start px-1 py-0.5 text-label-xs text-muted-foreground">
			{children}
		</div>
	);
}

export function WorkingStatus({ status }: { status: string }) {
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		const id = setInterval(() => setElapsed((prev) => prev + 1), 1000);
		return () => clearInterval(id);
	}, []);

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
			<Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
			<span>{seconds === undefined ? "Worked" : `Worked for ${seconds}s`}</span>
		</StatusRow>
	);
}
