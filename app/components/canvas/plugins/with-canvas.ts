import flow from "lodash/flow";
import type { CanvasEditor } from "@/lib/canvas/types";
import { withReact } from "slate-react";
import { withAssets } from "./with-assets";
import { withCharacterRefs } from "./with-character-refs";
import { withFlatPaste } from "./with-flat-paste";
import { withLayout } from "./with-layout";
import { withNodeId } from "./with-node-id";
import { withOSMLClipboard } from "./with-osml-clipboard";
import { withScenes } from "./with-scenes";

export const withCanvas: (editor: CanvasEditor) => CanvasEditor = flow(
	withReact,
	withLayout,
	withAssets,
	withCharacterRefs,
	withScenes,
	withFlatPaste,
	withNodeId,
	withOSMLClipboard,
);
