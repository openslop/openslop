"use client";

import UserProfile from "./UserProfile";
import { EditorToolbar } from "./EditorToolbar";
import Canvas from "./canvas/Canvas";
import { CanvasProviders } from "./canvas/CanvasProviders";
import { EditorSidebar } from "./canvas/panel/EditorSidebar";
import { ProjectTitle } from "./canvas/ProjectTitle";
import { useEditorSession } from "./canvas/hooks/useEditorSession";
import { TopPlayerPanel, SidePlayerPanel } from "./video/PlayerPanel";
import { BottomTransportBar } from "./video/BottomTransportBar";
import { Storyboard } from "./video/storyboard/Storyboard";
import { BottomViewProvider, useBottomView } from "./video/BottomViewContext";
import {
	PlayerPositionProvider,
	usePlayerPosition,
} from "./video/PlayerPositionContext";

function PostPromptViewInner() {
	const { editor, value, setValue, layoutKey } = useEditorSession();
	const { position, visible } = usePlayerPosition();
	const { view } = useBottomView();
	const isTop = position === "top";

	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden">
			<div
				aria-hidden
				className="dot-grid-bg pointer-events-none fixed inset-0 -z-10"
			/>
			<UserProfile />

			<CanvasProviders editor={editor} layoutKey={layoutKey}>
				<EditorToolbar editor={editor} />
				<div className="flex min-h-0 flex-1 overflow-hidden">
					<EditorSidebar />
					<div className="grain relative mr-2 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-element-card shadow-elevation-5">
						<div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
							{visible && isTop && <TopPlayerPanel />}

							<div className="flex min-h-0 flex-1 overflow-hidden">
								<div
									className="flex-1 overflow-y-auto"
									style={{ scrollbarGutter: "stable" }}
								>
									<div className="mx-auto max-w-6xl px-4 py-4">
										<ProjectTitle />
										<Canvas editor={editor} value={value} setValue={setValue} />
									</div>
								</div>

								{visible && !isTop && <SidePlayerPanel />}
							</div>

							<BottomTransportBar />
							{view === "storyboard" && <Storyboard editor={editor} />}
						</div>
					</div>
				</div>
			</CanvasProviders>
		</div>
	);
}

export default function PostPromptView() {
	return (
		<PlayerPositionProvider>
			<BottomViewProvider>
				<PostPromptViewInner />
			</BottomViewProvider>
		</PlayerPositionProvider>
	);
}
