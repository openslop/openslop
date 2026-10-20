"use client";

import { useMemo } from "react";
import { useSlateStatic } from "slate-react";
import { voiceFrom } from "@/lib/canvas/assets";
import { elementSchema } from "@/lib/canvas/element-connector";
import type { AssetElement } from "@/lib/canvas/types";
import { resolveModel } from "@/lib/connectors/models";
import { mergeAttrs } from "@/lib/canvas/editor-ops";
import {
	ElementGenerationProvider,
	useElementGeneration,
} from "../element-generation-context";
import { AttributeFields } from "./fields";
import { VoicePicker } from "./voice-picker";

type VoiceProps = { element: AssetElement<"asset_voice"> };

/** A voice: the traits that describe it, and the voice they find or the user picks. */
export function VoiceEditor({ element }: VoiceProps) {
	return (
		<ElementGenerationProvider element={element}>
			<VoiceFields element={element} />
		</ElementGenerationProvider>
	);
}

function VoiceFields({ element }: VoiceProps) {
	const editor = useSlateStatic();
	const { result } = useElementGeneration();
	const voice = useMemo(() => voiceFrom(element), [element]);
	const { gender, age, pitch, accent, language, description } = voice;
	const filters = useMemo(
		() => ({ gender, age, pitch, accent, language, description }),
		[gender, age, pitch, accent, language, description],
	);

	return (
		<section
			aria-label="Voice"
			className="flex flex-col gap-2 rounded-lg border border-border p-3"
		>
			<AttributeFields
				element={element}
				specs={elementSchema(element).settingsAttributes}
			/>
			<VoicePicker
				filters={filters}
				model={resolveModel("voice", voice)}
				selectedVoiceId={voice.pickedVoiceId ?? result?.voiceId}
				onSelect={(picked) =>
					mergeAttrs(editor, element.id, { pickedVoiceId: picked.id })
				}
				onModelChange={(next) =>
					mergeAttrs(editor, element.id, { ...next, pickedVoiceId: null })
				}
			/>
		</section>
	);
}
