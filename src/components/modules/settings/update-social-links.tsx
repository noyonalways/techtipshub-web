"use client";

import THForm from "@/components/form/th-from";
import THInput from "@/components/form/th-input";
import Loading from "@/components/loading";
import SettingsSaveBar from "@/components/modules/settings/settings-save-bar";
import SettingsSection from "@/components/modules/settings/settings-section";
import { useUpdateSocialLinks } from "@/hooks/user.hook";
import { TSocialLink, TSocialPlatform } from "@/types";
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
    label: "LinkedIn",
    hint: "linkedin.com/in/…",
    placeholder: "https://linkedin.com/in/username",
    icon: <FaLinkedin aria-hidden className="size-4" />,
  },
  {
    name: "github",
    platform: "Github",
    label: "GitHub",
    hint: "github.com/…",
    placeholder: "https://github.com/username",
    icon: <FaGithub aria-hidden className="size-4" />,
  },
  {
    name: "instagram",
    platform: "Instagram",
    label: "Instagram",
    hint: "instagram.com/…",
    placeholder: "https://instagram.com/username",
    icon: <FaInstagram aria-hidden className="size-4" />,
  },
  {
    name: "twitter",
    platform: "Twitter",
    label: "X / Twitter",
    hint: "x.com/…",
    placeholder: "https://x.com/username",
    icon: <BsTwitterX aria-hidden className="size-4" />,
  },
  {
    name: "facebook",
    platform: "Facebook",
    label: "Facebook",
    hint: "facebook.com/…",
    placeholder: "https://facebook.com/username",
    icon: <FaFacebook aria-hidden className="size-4" />,
  },
  {
    name: "youtube",
    platform: "Youtube",
    label: "YouTube",
    hint: "youtube.com/@…",
    placeholder: "https://youtube.com/@username",
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

  const savedCount = allowedSocialLinks.filter(
    (link) => defaultValues[link.name as keyof typeof defaultValues],
  ).length;

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    const updatedSocialLinks = allowedSocialLinks
      .map((link) => ({
        platform: link.platform as TSocialPlatform,
        // A pasted value often arrives with stray spaces; trim before saving.
        url: String(values[link.name] ?? "").trim(),
      }))
      .filter((link) => link.url);

    updateSocialLinks({ socialLinks: updatedSocialLinks });
  };

  return (
    <>
      {isPending && <Loading />}
      <THForm onSubmit={onSubmit} defaultValues={defaultValues}>
        <div className="space-y-6">
          <SettingsSection
            id="social-links"
            title="Social profiles"
            description="Linked from your public profile header. Leave a field empty to drop that link."
            action={
              <span className="text-xs tabular-nums text-default-500">
                {savedCount} of {allowedSocialLinks.length} linked
              </span>
            }
          >
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              {allowedSocialLinks.map((socialLink) => (
                <div key={socialLink.name}>
                  <label
                    htmlFor={socialLink.name}
                    className="mb-1 flex items-center justify-between gap-2 text-xs font-semibold text-default-600"
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden className="text-default-400">
                        {socialLink.icon}
                      </span>
                      {socialLink.label}
                    </span>
                    <span className="font-normal text-default-400">
                      {socialLink.hint}
                    </span>
                  </label>
                  <THInput
                    name={socialLink.name}
                    variant="bordered"
                    placeholder={socialLink.placeholder}
                    radius="lg"
                    id={socialLink.name}
                    type="url"
                    classNames={{ inputWrapper: "h-10" }}
                  />
                </div>
              ))}
            </div>
          </SettingsSection>

          <SettingsSaveBar
            isPending={isPending}
            hint="Saved links show their icon beside your name."
          >
            Save links
          </SettingsSaveBar>
        </div>
      </THForm>
    </>
  );
};

export default UpdateSocialLinks;
