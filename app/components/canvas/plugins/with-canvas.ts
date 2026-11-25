import flow from "lodash/flow";
import type { CanvasEditor } from "@/lib/canvas/types";
import { withReact } from "slate-react";
import { withAssets } from "./with-assets";
import { withNameRefs } from "./with-name-refs";
import { withFlatPaste } from "./with-flat-paste";
import { withLayout } from "./with-layout";
import { withNodeId } from "./with-node-id";
import { withOSMLClipboard } from "./with-osml-clipboard";
import { withScenes } from "./with-scenes";

export const withCanvas: (editor: CanvasEditor) => CanvasEditor = flow(
	withReact,
	withLayout,
	withAssets,
	withNameRefs,
	withScenes,
	withFlatPaste,
	withNodeId,
	withOSMLClipboard,
);
