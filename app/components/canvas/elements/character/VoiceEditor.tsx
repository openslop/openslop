"use client";

import { useMemo } from "react";
import { useSlateStatic } from "slate-react";
import { voiceFrom } from "@/lib/canvas/assets";
import { elementSchema } from "@/lib/canvas/elementConnector";
import type { AssetElement } from "@/lib/canvas/types";
import { hasModel, resolveModel, sameModel } from "@/lib/connectors/models";
import { voiceTraitsSchema } from "@/lib/project/types";
import { mergeAttrs } from "@/lib/canvas/editorOps";
import { AttributeFields } from "./fields";
import { VoicePicker } from "./VoicePicker";

/** A voice: the traits that describe it, and the voice they find. */
export function VoiceEditor({ asset }: { asset: AssetElement<"asset_voice"> }) {
	const editor = useSlateStatic();
	const voice = useMemo(() => voiceFrom(asset), [asset]);
	const filters = useMemo(() => voiceTraitsSchema.parse(voice), [voice]);
	const model = resolveModel("tts", voice);
	const onModel = hasModel("tts", voice);
	const { voiceId } = voice;

	return (
		<section
			aria-label="Voice"
			className="flex flex-col gap-2 rounded-lg border border-border p-3"
		>
			<AttributeFields
				element={asset}
				specs={elementSchema(asset).settingsAttributes}
			/>
			<VoicePicker
				filters={filters}
				model={model}
				selectedVoiceId={onModel ? voiceId : undefined}
				onSelect={(picked) =>
					mergeAttrs(editor, asset.id, { ...model, voiceId: picked.id })
				}
				onModelChange={(next) => {
					if (!onModel || !sameModel(voice, next))
						mergeAttrs(editor, asset.id, { ...next, voiceId: null });
				}}
			/>
		</section>
	);
}
