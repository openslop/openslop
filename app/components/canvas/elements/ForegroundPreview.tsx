import { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import type { CanvasContentElement } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useGenerate } from "../hooks/useGenerate";
import { PlaceholderBalls, useStaticRotations } from "./OutputPreview";
import loaderStyles from "./OutputPreview.module.css";

export function ForegroundPreview({
  element,
}: {
  element: CanvasContentElement;
}) {
  const { result, generating } = useGenerate(element);
  const [loaded, setLoaded] = useState(false);
  const { outputKind } = ELEMENT_CONFIGS[element.type];
  const staticRotations = useStaticRotations();

  if (!result) {
    return (
      <div
        className={`relative w-full h-full rounded-lg overflow-hidden border bg-white/[0.03]`}
      >
        <div className={loaderStyles.containerLoader} aria-hidden="true">
          <PlaceholderBalls
            generating={generating}
            staticRotations={staticRotations}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden border`}>
      {outputKind === "image" ? (
        <Image
          src={result.url}
          alt="Scene preview"
          fill
          className="object-cover"
          unoptimized
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <video
          src={result.url}
          className="w-full h-full object-cover pointer-events-none"
          onLoadedData={() => setLoaded(true)}
        />
      )}
      {!loaded && (
        <Skeleton className="absolute inset-0 animate-none shimmer-surface" />
      )}
    </div>
  );
}
