"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOpenWorkspace } from "@/lib/script/ScriptProvider";
import { useTemplate } from "@/lib/templates/useTemplate";
import { useSloppy } from "./sloppy/SloppyProvider";
import BackToMySlopLink from "./BackToMySlopLink";
import ComposerCopilot from "./copilot/ComposerCopilot";
import TemplateGallery from "./TemplateGallery";

export default function ComposerHero() {
	const openWorkspace = useOpenWorkspace();
	const { applyTemplate } = useTemplate();
	const { send } = useSloppy();
	const [value, setValue] = useState("");

	const start = (brief: string) => {
		openWorkspace();
		send(brief);
	};

	return (
		<div className="flex w-full max-w-2xl flex-col items-center px-4">
			<BackToMySlopLink className="mb-4 self-start" />
			<h1 className="mb-6 text-center font-serif text-[clamp(48px,12vw,85px)] leading-[0.95em] tracking-[-0.04em] text-balance text-foreground">
				Describe your slop
			</h1>

			<ComposerCopilot
				value={value}
				onValueChange={setValue}
				onSubmit={(brief) => {
					start(brief);
					setValue("");
				}}
			/>

			<Button
				variant="ghost"
				size="sm"
				className="mt-3 text-muted-foreground"
				onClick={openWorkspace}
			>
				Skip to a blank canvas
			</Button>

			<TemplateGallery
				onSelect={(templateId, examplePrompt) => {
					applyTemplate(templateId);
					setValue(examplePrompt);
				}}
			/>
		</div>
	);
}
