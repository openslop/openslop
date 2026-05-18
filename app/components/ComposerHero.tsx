"use client";

import { useState } from "react";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import { useConfig } from "@/lib/config/ConfigProvider";
import BackToMySlopLink from "./BackToMySlopLink";
import ComposerCopilot from "./copilot/ComposerCopilot";
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
	const { submitPrompt } = useScriptControl();
	const { mode, applyTemplate } = useConfig();
	const [value, setValue] = useState("");

	return (
		<div className="flex w-full max-w-2xl flex-col items-center px-4">
			<BackToMySlopLink className="mb-4 self-start" />
			<h1 className="font-title text-center text-[clamp(48px,12vw,85px)] tracking-[-0.04em] leading-[0.95em] text-white/90 text-wrap-balance mb-6">
				Describe your video
			</h1>

			<ComposerCopilot
				value={value}
				onValueChange={setValue}
				onSubmit={() => {
					submitPrompt(value);
					setValue("");
				}}
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
					applyTemplate(templateId);
					setValue(examplePrompt);
				}}
			/>
		</div>
	);
}
