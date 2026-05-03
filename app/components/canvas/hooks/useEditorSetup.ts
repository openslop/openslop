import { useState } from "react";
import { createEditor, Descendant, Editor } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import { useConfig } from "@/lib/config/ConfigProvider";
import { withNodeId } from "../plugins/withNodeId";
import { withLayout } from "../plugins/withLayout";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";

const initialValue: Descendant[] = [];

export function useEditorSetup() {
	const { connectorConfig } = useConfig();

	const [editor] = useState(() => {
		const plugins: Array<(e: Editor) => Editor> = [
			withHistory,
			withReact,
			withLayout(connectorConfig),
			withScenes,
			withFlatPaste,
			withNodeId,
		];
		return plugins.reduce((e, plugin) => plugin(e), createEditor());
	});

	const [value, setValue] = useState<Descendant[]>(initialValue);

	return { editor, value, setValue };
}
