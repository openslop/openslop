"use client";

import { useScript, useScriptText } from "@/lib/script/ScriptProvider";
import PrePromptView from "./PrePromptView";
import PostPromptView from "./PostPromptView";

export default function Editor() {
	const { loading } = useScript();
	const script = useScriptText();
	const hasScript = script.length > 0 || loading;

	return (
		<div
			className={`flex min-h-screen flex-col items-center text-white transition-[padding] duration-700 ease-out ${
				hasScript ? "" : "pt-[22vh]"
			}`}
		>
			{hasScript ? <PostPromptView /> : <PrePromptView />}
		</div>
	);
}
