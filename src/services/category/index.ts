"use server";

import envConfig from "@/config/env.config";

/**
 * The public category list.
 *
 * Cached for an hour and tagged `categories`, so the feed's rail can share one
 * fetched list across requests instead of each visitor waiting on a request to
 * the API. Admin actions that change categories invalidate the tag.
 */
export const getCategories = async () => {
  try {
    const res = await fetch(`${envConfig.baseApi}/categories`, {
      next: {
        tags: ["categories"],
        revalidate: 3600,
      },
    });

    return res.json();
  } catch (err: any) {
    return err?.response?.data;
  }
};

/**
 * The old name, kept so existing imports keep working.
 * Prefer `getCategories`: the list is cacheable data, and the name should not
 * suggest otherwise.
 */
export const getAllCategories = getCategories;
