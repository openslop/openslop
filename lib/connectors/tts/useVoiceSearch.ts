"use client";

import { useEffect, useMemo, useState } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { createConnector } from "@/lib/connectors/factory";
import type { VoiceDescriptor } from "@/lib/connectors/tts/plugins/voice-search";
import type { ModelRef, VoiceInfo } from "@/lib/connectors/types";
import { errorMessage } from "@/lib/errors";

export type VoiceSearch =
	| { status: "loading" }
	| { status: "ready"; voices: VoiceInfo[] }
	| { status: "failed"; message: string };

const DEBOUNCE_MS = 300;
const VOICE_LIMIT = 50;
const LOADING: VoiceSearch = { status: "loading" };

/** The voices a pair offers for the filters, searched again whenever either changes. */
export function useVoiceSearch(
	filters: VoiceDescriptor,
	model: ModelRef,
): VoiceSearch {
	const { connectorConfig } = useConfig();
	const { provider, model: name } = model;
	const connector = useMemo(
		() =>
			createConnector("tts", { provider, model: name }, connectorConfig.tts),
		[connectorConfig, provider, name],
	);
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
