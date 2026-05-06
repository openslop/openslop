"use client";

import { createContext, use, useMemo, useState, type ReactNode } from "react";
import type {
	ConnectorConfig,
	ConnectorPlugin,
	ConnectorType,
	LLMPlugin,
	ProviderKey,
} from "@/lib/connectors/types";
import { LLM_MODELS } from "@/lib/connectors/llm/openslop/models";
import { IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";
import { VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";
import { SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";
import { buildImagePlugins } from "../connectors/plugins/imageChain";
import { createMetadataVoicePlugin } from "../connectors/plugins/metadata-voice";
import { createReferenceImagesPlugin } from "../connectors/plugins/reference-images";
import { createVoiceSearchPlugin } from "../connectors/plugins/voice-search";
import { scriptModePlugin } from "../connectors/plugins/script-mode";
import { osmlPlugin } from "../connectors/plugins/osml";
import { storyModePlugin } from "../connectors/plugins/story-mode";
import { createTemplateModePlugin } from "../connectors/plugins/template-mode";
import { TEMPLATES } from "../templates/templates";
import { withRegistry } from "./connectorUtils";

export type ComposerMode = "story" | "script" | "template";

const MODE_PLUGINS: Record<"story" | "script", LLMPlugin> = {
	story: storyModePlugin,
	script: scriptModePlugin,
};

export type ConnectorRegistry = Record<
	ConnectorType,
	Record<ProviderKey, ConnectorConfig>
>;

const openslopConfig = (
	defaultModel: string,
	models: Record<string, unknown>,
	plugins?: ConnectorPlugin[],
): Record<ProviderKey, ConnectorConfig> => ({
	openslop: {
		defaultModel,
		models: Object.keys(models),
		isDefault: true,
		apiKey: "",
		...(plugins && { plugins }),
	},
});

const initialConnectorConfig: ConnectorRegistry = {
	llm: openslopConfig("Slop LLM v1", LLM_MODELS, [osmlPlugin]),
	tts: openslopConfig("Slop TTS v1", TTS_MODELS),
	image: openslopConfig("Slop Image v1", IMAGE_MODELS),
	video: openslopConfig("Slop Video v1", VIDEO_MODELS),
	sfx: openslopConfig("Slop SFX v1", SFX_MODELS),
	music: openslopConfig("Slop Music v1", MUSIC_MODELS),
};

// TODO: replace with real project ID after projects rollout
const MOCK_PROJECT_ID = "00000000-0000-4000-8000-000000000001";

type ConfigContextValue = {
	projectId: string;
	connectorConfig: ConnectorRegistry;
	composerMode: ComposerMode;
	selectedTemplateId: string | null;
	setConnectorConfig: React.Dispatch<React.SetStateAction<ConnectorRegistry>>;
	setComposerMode: React.Dispatch<React.SetStateAction<ComposerMode>>;
	setSelectedTemplateId: React.Dispatch<React.SetStateAction<string | null>>;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig() {
	const ctx = use(ConfigContext);
	if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
	return ctx;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
	const projectId = MOCK_PROJECT_ID;
	const [connectorConfig, setConnectorConfig] = useState<ConnectorRegistry>(
		initialConnectorConfig,
	);
	const [composerMode, setComposerMode] = useState<ComposerMode>("story");
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		TEMPLATES[0]?.id ?? null,
	);

	const configWithPlugins = useMemo<ConnectorRegistry>(() => {
		const modePlugin =
			composerMode === "template"
				? createTemplateModePlugin(selectedTemplateId)
				: MODE_PLUGINS[composerMode];
		return withRegistry(connectorConfig)
			.appendPlugins("llm", modePlugin)
			.appendPlugins("image", ...buildImagePlugins(projectId))
			.appendPlugins("video", createReferenceImagesPlugin(projectId))
			.appendPlugins("tts", createMetadataVoicePlugin(projectId))
			.appendPlugins("tts", createVoiceSearchPlugin())
			.build();
	}, [connectorConfig, composerMode, selectedTemplateId, projectId]);

	const value = useMemo<ConfigContextValue>(
		() => ({
			projectId,
			connectorConfig: configWithPlugins,
			composerMode,
			selectedTemplateId,
			setConnectorConfig,
			setComposerMode,
			setSelectedTemplateId,
		}),
		[projectId, configWithPlugins, composerMode, selectedTemplateId],
	);

	return (
		<ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
	);
}
