"use client";

import {
	useScriptControl,
	useScriptHasContent,
} from "@/lib/script/ScriptProvider";
import PrePromptView from "./PrePromptView";
import PostPromptView from "./PostPromptView";
import { CanvasProviders } from "./canvas/CanvasProviders";
import { useEditorSession } from "./canvas/hooks/useEditorSession";
import { PreviewCacheProvider } from "./canvas/PreviewCacheContext";
import { BottomViewProvider } from "./video/BottomViewContext";
import { PlayerPositionProvider } from "./video/PlayerPositionContext";

/** Assembled above the hero/workspace switch, so Sloppy runs the first prompt too. */
export default function Editor() {
	const { editor, onDocumentChange } = useEditorSession();
	const { loading } = useScriptControl();
	const hasScript = useScriptHasContent() || loading;

	return (
		<PreviewCacheProvider>
			<PlayerPositionProvider>
				<BottomViewProvider>
					<CanvasProviders editor={editor} onDocumentChange={onDocumentChange}>
						<div
							className={`flex min-h-screen flex-col items-center transition-[padding] duration-700 ease-out ${
								hasScript ? "" : "pt-[22vh]"
							}`}
						>
							{hasScript ? (
								<PostPromptView editor={editor} />
							) : (
								<PrePromptView />
							)}
						</div>
					</CanvasProviders>
				</BottomViewProvider>
			</PlayerPositionProvider>
		</PreviewCacheProvider>
	);
}
