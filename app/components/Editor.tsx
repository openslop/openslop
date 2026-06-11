"use client";

import {
	useScriptControl,
	useScriptHasContent,
} from "@/lib/script/ScriptProvider";
import PrePromptView from "./PrePromptView";
import PostPromptView from "./PostPromptView";
import { PreviewCacheProvider } from "./canvas/PreviewCacheContext";

export default function Editor() {
	const { loading } = useScriptControl();
	const hasScript = useScriptHasContent() || loading;

	return (
		<PreviewCacheProvider>
			<div
				className={`flex min-h-screen flex-col items-center text-white transition-[padding] duration-700 ease-out ${
					hasScript ? "" : "pt-[22vh]"
				}`}
			>
				{hasScript ? <PostPromptView /> : <PrePromptView />}
			</div>
		</PreviewCacheProvider>
	);
}
