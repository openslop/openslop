"use client";

import { useShowWorkspace } from "@/lib/script/script-provider";
import PrePromptView from "./pre-prompt-view";
import PostPromptView from "./post-prompt-view";
import { CanvasProviders } from "./canvas/canvas-providers";

export default function Editor() {
	const showWorkspace = useShowWorkspace();

	return (
		<CanvasProviders>
			<div
				className={`flex min-h-screen flex-col items-center transition-[padding] duration-700 ease-out ${
					showWorkspace ? "" : "pt-[22vh]"
				}`}
			>
				{showWorkspace ? <PostPromptView /> : <PrePromptView />}
			</div>
		</CanvasProviders>
	);
}
