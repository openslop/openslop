"use client";

import type { ComponentType } from "react";
import { isLayoutAttribute } from "@/lib/canvas/element-attributes";
import { elementSchema } from "@/lib/canvas/element-connector";
import type { GeneratedElement } from "@/lib/canvas/types";
import type { AttributeDef } from "@/lib/connectors/attributes/schema";
import { AttributeBadge } from "../elements/attribute-badge";
import type { LaidOutTarget } from "../elements/attributes/attribute-target";
import { ReferenceImagesEditor } from "../elements/attributes/reference-images-popover";
import { StartFrameOptions } from "../elements/attributes/start-frame-picker";
import { PanelSection } from "../panel/panel-card";

type Edit = NonNullable<AttributeDef["edit"]>["kind"];

/** Pictures need the room a popover gave them, so they lie flat under their label. */
const LAID_FLAT: Partial<Record<Edit, ComponentType<LaidOutTarget>>> = {
	images: ReferenceImagesEditor,
	frame: StartFrameOptions,
};

const laidFlat = (def: AttributeDef) => def.edit && LAID_FLAT[def.edit.kind];

const generationDefs = (element: GeneratedElement) =>
	elementSchema(element).settingsDefs.filter(
		(def) => !isLayoutAttribute(def.key),
	);

/** The pictures the generation starts from, each under its label. */
export function DraftPictures({ element }: { element: GeneratedElement }) {
	return generationDefs(element).map((def) => {
		const Flat = laidFlat(def);
		return (
			Flat && (
				<Flat
					key={def.key}
					element={element}
					attrKey={def.key}
					label={def.label}
					Section={PanelSection}
				/>
			)
		);
	});
}

/** Every other setting, as a row of menu buttons; layout belongs to a scene. */
export function DraftSettings({ element }: { element: GeneratedElement }) {
	const chips = generationDefs(element).filter((def) => !laidFlat(def));
	if (chips.length === 0) return null;
	return (
		<div className="flex flex-wrap gap-2">
			{chips.map((def) => (
				<AttributeBadge
					key={def.key}
					element={element}
					def={def}
					look="button"
				/>
			))}
		</div>
	);
}
