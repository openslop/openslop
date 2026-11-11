"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useOpenWorkspace } from "./canvas/workspace-context";
import { useTemplate } from "@/lib/templates/use-template";
import { useSloppy } from "./sloppy/sloppy-provider";
import ComposerCopilot from "./copilot/composer-copilot";
import TemplateGallery from "./template-gallery";

function BackToMySlopLink() {
	return (
		<Link
			href="/"
			className="mb-4 inline-flex items-center gap-2 self-start text-body text-muted-foreground transition-colors hover:text-foreground focus-ring"
		>
			<ArrowLeft size={16} aria-hidden="true" />
			Back to My Slop
		</Link>
	);
}

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
		<div className="flex w-full max-w-4xl flex-col items-center px-4">
			<BackToMySlopLink />
			<h1 className="mb-6 text-center font-serif text-hero text-balance text-foreground">
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
