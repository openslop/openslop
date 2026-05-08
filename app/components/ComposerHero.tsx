"use client";

import { useScript } from "@/lib/script/ScriptProvider";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import { copilotStore, useCopilotStore } from "@/lib/copilot/store";
import { getTemplateById } from "@/lib/templates/templates";
import Copilot from "./Copilot";
import AnimatedPlaceholder from "./AnimatedPlaceholder";
import TemplateGallery from "./TemplateGallery";

const INPUT_SCRIPT_PLACEHOLDER = `EXT. NIGHT STARRY SKY
Soft glowing stars twinkle quietly across a deep blue sky.
A large silver moon glows softly above peaceful clouds.
Gentle music begins.

NARRATOR (soft, soothing voice)
High above the quiet forests and sleepy hills…
past the drifting clouds…
there was a small glowing garden hidden on the moon.

And in that garden… lived a little rabbit named Lumi…`;

export default function ComposerHero() {
	const { loading, submitPrompt, stopGeneration } = useScript();
	const { projectId } = useConfig();
	const mode = useCopilotStore((s) => s.mode);

	const handleSubmit = (value: string) => {
		const { referenceImages, selectedTemplateId } = copilotStore.getState();
		const store = getProjectStore(projectId).getState();
		store.setReferenceImages(referenceImages);
		if (mode === "template" && selectedTemplateId) {
			const template = getTemplateById(selectedTemplateId);
			store.updateMetadata({
				characters: template?.characters,
				narration: template?.narration,
			});
		}
		copilotStore.getState().markSubmitted();
		submitPrompt(value);
	};

	return (
		<div className="flex w-full max-w-2xl flex-col items-center px-4">
			<h1 className="font-title text-center text-[clamp(48px,12vw,85px)] tracking-[-0.04em] leading-[0.95em] text-white/90 text-wrap-balance mb-6">
				Describe your video
			</h1>

			<Copilot
				onSubmit={handleSubmit}
				onStop={stopGeneration}
				multiline
				loading={loading}
				placeholder={
					mode === "script" ? (
						INPUT_SCRIPT_PLACEHOLDER
					) : (
						<AnimatedPlaceholder active />
					)
				}
			/>

			<TemplateGallery
				onSelect={(templateId, examplePrompt) => {
					const store = copilotStore.getState();
					store.selectTemplate(templateId);
					store.setValue(examplePrompt);
				}}
			/>
		</div>
	);
}
