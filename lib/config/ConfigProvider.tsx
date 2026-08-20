"use client";

import { useMemo, type ReactNode } from "react";
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
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";

type ConfigContextValue = {
	projectId: string;
	connectorConfig: ConnectorRegistry;
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
	const store = useProjectStoreHandle();

	const configWithPlugins = useMemo<ConnectorRegistry>(() => {
		return withRegistry(DEFAULT_CONNECTOR_REGISTRY)
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
	}, [store]);

	const value = useMemo<ConfigContextValue>(
		() => ({ projectId, connectorConfig: configWithPlugins }),
		[projectId, configWithPlugins],
	);

	return <ConfigContext value={value}>{children}</ConfigContext>;
}
