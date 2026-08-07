"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
	const { submitPrompt, startBlank } = useScriptControl();
	const { mode, selectTemplate } = useConfig();
	const [value, setValue] = useState("");

	return (
		<div className="flex w-full max-w-2xl flex-col items-center px-4">
			<BackToMySlopLink className="mb-4 self-start" />
			<h1 className="mb-6 text-center font-serif text-[clamp(48px,12vw,85px)] leading-[0.95em] tracking-[-0.04em] text-balance text-foreground">
				Describe your video
			</h1>

			<ComposerCopilot
				value={value}
				onValueChange={setValue}
				onSubmit={() => {
					submitPrompt(value);
					setValue("");
				}}
				placeholder={mode === "script" ? INPUT_SCRIPT_PLACEHOLDER : undefined}
				placeholderOverlay={
					mode === "script" ? undefined : <AnimatedPlaceholder />
				}
			/>

			<Button
				variant="ghost"
				size="sm"
				className="mt-3 text-muted-foreground"
				onClick={startBlank}
			>
				Skip to a blank canvas
			</Button>

			<TemplateGallery
				onSelect={(templateId, examplePrompt) => {
					selectTemplate(templateId);
					setValue(examplePrompt);
				}}
			/>
		</div>
	);
}
