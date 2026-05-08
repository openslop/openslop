"use client";

import { useState } from "react";
import { useScript, useScriptText } from "@/lib/script/ScriptProvider";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import PrePromptView from "./PrePromptView";
import PostPromptView from "./PostPromptView";

export default function Editor() {
	const { loading, submitPrompt } = useScript();
	const script = useScriptText();
	const { projectId } = useConfig();
	const [prompted, setPrompted] = useState(false);

	const hasScript = script.length > 0 || loading;

	const handleSubmit = (value: string, referenceImages: string[]) => {
		getProjectStore(projectId).getState().setReferenceImages(referenceImages);
		setPrompted(true);
		submitPrompt(value);
	};

	return (
		<div
			className={`flex min-h-screen flex-col items-center text-white transition-[padding] duration-700 ease-out ${
				hasScript ? "" : "pt-[22vh]"
			}`}
		>
			{prompted ? (
				<PostPromptView />
			) : (
				<PrePromptView onSubmit={handleSubmit} />
			)}
		</div>
	);
}
