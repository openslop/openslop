import { useState } from "react";
import { createEditor, Descendant } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import { useConfig } from "@/lib/config/ConfigProvider";
import { withNodeId } from "../plugins/withNodeId";
import { withLayout } from "../plugins/withLayout";

const initialValue: Descendant[] = [];

export function useEditorSetup() {
  const { connectorConfig } = useConfig();

  const [editor] = useState(() =>
    withNodeId(
      withLayout(connectorConfig)(withReact(withHistory(createEditor()))),
    ),
  );

  const [value, setValue] = useState<Descendant[]>(initialValue);

  return { editor, value, setValue };
}
