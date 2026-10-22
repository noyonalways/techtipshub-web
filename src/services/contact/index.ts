"use server";

import envConfig from "@/config/env.config";

export type TContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
};

/**
 * Submit the public contact form. Resolves to `{ success, message }`; it never
 * throws, so the client can present a precise result.
 */
export const submitContactForm = async (payload: TContactPayload) => {
  try {
    const res = await fetch(`${envConfig.baseApi}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message:
          data?.message ||
          "We could not send your message. Please try again shortly.",
      };
    }

    return {
      success: true,
      message: "Thanks — your message is on its way. We will reply by email.",
    };
  } catch {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
};
