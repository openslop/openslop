"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import {
	DEFAULT_CONNECTOR_REGISTRY,
	withRegistry,
	type ConnectorRegistry,
} from "@/lib/connectors/registry";
import { buildImagePlugins } from "../connectors/image/plugins/imageChain";
import { buildAnimatedImagePlugins } from "../connectors/animated_image/plugins/animated-image-chain";
import { createMetadataVoicePlugin } from "../connectors/tts/plugins/metadata-voice";
import { createReferenceImagesPlugin } from "../connectors/image/plugins/reference-images";
import { createDimensionsPlugin } from "../connectors/plugins/dimensions";
import { createVoiceHydratePlugin } from "../connectors/tts/plugins/voice-hydrate";
import { createVoiceSearchPlugin } from "../connectors/tts/plugins/voice-search";
import { projectMetadataPlugin } from "../connectors/llm/plugins/project-metadata";
import { createReferenceStylePlugin } from "../connectors/llm/plugins/reference-style";
import { createCharacterAvatarStylePlugin } from "../connectors/llm/plugins/character-avatar-style";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates/templates";
import { applyTemplate as applyTemplateToProject } from "@/lib/templates/applyTemplate";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";

import type { Mode } from "@/lib/project/types";
import { modePlugins } from "./modes";

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
	const store = useProjectStoreHandle();
	const [mode, setMode] = useState<Mode>("story");
	const [selectedTemplateId, setSelectedTemplateId] =
		useState<string>(DEFAULT_TEMPLATE_ID);

	const configWithPlugins = useMemo<ConnectorRegistry>(() => {
		return withRegistry(DEFAULT_CONNECTOR_REGISTRY)
			.appendPlugins(
				"llm",
				projectMetadataPlugin,
				...modePlugins(mode, selectedTemplateId),
				createReferenceStylePlugin(store, queue),
				createCharacterAvatarStylePlugin(queue),
			)
			.appendPlugins("image", ...buildImagePlugins())
			.appendPlugins(
				"video",
				createReferenceImagesPlugin(),
				createDimensionsPlugin("video"),
			)
			.appendPlugins("tts", createMetadataVoicePlugin())
			.appendPlugins("tts", createVoiceSearchPlugin())
			.appendPlugins("tts", createVoiceHydratePlugin(store))
			.appendPlugins("animated_image", ...buildAnimatedImagePlugins())
			.build();
	}, [mode, selectedTemplateId, store, queue]);

	const selectTemplate = useCallback(
		(templateId: string) => {
			setSelectedTemplateId(templateId);
			applyTemplateToProject(store, templateId, queue, configWithPlugins);
			setMode("template");
		},
		[store, queue, configWithPlugins],
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
