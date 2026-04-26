"use client";

import { useRef } from "react";
import type { ComposerMode } from "@/lib/config/ConfigProvider";
import Copilot, { type CopilotHandle } from "./Copilot";
import AnimatedPlaceholder from "./AnimatedPlaceholder";
import InspirationSection from "./InspirationSection";

const INPUT_SCRIPT_PLACEHOLDER = `EXT. NIGHT STARRY SKY
Soft glowing stars twinkle quietly across a deep blue sky.
A large silver moon glows softly above peaceful clouds.
Gentle music begins.

NARRATOR (soft, soothing voice)
High above the quiet forests and sleepy hills…
past the drifting clouds…
there was a small glowing garden hidden on the moon.

And in that garden… lived a little rabbit named Lumi…`;

export default function ComposerHero({
	composerMode,
	onModeChange,
	selectedTemplateId,
	onTemplateChange,
	loading,
	onSubmit,
	onStop,
}: {
	composerMode: ComposerMode;
	onModeChange: (mode: ComposerMode) => void;
	selectedTemplateId: string | null;
	onTemplateChange: (id: string) => void;
	loading: boolean;
	onSubmit: (value: string, referenceImages: string[]) => void;
	onStop: () => void;
}) {
	const copilotRef = useRef<CopilotHandle>(null);

	return (
		<div className="flex w-full max-w-2xl flex-col items-center px-4">
			<h1 className="font-title text-center text-[clamp(48px,12vw,85px)] tracking-[-0.04em] leading-[0.95em] text-white/90 text-wrap-balance mb-6">
				Describe your video
			</h1>

			<Copilot
				ref={copilotRef}
				onSubmit={onSubmit}
				onStop={onStop}
				multiline
				loading={loading}
				composerMode={composerMode}
				onModeChange={onModeChange}
				selectedTemplateId={selectedTemplateId}
				onTemplateChange={onTemplateChange}
				placeholder={
					composerMode === "script" ? (
						INPUT_SCRIPT_PLACEHOLDER
					) : (
						<AnimatedPlaceholder active />
					)
				}
			/>

			<InspirationSection
				onSelect={(prompt, images, templateId) => {
					if (templateId) {
						onModeChange("template");
						onTemplateChange(templateId);
					} else {
						onModeChange("story");
					}
					copilotRef.current?.fill(prompt, images);
				}}
			/>
		</div>
	);
}
