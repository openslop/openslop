"use client";

import { useShowWorkspace } from "@/lib/script/ScriptProvider";
import PrePromptView from "./PrePromptView";
import PostPromptView from "./PostPromptView";
import { CanvasProviders } from "./canvas/CanvasProviders";

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
