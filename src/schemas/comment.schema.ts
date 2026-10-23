import { z } from "zod";

export const commentValidationSchema = z.object({
  content: z
    .string({
      error: "Comment is required",
    })
    .min(1, "Comment is required"),
});
