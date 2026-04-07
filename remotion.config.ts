import path from "path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.overrideWebpackConfig((currentConfig) => ({
  ...enableTailwind(currentConfig),
  resolve: {
    ...currentConfig.resolve,
    alias: {
      ...(currentConfig.resolve?.alias ?? {}),
      "@": path.resolve(process.cwd()),
    },
  },
}));
