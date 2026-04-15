import { useEffect, useState } from "react";
import { createEditor, Descendant } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import { useConfig } from "@/lib/config/ConfigProvider";
import { withNodeId } from "../plugins/withNodeId";
import { withLayout, setLayoutConfig } from "../plugins/withLayout";

const initialValue: Descendant[] = [];

export function useEditorSetup() {
  const { connectorConfig } = useConfig();

  const [editor] = useState(() => {
    const ed = withNodeId(withLayout(withReact(withHistory(createEditor()))));
    setLayoutConfig(ed, connectorConfig);
    return ed;
  });

  useEffect(() => {
    setLayoutConfig(editor, connectorConfig);
  }, [editor, connectorConfig]);

  const [value, setValue] = useState<Descendant[]>(initialValue);

  return { editor, value, setValue };
}
