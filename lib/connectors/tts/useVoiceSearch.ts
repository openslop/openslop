"use client";

import { useEffect, useState } from "react";
import type {
	TTSConnector,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import { errorMessage } from "@/lib/errors";

export type VoiceSearch =
	| { status: "loading" }
	| { status: "ready"; voices: VoiceInfo[] }
	| { status: "failed"; message: string };

const DEBOUNCE_MS = 300;
const VOICE_LIMIT = 50;
const LOADING: VoiceSearch = { status: "loading" };

export function useVoiceSearch(
	filters: VoiceSearchParams,
	connector: TTSConnector,
): VoiceSearch {
	const [search, setSearch] = useState<VoiceSearch>(LOADING);

	useEffect(() => {
		let cancelled = false;
		const handle = setTimeout(async () => {
			setSearch(LOADING);
			try {
				const voices = await connector.searchVoices({
					...filters,
					limit: VOICE_LIMIT,
				});
				if (!cancelled) setSearch({ status: "ready", voices });
			} catch (err) {
				if (!cancelled)
					setSearch({ status: "failed", message: errorMessage(err) });
			}
		}, DEBOUNCE_MS);

		return () => {
			cancelled = true;
			clearTimeout(handle);
		};
	}, [filters, connector]);

	return search;
}
