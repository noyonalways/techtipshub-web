"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import Loading from "@/components/loading";
import { useUpdateSocialLinks } from "@/hooks/user.hook";
import { TSocialLink, TSocialPlatform } from "@/types";
import { Button, Divider } from "@heroui/react";
import { FieldValues, SubmitHandler } from "react-hook-form";

interface IProps {
  socialLinks: TSocialLink[];
}

const allowedSocialLinks = [
  {
    name: "linkedin",
    platform: "Linkedin",
    placeholder: "https://linkedin.com/in/username",
  },
  {
    name: "github",
    platform: "Github",
    placeholder: "https://github.com/username",
  },
  {
    name: "instagram",
    platform: "Instagram",
    placeholder: "https://instagram.com/username",
  },
  {
    name: "twitter",
    platform: "Twitter",
    placeholder: "https://twitter.com/username",
  },
  {
    name: "facebook",
    platform: "Facebook",
    placeholder: "https://facebook.com/username",
  },
  {
    name: "youtube",
    platform: "Youtube",
    placeholder: "https://youtube.com/channel/@username",
  },
];

const UpdateSocialLinks = ({ socialLinks }: IProps) => {
  const { mutate: updateSocialLinks, isPending } = useUpdateSocialLinks();

  const defaultValues = {
    linkedin:
      socialLinks.find((link) => link.platform === "Linkedin")?.url || "",
    github: socialLinks.find((link) => link.platform === "Github")?.url || "",
    instagram:
      socialLinks.find((link) => link.platform === "Instagram")?.url || "",
    twitter: socialLinks.find((link) => link.platform === "Twitter")?.url || "",
    facebook:
      socialLinks.find((link) => link.platform === "Facebook")?.url || "",
    youtube: socialLinks.find((link) => link.platform === "Youtube")?.url || "",
  };

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    const updatedSocialLinks = allowedSocialLinks
      .map((link) => ({
        platform: link.platform as TSocialPlatform,
        url: values[link.name] as string,
      }))
      .filter((link) => link.url);

    updateSocialLinks({ socialLinks: updatedSocialLinks });
  };

  return (
    <>
      {isPending && <Loading />}
      <div className="py-5" id="social-links">
        <div className="space-y-1 my-6">
          <h1 className="text-xl font-bold">Social Profiles</h1>
          <p className="pb-4 text-default-500">
            The social links you add here will show up on your profile.
          </p>
          <Divider className="bg-default/50" />
        </div>

        <THForm onSubmit={onSubmit} defaultValues={defaultValues}>
          <div className="space-y-6">
            {allowedSocialLinks.map((socialLink) => (
              <div key={socialLink.name} className="space-y-1">
                <label htmlFor={socialLink.name} className="block font-medium">
                  {socialLink.platform}
                </label>
                <THInput
                  name={socialLink.name}
                  variant="bordered"
                  placeholder={socialLink.placeholder}
                  size="lg"
                  radius="sm"
                  id={socialLink.name}
                />
              </div>
            ))}

            <div className="flex justify-end">
              <Button
                radius="full"
                color="primary"
                variant="solid"
                type="submit"
              >
                Update Links
              </Button>
            </div>
          </div>
        </THForm>
      </div>
    </>
  );
};

export default UpdateSocialLinks;
