"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { createConnector } from "@/lib/connectors/factory";
import type { VoiceInfo } from "@/lib/connectors/types";
import { errorMessage } from "@/lib/errors";
import { AudioPlayer } from "../AudioPlayer";
import type { MetadataVoice } from "@/lib/project/types";
import { FieldLabel } from "./fields";

const DEBOUNCE_MS = 300;
const SKELETON_ROWS = 5;
const VOICE_LIMIT = 10;

export function VoicePicker({
	filters,
	selectedVoiceId,
	onSelect,
}: {
	filters: MetadataVoice;
	selectedVoiceId?: string;
	onSelect: (voice: VoiceInfo) => void;
}) {
	const { connectorConfig } = useConfig();
	const ttsConnector = useMemo(() => {
		const { provider, config } = getDefaultConnector(connectorConfig, "tts");
		return createConnector("tts", provider, config);
	}, [connectorConfig]);

	const [voices, setVoices] = useState<VoiceInfo[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		const handle = setTimeout(async () => {
			setLoading(true);
			setError(null);
			try {
				const result = await ttsConnector.searchVoices({
					...filters,
					limit: VOICE_LIMIT,
				});
				if (!cancelled) setVoices(result);
			} catch (err) {
				if (!cancelled) setError(errorMessage(err));
			} finally {
				if (!cancelled) setLoading(false);
			}
		}, DEBOUNCE_MS);

		return () => {
			cancelled = true;
			clearTimeout(handle);
		};
	}, [filters, ttsConnector]);

	return (
		<div className="flex min-w-0 flex-col gap-1.5">
			<FieldLabel>Voices</FieldLabel>
			{error && <span className="text-[11px] text-rose-400">{error}</span>}
			<div className="flex h-64 min-w-0 flex-col gap-1.5 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-1.5">
				{loading &&
					Array.from({ length: SKELETON_ROWS }).map((_, i) => (
						<Skeleton
							key={`skel-${i}`}
							className="h-16 shrink-0 rounded-md border border-white/5 bg-white/[0.03]"
						/>
					))}
				{!loading && voices.length === 0 && !error && (
					<span className="px-2 py-3 text-center text-[11px] text-white/40">
						No voices match these filters.
					</span>
				)}
				{!loading &&
					voices.map((voice) => {
						const selected = voice.id === selectedVoiceId;
						return (
							<div
								key={voice.id}
								className={`flex min-w-0 flex-col gap-1 rounded-md border px-2 py-1.5 transition-colors ${
									selected
										? "border-white/40 bg-white/10"
										: "border-white/5 bg-white/[0.03]"
								}`}
							>
								<button
									type="button"
									onClick={() => onSelect(voice)}
									className="flex min-w-0 items-center gap-1.5 text-left"
								>
									<span className="min-w-0 flex-1 truncate text-[12px] font-medium text-white">
										{voice.name}
									</span>
									{voice.language && (
										<span className="shrink-0 rounded bg-white/10 px-1 py-px text-[9px] uppercase text-white/60">
											{voice.language}
										</span>
									)}
									{voice.gender && (
										<span className="shrink-0 rounded bg-white/10 px-1 py-px text-[9px] uppercase text-white/60">
											{voice.gender}
										</span>
									)}
									{selected && (
										<Check className="h-3 w-3 shrink-0 text-white/80" />
									)}
								</button>
								{voice.description && (
									<span className="block truncate text-[10px] text-white/50">
										{voice.description}
									</span>
								)}
								{voice.previewUrl && (
									<div className="flex min-w-0 items-center gap-2">
										<AudioPlayer src={voice.previewUrl} />
									</div>
								)}
							</div>
						);
					})}
			</div>
		</div>
	);
}
