import { useMemo, useState } from "react";
import { createEditor, Descendant } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import { withNodeId } from "../plugins/withNodeId";

const initialValue: Descendant[] = [];

export function useEditorSetup() {
  const editor = useMemo(
    () => withNodeId(withReact(withHistory(createEditor()))),
    [],
  );
  const [value, setValue] = useState<Descendant[]>(initialValue);

  return { editor, value, setValue };
}
