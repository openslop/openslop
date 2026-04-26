"use client";

import { useConfig } from "@/lib/config/ConfigProvider";
import { useScript } from "@/lib/script/ScriptProvider";
import ComposerHero from "./ComposerHero";
import UserProfile from "./UserProfile";

export default function PrePromptView({
	onSubmit,
}: {
	onSubmit: (value: string, referenceImages: string[]) => void;
}) {
	const {
		composerMode,
		setComposerMode,
		selectedTemplateId,
		setSelectedTemplateId,
	} = useConfig();
	const { loading, stopGeneration } = useScript();

	return (
		<>
			<div className="fixed left-4 top-4 z-[100]">
				<UserProfile />
			</div>
			<ComposerHero
				composerMode={composerMode}
				onModeChange={setComposerMode}
				selectedTemplateId={selectedTemplateId}
				onTemplateChange={setSelectedTemplateId}
				loading={loading}
				onSubmit={onSubmit}
				onStop={stopGeneration}
			/>
		</>
	);
}
