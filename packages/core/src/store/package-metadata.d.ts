/**
 * Type shadow for {@link file://./package-metadata.js}. Consumers resolve this
 * declaration instead of compiling the JSON module import in the `.js`, which
 * keeps the import-attribute syntax out of downstream typechecking.
 */
export declare const packageMetadata: {
	name: string;
	version: string;
	description: string;
	homepage: string;
};
