import { BLOB_BASE_URL } from "@/lib/blob";

export type ArtStyle = {
	description: string;
	/** Sample render, shown in the presets showcase. */
	thumbnail?: string;
};

const styleAsset = (name: string) =>
	`${BLOB_BASE_URL}/assets/upload/style/${name}`;

export const ART_STYLE_PRESETS: ArtStyle[] = [
	{
		thumbnail: styleAsset("oil-painting"),
		description:
			"Oil painting, visible brush strokes, thick impasto texture, rich layered pigment, warm gallery lighting, painterly edges, canvas grain",
	},
	{
		thumbnail: styleAsset("watercolour"),
		description:
			"Watercolour illustration, soft washes of pigment, wet-on-wet bleeds, visible paper texture, muted pastel palette, loose ink linework, generous white space",
	},
	{
		thumbnail: styleAsset("2d-cartoon"),
		description:
			"Flat 2D cartoon, bold black outlines of even weight, cel-shaded flat colors, simple rounded shapes, saturated palette, minimal background detail",
	},
	{
		thumbnail: styleAsset("claymation"),
		description:
			"Stop-motion claymation, handmade plasticine figures with visible fingerprints and tool marks, miniature set built from clay, soft studio lighting, shallow depth of field, tactile matte surfaces",
	},
	{
		thumbnail: styleAsset("anime"),
		description:
			"Anime illustration, clean cel shading, crisp ink linework, large expressive eyes, dramatic rim lighting, detailed painted backgrounds, vivid saturated palette",
	},
	{
		thumbnail: styleAsset("3d-animation"),
		description:
			"3D animated feature film still, stylized characters with soft rounded proportions, subsurface scattering on skin, global illumination, glossy highlights, shallow depth of field, warm cinematic color grade",
	},
	{
		thumbnail: styleAsset("photoreal"),
		description:
			"Photorealistic cinematic photography, full-frame camera, 35mm lens, shallow depth of field, natural volumetric lighting, filmic color grade, fine grain",
	},
	{
		thumbnail: styleAsset("pencil-sketch"),
		description:
			"Graphite pencil sketch, loose hatching and cross-hatching, smudged shading, visible construction lines, off-white sketchbook paper, monochrome",
	},
	{
		thumbnail: styleAsset("documentary"),
		description:
			"Straightforward documentary street photography, bright natural daylight, sharp candid realism, unfiltered urban color, handheld video-still quality.",
	},
	{
		thumbnail: styleAsset("inverted-stick-doodle"),
		description:
			"Simple flat vector cartoon, black background, bold white outlines, minimalist round-headed characters, limited flat color palette, crude expressive line-drawn faces.",
	},
	{
		thumbnail: styleAsset("hand-drawn-explainer"),
		description:
			"Whimsical hand-drawn explainer-video illustration, bold black ink outlines, flat minimal color accents, cute anthropomorphized objects, simple white background, playful educational style.",
	},
	{
		thumbnail: styleAsset("photorealistic-horror"),
		description:
			"Photorealistic horror-thriller still, dim moody blue-toned lighting, tense close-up cinematography, gritty desaturated color grade, intense emotional realism.",
	},
	{
		thumbnail: styleAsset("historical-oil-painting"),
		description:
			"Digitally painted historical illustration, classical oil-painting technique with hyperdetailed rendering, muted period color palette, dramatic naval composition, richly textured period costumes.",
	},
	{
		thumbnail: styleAsset("shinkai-anime"),
		description:
			"Makoto Shinkai-style anime illustration, luminous painterly backgrounds, crisp cel-shaded character linework, glowing natural light, richly detailed water and foliage textures.",
	},
	{
		thumbnail: styleAsset("phone-video"),
		description:
			"Fisheye phone-video still, harsh flash lighting against dark night background, candid AI-generated realism, slightly warped wide-angle distortion, low-fi social-media video aesthetic.",
	},
	{
		thumbnail: styleAsset("earthy-cinematic"),
		description:
			"Cinematic historical epic still, warm golden-hour haze, dramatic backlit silhouettes, grainy filmic texture, sweeping wide-angle composition, muted earthy tones.",
	},
	{
		thumbnail: styleAsset("photorealistic"),
		description:
			"Photorealistic digital render, cinematic corporate/editorial lighting, high detail, shallow depth of field, neutral-cool color grade, clean modern realism.",
	},
];
