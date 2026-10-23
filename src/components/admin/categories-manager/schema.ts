import { z } from "zod";

/**
 * Mirrors the API: a name is required and trimmed, the description is optional
 * and capped. An empty description is never sent, because the API rejects one
 * that is present but blank.
 */
export const categoryValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give the category a name")
    .max(60, "Use 60 characters or fewer"),
  description: z.string().max(200, "Use 200 characters or fewer").optional(),
});

export type TCategoryForm = z.infer<typeof categoryValidationSchema>;
