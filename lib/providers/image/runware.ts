import type { ImageGenerateParams } from "@/lib/connectors/types";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { BaseProvider, type WithMetadata } from "../base";
import { validateRunwareKey, withRunware } from "../runware";
import type { ImageProvider } from "./base";

type RawImageResult = {
	data: string;
	format: string;
} & WithMetadata;

// Runware defaults to JPG when the request names no format.
const OUTPUT_FORMAT = "PNG";

export class RunwareImage
	extends BaseProvider<ImageGenerateParams, RawImageResult>
	implements ImageProvider
{
	protected readonly blobConfig = { type: "image", provider: "runware" };
	private apiKey: string;

	constructor(apiKey: string) {
		super();
		this.apiKey = apiKey;
	}

	async validate() {
		return validateRunwareKey(this.apiKey);
	}

	protected toFiles(r: RawImageResult): BundleFile[] {
		return [
			{
				key: "image",
				filename: `output.${r.format}`,
				data: Buffer.from(r.data, "base64"),
				contentType: `image/${r.format}`,
			},
		];
	}

	protected async _generate(params: ImageGenerateParams) {
		return withRunware(this.apiKey, async (runware) => {
			const results = await runware.imageInference({
				positivePrompt: params.prompt,
				model: params.model || "bytedance:seedream@5.0-lite",
				width: params.width || 2848,
				height: params.height || 1600,
				outputType: "base64Data",
				outputFormat: OUTPUT_FORMAT,
				numberResults: 1,
				referenceImages: params.referenceImages,
			});

			const image = results?.[0];
			if (!image?.imageBase64Data) throw new Error("No image data returned");

			return {
				data: image.imageBase64Data,
				format: OUTPUT_FORMAT.toLowerCase(),
			};
		});
	}
}
