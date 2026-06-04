"use client";

import {
	createContext,
	use,
	useCallback,
	useMemo,
	useState,
	type ReactNode,
} from "react";
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
import { buildImagePlugins } from "../connectors/image/plugins/imageChain";
import { buildAnimatedImagePlugins } from "../connectors/animated_image/plugins/animated-image-chain";
import { createMetadataVoicePlugin } from "../connectors/tts/plugins/metadata-voice";
import { createReferenceImagesPlugin } from "../connectors/image/plugins/reference-images";
import { createVoiceHydratePlugin } from "../connectors/tts/plugins/voice-hydrate";
import { createVoiceSearchPlugin } from "../connectors/tts/plugins/voice-search";
import { scriptModePlugin } from "../connectors/llm/plugins/script-mode";
import { osmlPlugin } from "../connectors/llm/plugins/osml";
import { storyModePlugin } from "../connectors/llm/plugins/story-mode";
import { createTemplateModePlugin } from "../connectors/llm/plugins/template-mode";
import { createProjectMetadataPlugin } from "../connectors/llm/plugins/project-metadata";
import { createReferenceStylePlugin } from "../connectors/llm/plugins/reference-style";
import { TEMPLATES } from "@/lib/templates/templates";
import * as template from "@/lib/templates/applyTemplate";
import { withRegistry } from "./connectorUtils";

import type { Mode } from "@/lib/project/types";

interface ModeContext {
	projectId: string;
	templateId?: string;
}

type ModePluginFactory = (ctx: ModeContext) => LLMPlugin;

const MODE_PLUGIN_FACTORIES: Record<Mode, ModePluginFactory> = {
	story: () => storyModePlugin,
	script: () => scriptModePlugin,
	template: ({ templateId }) => createTemplateModePlugin(templateId),
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
	animated_image: openslopConfig("Slop Image v1", IMAGE_MODELS),
	video: openslopConfig("Slop Video v1", VIDEO_MODELS),
	sfx: openslopConfig("Slop SFX v1", SFX_MODELS),
	music: openslopConfig("Slop Music v1", MUSIC_MODELS),
};

type ConfigContextValue = {
	projectId: string;
	connectorConfig: ConnectorRegistry;
	mode: Mode;
	setMode: (mode: Mode) => void;
	selectedTemplateId: string | undefined;
	applyTemplate: (templateId: string) => void;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig() {
	const ctx = use(ConfigContext);
	if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
	return ctx;
}

export function ConfigProvider({
	projectId,
	children,
}: {
	projectId: string;
	children: ReactNode;
}) {
	const [connectorConfig] = useState<ConnectorRegistry>(initialConnectorConfig);
	const [mode, setMode] = useState<Mode>("story");
	const [selectedTemplateId, setSelectedTemplateId] = useState<
		string | undefined
	>(TEMPLATES[0]?.id);

	const applyTemplate = useCallback(
		(templateId: string) => {
			setSelectedTemplateId(templateId);
			template.applyTemplate(projectId, templateId);
		},
		[projectId],
	);

	const configWithPlugins = useMemo<ConnectorRegistry>(() => {
		const modePlugin = MODE_PLUGIN_FACTORIES[mode]({
			projectId,
			templateId: selectedTemplateId,
		});
		const base = withRegistry(connectorConfig)
			.appendPlugins(
				"llm",
				createProjectMetadataPlugin(projectId),
				modePlugin,
				createReferenceStylePlugin(projectId),
			)
			.appendPlugins("image", ...buildImagePlugins(projectId))
			.appendPlugins("video", createReferenceImagesPlugin(projectId))
			.appendPlugins("tts", createMetadataVoicePlugin(projectId))
			.appendPlugins("tts", createVoiceSearchPlugin())
			.appendPlugins("tts", createVoiceHydratePlugin(projectId))
			.build();
		return withRegistry(base)
			.appendPlugins(
				"animated_image",
				...buildAnimatedImagePlugins(projectId, base),
			)
			.build();
	}, [connectorConfig, mode, selectedTemplateId, projectId]);

	const value = useMemo<ConfigContextValue>(
		() => ({
			projectId,
			connectorConfig: configWithPlugins,
			mode,
			setMode,
			selectedTemplateId,
			applyTemplate,
		}),
		[
			projectId,
			configWithPlugins,
			mode,
			setMode,
			selectedTemplateId,
			applyTemplate,
		],
	);

	return (
		<ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
	);
}
