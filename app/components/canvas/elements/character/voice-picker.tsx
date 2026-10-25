"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Pause, Play } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
	ConfigureModelsItem,
	ModelSelect,
	ModelSelectTrigger,
} from "@/app/components/models/model-select";
import type {
	ModelRef,
	VoiceInfo,
	VoiceSearchParams,
} from "@/lib/connectors/types";
import { createConnector } from "@/lib/connectors/factory";
import { useVoiceSearch } from "@/lib/connectors/tts/use-voice-search";
import { toastError } from "@/lib/toast-error";
import { cn } from "@/lib/utils";
import { FieldLabel } from "./fields";

function PreviewPlayButton({ load }: { load: () => Promise<string> }) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playing, setPlaying] = useState(false);
	const [loading, startLoading] = useTransition();

	const play = (audio: HTMLAudioElement) =>
		void audio.play().catch(() => setPlaying(false));

	const toggle = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (!audio.paused) {
			audio.pause();
			return;
		}
		if (audio.src) {
			play(audio);
			return;
		}
		startLoading(async () => {
			try {
				audio.src = await load();
				play(audio);
			} catch (error) {
				toastError(error, "Couldn't load the preview");
			}
		});
	};

	return (
		<>
			<audio
				ref={audioRef}
				preload="none"
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onEnded={() => setPlaying(false)}
			/>
			<TooltipIconButton
				label={playing ? "Pause" : "Play"}
				onClick={toggle}
				unavailable={loading}
			>
				{loading ? (
					<Spinner />
				) : playing ? (
					<Pause className="h-4 w-4" />
				) : (
					<Play className="h-4 w-4" />
				)}
			</TooltipIconButton>
		</>
	);
}

const SKELETON_ROWS = 5;

export function VoiceRow({
	voice,
	selected,
	onSelect,
	loadPreview,
}: {
	voice: VoiceInfo;
	selected: boolean;
	onSelect: () => void;
	loadPreview: () => Promise<string>;
}) {
	return (
		<div
			role="group"
			aria-label={voice.name}
			className={cn(
				"flex min-w-0 items-center gap-2 rounded-md pr-2 transition-colors",
				selected ? "bg-muted" : "hover:bg-voice-hover",
			)}
		>
			<button
				type="button"
				aria-pressed={selected}
				onClick={onSelect}
				className="flex min-w-0 flex-1 flex-col gap-1 rounded-md py-1 pl-2 text-left focus-ring"
			>
				<span className="flex min-w-0 items-center gap-1.5">
					<span className="min-w-0 flex-1 truncate text-label text-foreground">
						{voice.name}
					</span>
					{[voice.language, voice.gender].filter(Boolean).map((tag) => (
						<Badge key={tag} variant="muted" size="sm" className="uppercase">
							{tag}
						</Badge>
					))}
					{selected && <Check className="h-3 w-3 shrink-0 text-accent" />}
				</span>
				{voice.description && (
					<span className="truncate text-label text-muted-foreground">
						{voice.description}
					</span>
				)}
			</button>
			{voice.previewUrl && <PreviewPlayButton load={loadPreview} />}
		</div>
	);
}

export function VoicePicker({
	filters,
	model,
	selectedVoiceId,
	onSelect,
	onModelChange,
}: {
	filters: VoiceSearchParams;
	model: ModelRef;
	selectedVoiceId?: string;
	onSelect: (voice: VoiceInfo) => void;
	onModelChange: (model: ModelRef) => void;
}) {
	const { provider, model: modelName } = model;
	const connector = useMemo(
		() => createConnector("tts", { provider, model: modelName }),
		[provider, modelName],
	);
	const search = useVoiceSearch(filters, connector);

	return (
		<div className="flex min-w-0 flex-col gap-1.5">
			<div className="flex items-center justify-between gap-2">
				<FieldLabel>Voices</FieldLabel>
				<ModelSelect
					type="voice"
					value={model}
					onChange={onModelChange}
					footer={<ConfigureModelsItem />}
				>
					<ModelSelectTrigger model={model} label="Voice model" />
				</ModelSelect>
			</div>
			{search.status === "failed" && (
				<span role="alert" className="text-label-xs text-destructive">
					{search.message}
				</span>
			)}
			<div className="flex max-h-64 min-w-0 flex-col gap-0.5 overflow-y-auto">
				{search.status === "loading" &&
					Array.from({ length: SKELETON_ROWS }).map((_, i) => (
						<Skeleton key={`skel-${i}`} className="h-12 shrink-0 rounded-md" />
					))}
				{search.status === "ready" && search.voices.length === 0 && (
					<span className="px-2 py-3 text-center text-label-xs text-muted-foreground">
						No voices match these filters.
					</span>
				)}
				{search.status === "ready" &&
					search.voices.map((voice) => (
						<VoiceRow
							key={voice.id}
							voice={voice}
							selected={voice.id === selectedVoiceId}
							onSelect={() => onSelect(voice)}
							loadPreview={async () =>
								(await connector.voicePreview(voice.id)).url
							}
						/>
					))}
			</div>
		</div>
	);
}
