"use client";

import { createContext, use, type ReactNode } from "react";
import type { Editor } from "slate";
import type { VideoLayout } from "@/lib/video/types";
import { useAssetPrefetch } from "./useAssetPrefetch";
import { useVideoLayout } from "./useVideoLayout";

const VideoLayoutContext = createContext<VideoLayout | null>(null);

export function VideoLayoutProvider({
  getEditor,
  structureKey,
  children,
}: {
  getEditor: () => Editor | null;
  structureKey: string;
  children: ReactNode;
}) {
  const layout = useVideoLayout(getEditor, structureKey);
  useAssetPrefetch(layout);
  return <VideoLayoutContext value={layout}>{children}</VideoLayoutContext>;
}

export function useLayout() {
  return use(VideoLayoutContext);
}
