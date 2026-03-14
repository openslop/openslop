import { useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { Editable, Slate, withReact } from "slate-react";
import { renderStoryElement } from "../elements/ElementRenderer";
import styles from "../styles/sortable.module.css";

export function DragOverlayContent({ element }: { element: Descendant }) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const value = useMemo<Descendant[]>(
    () => [structuredClone(element)],
    [element],
  );

  return (
    <div className={styles.dragOverlay}>
      <Slate editor={editor} initialValue={value}>
        <button className={`flex items-center ${styles.dragButton}`}>⠿</button>
        <Editable
          readOnly={true}
          renderElement={renderStoryElement}
          className="text-xl leading-relaxed text-center break-all"
        />
      </Slate>
    </div>
  );
}
