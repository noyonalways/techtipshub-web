"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import Loading from "@/components/loading";
import { useUpdateSocialLinks } from "@/hooks/user.hook";
import { TSocialLink, TSocialPlatform } from "@/types";
import { Button } from "@heroui/react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { BsTwitterX } from "react-icons/bs";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";

interface IProps {
  /** Missing for accounts that have never saved a link. */
  socialLinks?: TSocialLink[];
}

const allowedSocialLinks = [
  {
    name: "linkedin",
    platform: "Linkedin",
    placeholder: "https://linkedin.com/in/username",
    icon: <FaLinkedin aria-hidden className="size-4" />,
  },
  {
    name: "github",
    platform: "Github",
    placeholder: "https://github.com/username",
    icon: <FaGithub aria-hidden className="size-4" />,
  },
  {
    name: "instagram",
    platform: "Instagram",
    placeholder: "https://instagram.com/username",
    icon: <FaInstagram aria-hidden className="size-4" />,
  },
  {
    name: "twitter",
    platform: "Twitter",
    placeholder: "https://twitter.com/username",
    icon: <BsTwitterX aria-hidden className="size-4" />,
  },
  {
    name: "facebook",
    platform: "Facebook",
    placeholder: "https://facebook.com/username",
    icon: <FaFacebook aria-hidden className="size-4" />,
  },
  {
    name: "youtube",
    platform: "Youtube",
    placeholder: "https://youtube.com/channel/@username",
    icon: <FaYoutube aria-hidden className="size-4" />,
  },
];

const UpdateSocialLinks = ({ socialLinks = [] }: IProps) => {
  const { mutate: updateSocialLinks, isPending } = useUpdateSocialLinks();

  const links = Array.isArray(socialLinks) ? socialLinks : [];

  const defaultValues = {
    linkedin: links.find((link) => link.platform === "Linkedin")?.url || "",
    github: links.find((link) => link.platform === "Github")?.url || "",
    instagram: links.find((link) => link.platform === "Instagram")?.url || "",
    twitter: links.find((link) => link.platform === "Twitter")?.url || "",
    facebook: links.find((link) => link.platform === "Facebook")?.url || "",
    youtube: links.find((link) => link.platform === "Youtube")?.url || "",
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
      <section id="social-links" className="scroll-mt-24">
        <h2 className="text-sm font-semibold">Social profiles</h2>
        <p className="mt-1 text-sm text-default-500">
          Links saved here appear in your public profile header. Empty fields
          are removed.
        </p>

        <THForm onSubmit={onSubmit} defaultValues={defaultValues}>
          <div className="mt-5 space-y-4">
            {allowedSocialLinks.map((socialLink) => (
              <div key={socialLink.name}>
                <label
                  htmlFor={socialLink.name}
                  className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-default-500"
                >
                  <span aria-hidden className="text-default-400">
                    {socialLink.icon}
                  </span>
                  {socialLink.platform}
                </label>
                <THInput
                  name={socialLink.name}
                  variant="bordered"
                  placeholder={socialLink.placeholder}
                  radius="lg"
                  id={socialLink.name}
                />
              </div>
            ))}

            <div className="flex justify-end border-t border-default/60 pt-5">
              <Button
                radius="lg"
                color="primary"
                className="font-semibold"
                type="submit"
              >
                Save links
              </Button>
            </div>
          </div>
        </THForm>
      </section>
    </>
  );
};

export default UpdateSocialLinks;
