import { schemaExtensions } from "./extensions";
import { SlashCommand } from "./slash-command";
import { SlashKeys } from "./slash-keys";

/**
 * The full editor: the document schema plus the interactive extensions.
 *
 * Separate from `extensions.ts` because `slash-command.ts` is a React client
 * module. Keeping it out of the schema file lets the schema be imported by
 * plain Node scripts (the round-trip verification) with no browser or React.
 */
export const editorExtensions = [...schemaExtensions, SlashCommand, SlashKeys];
