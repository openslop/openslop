"use client";

import { useMemo } from "react";
import { useSlateStatic } from "slate-react";
import { elementSchema } from "@/lib/canvas/elementConnector";
import { flatAttributes } from "@/lib/canvas/elementAttributes";
import type { AssetElement } from "@/lib/canvas/types";
import { useAsset } from "@/lib/canvas/useAssets";
import { hasModel, resolveModel, sameModel } from "@/lib/connectors/models";
import { VoiceSchema, voiceTraitsSchema } from "@/lib/project/types";
import { mergeAttrs } from "@/lib/canvas/editorOps";
import { setAsset } from "@/lib/canvas/assetOps";
import { Button } from "@/components/ui/button";
import { Plus } from "@/components/ui/icon";
import { AttributeFields, FieldLabel } from "./fields";
import { VoicePicker } from "./VoicePicker";

/** A speaker's voice element: the traits that describe it, and the voice they find. */
export function VoiceEditor({ name }: { name?: string }) {
	const editor = useSlateStatic();
	const element = useAsset("voice", name);
	if (element) return <VoiceFields element={element} />;
	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className="self-start"
			onClick={() => setAsset(editor, "voice", name)}
		>
			<Plus />
			Add voice
		</Button>
	);
}

function VoiceFields({ element }: { element: AssetElement<"voice"> }) {
	const editor = useSlateStatic();
	const voice = useMemo(
		() => VoiceSchema.parse(flatAttributes(element)),
		[element],
	);
	const filters = useMemo(() => voiceTraitsSchema.parse(voice), [voice]);
	const model = resolveModel("tts", voice);
	const onModel = hasModel("tts", voice);
	const { voiceId } = voice;

	return (
		<section
			aria-label="Voice"
			className="flex flex-col gap-2 rounded-lg border border-border p-3"
		>
			<FieldLabel>Voice</FieldLabel>
			<AttributeFields
				element={element}
				specs={elementSchema(element).settingsAttributes}
			/>
			<VoicePicker
				filters={filters}
				model={model}
				selectedVoiceId={onModel ? voiceId : undefined}
				onSelect={(picked) =>
					mergeAttrs(editor, element.id, { ...model, voiceId: picked.id })
				}
				onModelChange={(next) => {
					if (!onModel || !sameModel(voice, next))
						mergeAttrs(editor, element.id, { ...next, voiceId: null });
				}}
			/>
		</section>
	);
}
