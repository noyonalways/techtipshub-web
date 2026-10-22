"use client";

import { useState } from "react";
import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import THTextarea from "@/components/form/th-textarea";
import { IUser } from "@/types";
import {
  Avatar,
  Button,
} from "@heroui/react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { GoImage } from "react-icons/go";
import { useUpdateProfile } from "@/hooks/user.hook";
import Loading from "@/components/loading";

interface IProps extends IUser {}

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

    //! this for development purpose just for checking the data
    // console.log(Object.fromEntries(formData));
  };

  return (
    <>
      {isPending && <Loading />}
      <THForm
        onSubmit={onSubmit}
        defaultValues={{ fullName, designation, location, phone, bio }}
      >
        <div className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="profilePicture" className="block font-medium">
              Profile Image
            </label>
            <div className="border-default/70 p-4 rounded-xl border-2 flex items-center space-x-4">
              <Avatar
                className="w-28 h-28 lg:size-28 object-cover text-3xl font-bold"
                radius="full"
                src={previewImage}
                color="primary"
              />
              <div className="flex flex-col space-y-2 items-center">
                <Button
                  as="label"
                  size="sm"
                  htmlFor="profilePicture"
                  radius="full"
                  variant="solid"
                  color="primary"
                  startContent={<GoImage size={18} />}
                >
                  Change Image
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Button>
                <p className="text-xs">PNG, JPEG: 500 x 500</p>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="fullName" className="block font-medium">
              Full Name
            </label>
            <THInput
              name="fullName"
              variant="bordered"
              placeholder="Full Name"
              size="lg"
              radius="md"
              id="fullName"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="designation" className="block font-medium">
              Designation
            </label>
            <THInput
              name="designation"
              variant="bordered"
              placeholder="Designation"
              size="lg"
              radius="md"
              id="designation"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="location" className="block font-medium">
              Location
            </label>
            <THInput
              name="location"
              variant="bordered"
              placeholder="Location"
              size="lg"
              radius="md"
              id="location"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="phone" className="block font-medium">
              Phone
            </label>
            <THInput
              name="phone"
              variant="bordered"
              placeholder="Phone"
              size="lg"
              radius="md"
              id="phone"
            />
          </div>
          <div className="space-y-1">
            <label className="block font-medium">Profile Bio</label>
            <THTextarea
              name="bio"
              variant="bordered"
              placeholder="Bio..."
              size="lg"
              radius="md"
            />
          </div>
          <div className="flex justify-end">
            <Button radius="full" color="primary" variant="solid" type="submit">
              Update Details
            </Button>
          </div>
        </div>
      </THForm>
    </>
  );
};

export default UpdateProfileDetailsForm;
