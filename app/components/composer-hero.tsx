"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RobotFill } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useOpenWorkspace } from "./canvas/workspace-context";
import { useTemplate } from "@/lib/templates/use-template";
import { useSloppy } from "./sloppy/sloppy-provider";
import ComposerCopilot from "./copilot/composer-copilot";
import TemplateGallery from "./template-gallery";
import { greetingFor } from "./greetings";
import { useProjectId } from "@/lib/project/project-provider";

function BackToMySlopLink() {
	return (
		<Button variant="panel" size="sm" asChild className="mb-4 self-start">
			<Link href="/">
				<ArrowLeft />
				Back to My Slop
			</Link>
		</Button>
	);
}

export default function ComposerHero() {
	const openWorkspace = useOpenWorkspace();
	const { applyTemplate } = useTemplate();
	const { send } = useSloppy();
	const [value, setValue] = useState("");
	const greeting = greetingFor(useProjectId());

	const start = (brief: string) => {
		openWorkspace();
		send(brief);
	};

	return (
		<div className="flex w-full max-w-4xl flex-col items-center px-4">
			<BackToMySlopLink />
			<h1 className="mb-6 text-center font-serif text-hero text-balance text-foreground">
				<RobotFill size="1em" className="mr-[0.2em] align-[-0.15em]" />
				{greeting}
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
				variant="panel"
				size="sm"
				className="mt-3"
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
