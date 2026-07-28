"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	withRegistry,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import type { LLMPlugin } from "@/lib/connectors/types";
import { buildImagePlugins } from "../connectors/image/plugins/imageChain";
import { buildAnimatedImagePlugins } from "../connectors/animated_image/plugins/animated-image-chain";
import { createMetadataVoicePlugin } from "../connectors/tts/plugins/metadata-voice";
import { createReferenceImagesPlugin } from "../connectors/image/plugins/reference-images";
import { createDimensionsPlugin } from "../connectors/plugins/dimensions";
import { createVoiceHydratePlugin } from "../connectors/tts/plugins/voice-hydrate";
import { createVoiceSearchPlugin } from "../connectors/tts/plugins/voice-search";
import { scriptModePlugin } from "../connectors/llm/plugins/script-mode";
import { storyModePlugin } from "../connectors/llm/plugins/story-mode";
import { createTemplateModePlugin } from "../connectors/llm/plugins/template-mode";
import { createProjectMetadataPlugin } from "../connectors/llm/plugins/project-metadata";
import { createReferenceStylePlugin } from "../connectors/llm/plugins/reference-style";
import { createCharacterAvatarStylePlugin } from "../connectors/llm/plugins/character-avatar-style";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates/templates";
import { applyTemplate as applyTemplateToProject } from "@/lib/templates/applyTemplate";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";

import type { Mode } from "@/lib/project/types";

const MODE_PLUGIN_FACTORIES: Record<Mode, (templateId: string) => LLMPlugin> = {
	story: () => storyModePlugin,
	script: () => scriptModePlugin,
	template: (templateId) => createTemplateModePlugin(templateId),
};

type ConfigContextValue = {
	projectId: string;
	connectorConfig: ConnectorRegistry;
	mode: Mode;
	setMode: (mode: Mode) => void;
	selectedTemplateId: string;
	selectTemplate: (templateId: string) => void;
};

const [ConfigContext, useConfig] =
	createRequiredContext<ConfigContextValue>("ConfigProvider");
export { useConfig };

export function ConfigProvider({
	projectId,
	children,
}: {
	projectId: string;
	children: ReactNode;
}) {
	const queue = useGenerationQueue();
	const [mode, setMode] = useState<Mode>("story");
	const [selectedTemplateId, setSelectedTemplateId] =
		useState<string>(DEFAULT_TEMPLATE_ID);

	const configWithPlugins = useMemo<ConnectorRegistry>(() => {
		const modePlugin = MODE_PLUGIN_FACTORIES[mode](selectedTemplateId);
		const base = withRegistry(DEFAULT_CONNECTOR_REGISTRY)
			.appendPlugins(
				"llm",
				createProjectMetadataPlugin(projectId),
				modePlugin,
				createReferenceStylePlugin(projectId, queue),
				createCharacterAvatarStylePlugin(projectId, queue),
			)
			.appendPlugins("image", ...buildImagePlugins())
			.appendPlugins(
				"video",
				createReferenceImagesPlugin(),
				createDimensionsPlugin("video"),
			)
			.appendPlugins("tts", createMetadataVoicePlugin())
			.appendPlugins("tts", createVoiceSearchPlugin())
			.appendPlugins("tts", createVoiceHydratePlugin(projectId))
			.build();
		return withRegistry(base)
			.appendPlugins("animated_image", ...buildAnimatedImagePlugins(base))
			.build();
	}, [mode, selectedTemplateId, projectId, queue]);

	const selectTemplate = useCallback(
		(templateId: string) => {
			setSelectedTemplateId(templateId);
			applyTemplateToProject(projectId, templateId, queue, configWithPlugins);
			setMode("template");
		},
		[projectId, queue, configWithPlugins],
	);

	const value = useMemo<ConfigContextValue>(
		() => ({
			projectId,
			connectorConfig: configWithPlugins,
			mode,
			setMode,
			selectedTemplateId,
			selectTemplate,
		}),
		[
			projectId,
			configWithPlugins,
			mode,
			setMode,
			selectedTemplateId,
			selectTemplate,
		],
	);

	return <ConfigContext value={value}>{children}</ConfigContext>;
}
