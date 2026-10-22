"use client";

import Loading from "@/components/loading";
import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import THTextarea from "@/components/form/th-textarea";
import { useUpdateProfile } from "@/hooks/user.hook";
import { IUser } from "@/types";
import { Avatar, Button } from "@heroui/react";
import { useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { GoImage } from "react-icons/go";

interface IProps extends Partial<IUser> {}

const fieldLabel =
  "mb-1 block text-xs font-semibold uppercase tracking-wider text-default-500";

const UpdateProfileDetailsForm = ({
  fullName,
  designation,
  location,
  phone,
  bio,
  profilePicture,
}: IProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(profilePicture);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(values));
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    updateProfile(formData);
  };

  return (
    <>
      {isPending && <Loading />}
      <THForm
        onSubmit={onSubmit}
        defaultValues={{ fullName, designation, location, phone, bio }}
      >
        <div className="space-y-8">
          {/* Identity */}
          <section aria-labelledby="profile-identity">
            <h2 id="profile-identity" className="text-sm font-semibold">
              Profile photo
            </h2>
            <p className="mt-1 text-sm text-default-500">
              Shown beside your name on articles and comments.
            </p>

            <div className="mt-4 flex flex-col gap-4 border-b border-default/60 pb-8 sm:flex-row sm:items-center sm:gap-6">
              <Avatar
                className="size-20 shrink-0 object-cover text-2xl font-bold"
                radius="full"
                src={previewImage}
                name={(fullName || "?").charAt(0).toUpperCase()}
              />
              <div className="space-y-1.5">
                <Button
                  as="label"
                  size="sm"
                  htmlFor="profilePicture"
                  radius="lg"
                  variant="bordered"
                  className="cursor-pointer font-medium"
                  startContent={<GoImage size={16} />}
                >
                  Choose image
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Button>
                <p className="text-xs text-default-500">
                  Square image, at least 500 × 500 px. PNG or JPEG.
                </p>
              </div>
            </div>
          </section>

          {/* Details */}
          <section aria-labelledby="profile-details">
            <h2 id="profile-details" className="text-sm font-semibold">
              Public details
            </h2>
            <p className="mt-1 text-sm text-default-500">
              These appear on your profile and next to your articles.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                />
              </div>
              <div className="sm:col-span-2">
                <label className={fieldLabel}>Bio</label>
                <THTextarea
                  name="bio"
                  variant="bordered"
                  placeholder="A short introduction — what you work on, what you write about."
                  radius="lg"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-default/60 pt-5">
              <Button
                radius="lg"
                color="primary"
                className="font-semibold"
                type="submit"
              >
                Save changes
              </Button>
            </div>
          </section>
        </div>
      </THForm>
    </>
  );
};

export default UpdateProfileDetailsForm;
