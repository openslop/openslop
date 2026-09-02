"use client";

import { useMemo } from "react";
import {
	TTS_ACCENTS,
	TTS_AGES,
	TTS_GENDERS,
	TTS_LANGUAGES,
	TTS_PITCHES,
} from "@/lib/connectors/tts/enums";
import { resolveModel } from "@/lib/connectors/models";
import { useDefaultModels } from "@/lib/connectors/useDefaultModels";
import type { MetadataVoice } from "@/lib/project/types";
import { EnumField, FieldLabel, TextField } from "./fields";
import { VoicePicker } from "./VoicePicker";

export function VoiceSection({
	voice,
	onChange,
}: {
	voice: MetadataVoice;
	onChange: (partial: Partial<MetadataVoice>) => void;
}) {
	return (
		<section className="flex flex-col gap-2 rounded-lg border border-border p-3">
			<div className="flex flex-col gap-0.5">
				<FieldLabel>Voice</FieldLabel>
				<p className="text-label-xs text-muted-foreground">
					Filter the voice list
				</p>
			</div>
			<VoiceMetadataGrid voice={voice} onChange={onChange} />
			<MetadataVoicePicker voice={voice} onChange={onChange} />
		</section>
	);
}

export function VoiceMetadataGrid({
	voice,
	onChange,
}: {
	voice: MetadataVoice;
	onChange: (partial: Partial<MetadataVoice>) => void;
}) {
	return (
		<div className="grid grid-cols-2 content-start gap-2">
			<EnumField
				label="Gender"
				options={TTS_GENDERS}
				value={voice.gender}
				onChange={(gender) => onChange({ gender })}
			/>
			<EnumField
				label="Language"
				options={TTS_LANGUAGES}
				value={voice.language}
				onChange={(language) => onChange({ language })}
			/>
			<EnumField
				label="Age"
				options={TTS_AGES}
				value={voice.age}
				onChange={(age) => onChange({ age })}
			/>
			<EnumField
				label="Pitch"
				options={TTS_PITCHES}
				value={voice.pitch}
				onChange={(pitch) => onChange({ pitch })}
			/>
			<EnumField
				label="Accent"
				options={TTS_ACCENTS}
				value={voice.accent}
				onChange={(accent) => onChange({ accent })}
			/>
			<TextField
				label="Description"
				value={voice.description}
				onChange={(description) => onChange({ description })}
				placeholder="Free-text"
			/>
		</div>
	);
}

export function MetadataVoicePicker({
	voice,
	onChange,
}: {
	voice: MetadataVoice;
	onChange: (partial: Partial<MetadataVoice>) => void;
}) {
	const { gender, age, pitch, accent, description, language } = voice;
	const filters = useMemo(
		() => ({ gender, age, pitch, accent, description, language }),
		[gender, age, pitch, accent, description, language],
	);
	const defaults = useDefaultModels();

	return (
		<VoicePicker
			filters={filters}
			model={resolveModel("tts", voice, defaults.tts)}
			selectedVoiceId={voice.voiceId ?? voice.resolvedVoiceId}
			onSelect={(picked) => onChange({ voiceId: picked.id })}
			onModelChange={onChange}
		/>
	);
}
