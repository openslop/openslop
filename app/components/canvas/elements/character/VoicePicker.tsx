"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Pause, Play } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ConfigureModelsItem,
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/models/ModelSelect";
import { useConfig } from "@/lib/config/ConfigProvider";
import { createConnector } from "@/lib/connectors/factory";
import type { ModelRef, VoiceInfo } from "@/lib/connectors/types";
import { errorMessage } from "@/lib/errors";
import type { MetadataVoice } from "@/lib/project/types";
import { FieldLabel } from "./fields";

function PreviewPlayButton({ src }: { src: string }) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playing, setPlaying] = useState(false);

	// Pause when the previewed voice changes
	useEffect(() => {
		audioRef.current?.pause();
	}, [src]);

	const toggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) void audio.play().catch(() => setPlaying(false));
		else audio.pause();
	};

	return (
		<>
			<audio
				ref={audioRef}
				src={src}
				preload="none"
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onEnded={() => setPlaying(false)}
			/>
			<TooltipIconButton label={playing ? "Pause" : "Play"} onClick={toggle}>
				{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
			</TooltipIconButton>
		</>
	);
}

const DEBOUNCE_MS = 300;
const SKELETON_ROWS = 5;
const VOICE_LIMIT = 50;

export function VoicePicker({
	filters,
	model,
	selectedVoiceId,
	onSelect,
	onModelChange,
}: {
	filters: MetadataVoice;
	model: ModelRef;
	selectedVoiceId?: string;
	onSelect: (voice: VoiceInfo) => void;
	onModelChange: (model: ModelRef) => void;
}) {
	const { connectorConfig } = useConfig();
	const { provider, model: name } = model;
	const ttsConnector = useMemo(
		() =>
			createConnector("tts", { provider, model: name }, connectorConfig.tts),
		[connectorConfig, provider, name],
	);

	const [voices, setVoices] = useState<VoiceInfo[]>([]);
	const [loading, setLoading] = useState(true);
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
			<div className="flex items-center justify-between gap-2">
				<FieldLabel>Voices</FieldLabel>
				<ModelSelect
					type="tts"
					value={model}
					onChange={onModelChange}
					footer={<ConfigureModelsItem />}
				>
					<ModelSelectTrigger model={model} label="Voice model" />
				</ModelSelect>
			</div>
			{error && <span className="text-label-xs text-destructive">{error}</span>}
			<div className="flex max-h-64 min-w-0 flex-col gap-0.5 overflow-y-auto">
				{loading &&
					Array.from({ length: SKELETON_ROWS }).map((_, i) => (
						<Skeleton key={`skel-${i}`} className="h-12 shrink-0 rounded-md" />
					))}
				{!loading && voices.length === 0 && !error && (
					<span className="px-2 py-3 text-center text-label-xs text-muted-foreground">
						No voices match these filters.
					</span>
				)}
				{!loading &&
					voices.map((voice) => {
						const selected = voice.id === selectedVoiceId;
						return (
							<div
								key={voice.id}
								role="button"
								tabIndex={0}
								onClick={() => onSelect(voice)}
								onKeyDown={(e) => {
									if (e.target !== e.currentTarget) return;
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										onSelect(voice);
									}
								}}
								className={`flex min-w-0 cursor-pointer flex-col gap-1 rounded-md px-2 py-1 transition-colors ${
									selected ? "bg-muted" : "hover:bg-voice-hover"
								}`}
							>
								<div className="flex min-w-0 items-center gap-1.5">
									<span className="min-w-0 flex-1 truncate text-label text-foreground">
										{voice.name}
									</span>
									{voice.language && (
										<span className="shrink-0 rounded border border-border px-1 py-px text-badge-xs uppercase text-muted-foreground">
											{voice.language}
										</span>
									)}
									{voice.gender && (
										<span className="shrink-0 rounded border border-border px-1 py-px text-badge-xs uppercase text-muted-foreground">
											{voice.gender}
										</span>
									)}
									{selected && (
										<Check className="h-3 w-3 shrink-0 text-accent" />
									)}
								</div>
								{(voice.description || voice.previewUrl) && (
									<div className="flex min-w-0 items-center justify-between gap-2">
										<span className="min-w-0 flex-1 truncate text-label text-muted-foreground">
											{voice.description}
										</span>
										{voice.previewUrl && (
											<PreviewPlayButton src={voice.previewUrl} />
										)}
									</div>
								)}
							</div>
						);
					})}
			</div>
		</div>
	);
}
