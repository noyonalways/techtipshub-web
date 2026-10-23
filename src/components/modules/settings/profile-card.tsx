"use client";

import { Avatar, Button } from "@heroui/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { toast } from "sonner";

interface IProps {
  fullName?: string;
  designation?: string;
  location?: string;
  bio?: string;
  username?: string;
  savedPicture?: string;
  selectedImage: File | null;
  onSelectImage: (file: File | null) => void;
}

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * The member's identity, shown the way readers see it — avatar, name,
 * designation, bio — with the photo controls beside it.
 *
 * The preview is the saved picture until a new file is picked, so nothing
 * changes on the public profile until "Save changes" is pressed.
 */
const ProfileCard = ({
  fullName,
  designation,
  location,
  bio,
  username,
  savedPicture,
  selectedImage,
  onSelectImage,
}: IProps) => {
  // A preview URL is already downloaded and decoded, so it can be built during
  // render instead of in an effect. The memo drops it when the file changes,
  // which frees the object URL at the same moment.
  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  );

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const [removed, setRemoved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the input so picking the same file again still fires a change.
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file (PNG or JPEG).", {
        id: "profile-image-type",
      });
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("That image is over 5 MB. Try a smaller one.", {
        id: "profile-image-size",
      });
      return;
    }

    setRemoved(false);
    onSelectImage(file);
  };

  const initials = (fullName || username || "?").charAt(0).toUpperCase();
  const photo = removed ? undefined : previewUrl || savedPicture;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
      <div className="flex shrink-0 items-start gap-3">
        <Avatar
          className="size-[5.5rem] shrink-0 text-2xl font-semibold"
          radius="full"
          src={photo}
          name={initials}
        />

        <div className="flex flex-col gap-1.5 sm:hidden">
          <PhotoButtons
            inputRef={inputRef}
            hasPhoto={!!photo}
            onChange={handleChange}
            onRemove={() => {
              setRemoved(true);
              onSelectImage(null);
            }}
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold tracking-tight">
          {fullName || "Your name"}
        </p>
        <p className="truncate text-sm text-default-600">
          {designation || "Add a designation"}
          {location ? ` · ${location}` : ""}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-default-600">
          {bio || "Add a short bio so readers know what you write about."}
        </p>

        <div className="mt-4 hidden items-center gap-3 sm:flex">
          <PhotoButtons
            inputRef={inputRef}
            hasPhoto={!!photo}
            onChange={handleChange}
            onRemove={() => {
              setRemoved(true);
              onSelectImage(null);
            }}
          />

          {username && (
            <Link
              href={`/profile/@${username}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-accessible underline-offset-4 hover:underline"
            >
              Preview profile
              <HiOutlineArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          )}
        </div>

        <p className="mt-2 text-xs text-default-600">
          Square image, at least 500 × 500 px, up to 5 MB.
          {selectedImage ? " Save changes to apply it." : ""}
        </p>
      </div>
    </div>
  );
};

function PhotoButtons({
  inputRef,
  hasPhoto,
  onChange,
  onRemove,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  hasPhoto: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <>
      <Button
        size="sm"
        radius="lg"
        variant="bordered"
        className="border border-default-300 font-medium text-foreground hover:bg-default-100"
        startContent={<FiCamera aria-hidden className="size-4" />}
        onPress={() => inputRef.current?.click()}
      >
        Change photo
      </Button>
      {hasPhoto && (
        <Button
          size="sm"
          radius="lg"
          variant="light"
          isIconOnly
          aria-label="Remove photo"
          onPress={onRemove}
        >
          <FiTrash2 aria-hidden className="size-4 text-danger" />
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        id="profilePicture"
        name="profilePicture"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onChange}
      />
    </>
  );
}

export default ProfileCard;
