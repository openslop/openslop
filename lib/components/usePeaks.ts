"use client";

import { useEffect, useState } from "react";
import { loadPeaks } from "./peaks";

export type PeaksDecode =
	| { status: "loading" }
	| { status: "ready"; peaks: number[] }
	| { status: "failed" };

const LOADING: PeaksDecode = { status: "loading" };

/** The decoded peaks of a source, loading again whenever the source changes. */
export function usePeaks(src: string): PeaksDecode {
	const [decoded, setDecoded] = useState<{ src: string; decode: PeaksDecode }>({
		src,
		decode: LOADING,
	});

	useEffect(() => {
		let cancelled = false;
		loadPeaks(src)
			.then((peaks) => {
				if (!cancelled) setDecoded({ src, decode: { status: "ready", peaks } });
			})
			.catch((error) => {
				console.error("Failed to decode audio:", error);
				if (!cancelled) setDecoded({ src, decode: { status: "failed" } });
			});
		return () => {
			cancelled = true;
		};
	}, [src]);

	return decoded.src === src ? decoded.decode : LOADING;
}
