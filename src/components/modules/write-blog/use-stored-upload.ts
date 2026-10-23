"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A picked cover kept alive across reloads.
 *
 * `File` objects cannot be stored, so the bytes are held as a Blob in
 * IndexedDB, which is what lets a reload come back to the cover the writer
 * chose instead of an empty strip. Storage is best-effort throughout: private
 * modes and full quotas just mean the cover is lost on reload, as before.
 */

/** A remembered cover older than this is dropped. */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const root =
  typeof window !== "undefined" && "indexedDB" in window ? window : undefined;

let dbPromise: Promise<IDBDatabase | null> | null = null;

const openDb = () => {
  if (!root) return Promise.resolve(null);
  dbPromise ??= new Promise<IDBDatabase | null>((resolve) => {
    try {
      const request = root.indexedDB.open("tth-editor", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("uploads")) {
          db.createObjectStore("uploads");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
};

const settled = <T,>(request: IDBRequest<T>) =>
  new Promise<T | null>((resolve) => {
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => resolve(null);
  });

interface StoredUpload {
  blob: Blob;
  name: string;
  savedAt: number;
}

/** Stores (or clears, with null) the cover for `key`. */
export const writeUpload = async (key: string, file: File | null) => {
  const db = await openDb();
  if (!db) return;
  try {
    const store = db.transaction("uploads", "readwrite").objectStore("uploads");
    if (file) {
      await settled(
        store.put(
          {
            blob: file,
            name: file.name,
            savedAt: Date.now(),
          } satisfies StoredUpload,
          key,
        ),
      );
    } else {
      await settled(store.delete(key));
    }
  } catch {
    // Quota, or storage blocked: the cover is simply not kept.
  }
};

const readUpload = async (key: string): Promise<File | null> => {
  const db = await openDb();
  if (!db) return null;
  try {
    const stored = await settled<StoredUpload>(
      db.transaction("uploads", "readonly").objectStore("uploads").get(key),
    );
    if (!stored?.blob) return null;
    if (Date.now() - stored.savedAt > MAX_AGE_MS) {
      void writeUpload(key, null);
      return null;
    }
    return new File([stored.blob], stored.name || "cover", {
      type: stored.blob.type,
    });
  } catch {
    return null;
  }
};

/**
 * The cover being edited: the file in state, restored from storage on load,
 * and written back whenever the caller says it is worth keeping.
 *
 * `storageKey` is what the cover belongs to (the composer's draft), so two
 * tabs on different drafts cannot steal each other's image. The editor passes
 * its blog key and `remember: false`, because a cover picked while editing is
 * only real once the blog is saved — the caller then calls `remember()`.
 */
export const useStoredUpload = (
  storageKey: string | null,
  { remember = true }: { remember?: boolean } = {},
) => {
  const [file, setFileState] = useState<File | null>(null);
  // The state value is not readable before the next render; the restore below
  // needs to know whether the writer has already picked something.
  const picked = useRef(false);

  useEffect(() => {
    if (!storageKey || !remember) return;
    let cancelled = false;
    readUpload(storageKey).then((stored) => {
      if (cancelled || picked.current || !stored) return;
      setFileState(stored);
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey, remember]);

  const setFile = (next: File | null) => {
    picked.current = true;
    setFileState(next);
    // Clearing is real intent: forget the stored copy now. A new file is
    // written by the caller through `sync`.
    if (storageKey && remember && !next) void writeUpload(storageKey, null);
  };

  /** Writes the current state to storage (null clears it). */
  const sync = (next: File | null) =>
    storageKey && remember
      ? writeUpload(storageKey, next)
      : Promise.resolve();

  return { file, setFile, sync };
};

/** A preview URL that is revoked when it is replaced or the screen closes. */
export const useObjectUrl = (file: Blob | null) => {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);
  return url;
};
