"use client";

import { useSlateStatic } from "slate-react";
import { handleProjectHistoryKeyDown } from "./canvas/project-history-keymap";
import PostPromptView from "./post-prompt-view";
import PrePromptView from "./pre-prompt-view";
import { useShowWorkspace } from "./canvas/workspace-context";

export default function Editor() {
	const editor = useSlateStatic();
	const showWorkspace = useShowWorkspace();

	return (
		<div
			onKeyDown={(event) => handleProjectHistoryKeyDown(event, editor)}
			className={`flex min-h-screen flex-col items-center transition-[padding] duration-700 ease-out ${
				showWorkspace ? "" : "pt-[22vh]"
			}`}
		>
			{showWorkspace ? <PostPromptView /> : <PrePromptView />}
		</div>
	);
}
