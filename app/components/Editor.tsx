"use client";

import { useShowWorkspace } from "@/lib/script/ScriptProvider";
import PrePromptView from "./PrePromptView";
import PostPromptView from "./PostPromptView";
import { CanvasProviders } from "./canvas/CanvasProviders";
import { useEditorSession } from "./canvas/hooks/useEditorSession";
import { PreviewCacheProvider } from "./canvas/PreviewCacheContext";
import { BottomViewProvider } from "./video/BottomViewContext";
import { PlayerPositionProvider } from "./video/PlayerPositionContext";

export default function Editor() {
	const { editor, onDocumentChange } = useEditorSession();
	const showWorkspace = useShowWorkspace();

	return (
		<PreviewCacheProvider>
			<PlayerPositionProvider>
				<BottomViewProvider>
					<CanvasProviders editor={editor} onDocumentChange={onDocumentChange}>
						<div
							className={`flex min-h-screen flex-col items-center transition-[padding] duration-700 ease-out ${
								showWorkspace ? "" : "pt-[22vh]"
							}`}
						>
							{showWorkspace ? (
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
