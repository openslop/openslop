"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useScript } from "@/lib/script/ScriptProvider";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore } from "@/lib/project/store";
import PrePromptView from "./PrePromptView";

const PostPromptView = dynamic(() => import("./PostPromptView"), {
	ssr: false,
});

export default function Editor() {
	const { script, loading, submitPrompt } = useScript();
	const { projectId } = useConfig();
	const [prompted, setPrompted] = useState(false);

	useEffect(() => {
		void import("./PostPromptView");
	}, []);

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
