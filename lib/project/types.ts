export type MetadataCharacter = {
	description: string;
	avatarUrl?: string;
};

export type Metadata = {
	style: string;
	characters: Record<string, MetadataCharacter>;
};
