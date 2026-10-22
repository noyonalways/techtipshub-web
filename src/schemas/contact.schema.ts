import { z } from "zod";

export const contactFormValidationSchema = z.object({
  firstName: z
    .string({
      error: "First name is required",
    })
    .min(1, "First name is required"),
  lastName: z
    .string({
      error: "Last name is required",
    })
    .min(1, "Last name is required"),
  email: z
    .email({
      error: "Email is required",
    })
    .min(1, "Email is required"),
  subject: z
    .string({
      error: "Subject is required",
    })
    .min(1, "Subject is required"),
  message: z
    .string({
      error: "Message is required",
    })
    .min(1, "Message is required"),
});
