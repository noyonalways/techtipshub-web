"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import THTextarea from "@/components/form/th-textarea";
import Loading from "@/components/loading";
import ProfileCard from "@/components/modules/settings/profile-card";
import SettingsSaveBar from "@/components/modules/settings/settings-save-bar";
import SettingsSection from "@/components/modules/settings/settings-section";
import { useUpdateProfile } from "@/hooks/user.hook";
import { IUser } from "@/types";
import Link from "next/link";
import { useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { HiOutlineArrowRight } from "react-icons/hi2";

interface IProps extends Partial<IUser> {
  /** Total articles, shown in the photo card's context line. */
  articleCount?: number;
}

const fieldLabel =
  "mb-1 block text-xs font-semibold uppercase tracking-wider text-default-500";

const MAX_BIO = 280;

const UpdateProfileDetailsForm = ({
  fullName,
  username,
  designation,
  location,
  phone,
  bio,
  profilePicture,
  articleCount,
}: IProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(values));

    // The photo is part of the same save. Sending it only when one was picked
    // keeps the stored image untouched otherwise — but it must be sent at all,
    // or the reader has to press save twice to see it.
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    updateProfile(formData, {
      onSuccess: (data) => {
        // Start a clean state only once the server accepted the change.
        if (data?.success) setSelectedImage(null);
      },
    });
  };

  return (
    <>
      {isPending && <Loading />}
      <THForm
        onSubmit={onSubmit}
        defaultValues={{ fullName, designation, location, phone, bio }}
      >
        <div className="space-y-6">
          <SettingsSection
            id="identity"
            title="Identity"
            description="How you look on your profile, articles and comments."
            action={
              username ? (
                <Link
                  href={`/profile/@${username}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  View public profile
                  <HiOutlineArrowRight aria-hidden className="size-3.5" />
                </Link>
              ) : undefined
            }
          >
            <ProfileCard
              fullName={fullName}
              designation={designation}
              location={location}
              bio={bio}
              username={username}
              savedPicture={profilePicture}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
            />
            {typeof articleCount === "number" && articleCount > 0 && (
              <p className="mt-5 border-t border-default/60 pt-4 text-xs text-default-500">
                Your name and photo appear on{" "}
                <Link
                  href="/settings/manage-blogs"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  {articleCount} published{" "}
                  {articleCount === 1 ? "article" : "articles"}
                </Link>
                .
              </p>
            )}
          </SettingsSection>

          <SettingsSection
            id="details"
            title="Public details"
            description="Shown on your profile and next to every article you write."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="fullName" className={fieldLabel}>
                  Full name
                </label>
                <THInput
                  name="fullName"
                  variant="bordered"
                  placeholder="Your name"
                  radius="lg"
                  id="fullName"
                />
              </div>
              <div>
                <label htmlFor="designation" className={fieldLabel}>
                  Designation
                </label>
                <THInput
                  name="designation"
                  variant="bordered"
                  placeholder="e.g. Full-stack developer"
                  radius="lg"
                  id="designation"
                />
              </div>
              <div>
                <label htmlFor="location" className={fieldLabel}>
                  Location
                </label>
                <THInput
                  name="location"
                  variant="bordered"
                  placeholder="City, country"
                  radius="lg"
                  id="location"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phone" className={fieldLabel}>
                  Phone
                </label>
                <THInput
                  name="phone"
                  variant="bordered"
                  placeholder="Never shown publicly"
                  radius="lg"
                  id="phone"
                  description="For account recovery only — readers never see it."
                />
              </div>
              <div className="sm:col-span-2">
                <label className={fieldLabel} htmlFor="bio">
                  Bio
                </label>
                <THTextarea
                  name="bio"
                  variant="bordered"
                  placeholder="A short introduction — what you work on, what you write about."
                  radius="lg"
                  id="bio"
                  maxLength={MAX_BIO}
                  description={`A sentence or two reads best. ${MAX_BIO} characters max.`}
                />
              </div>
            </div>
          </SettingsSection>

          <SettingsSaveBar
            isPending={isPending}
            filePending={!!selectedImage}
            hint="Changes appear on your public profile right away."
          >
            Save changes
          </SettingsSaveBar>
        </div>
      </THForm>
    </>
  );
};

export default UpdateProfileDetailsForm;
