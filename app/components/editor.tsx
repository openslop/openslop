"use client";

import PrePromptView from "./pre-prompt-view";
import PostPromptView from "./post-prompt-view";
import { useShowWorkspace } from "./canvas/workspace-context";

export default function Editor() {
	const showWorkspace = useShowWorkspace();

	return (
		<div
			className={`flex min-h-screen flex-col items-center transition-[padding] duration-700 ease-out ${
				showWorkspace ? "" : "pt-[22vh]"
			}`}
		>
			{showWorkspace ? <PostPromptView /> : <PrePromptView />}
		</div>
	);
}
