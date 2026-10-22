import { z } from "zod";

export const signUpValidationSchema = z.object({
  fullName: z
    .string({
      error: "Full Name is required",
    })
    .min(1, "Full Name is required")
    .trim(),
  email: z
    .email({
      error: "Email is required",
    })
    .trim(),
  username: z
    .string({
      error: "Username is required",
    })
    .min(1, "Username is required"),
  password: z
    .string({
      error: "Password is required",
    })
    .min(1, "Password is required"),
  dateOfBirth: z
    .object(
      { day: z.number(), month: z.number(), year: z.number() },
      { error: "Date of birth is required" }
    )
    .transform(({ day, month, year }) => {
      return `${year}-${month <= 9 ? "0" + month : month}-${
        day <= 9 ? "0" + day : day
      }`;
    }),
  gender: z
    .string({
      error: "Gender is required",
    })
    .min(1, "Gender is required"),
  image: z.any().optional(),
});

export const signInValidationSchema = z.object({
  email: z
    .email({
      error: "Email is required",
    })
    .trim(),
  password: z
    .string({
      error: "Password is required",
    })
    .min(1, "Password is required"),
});

export const passwordResetValidationSchema = z.object({
  email: z
    .email({
      error: "Email is required",
    })
    .trim(),
});
