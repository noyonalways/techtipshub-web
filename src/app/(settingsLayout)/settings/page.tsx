import AccountSummary from "@/components/modules/settings/account-summary";
import PageTitle from "@/components/modules/settings/page-title";
import UpdateProfileDetailsForm from "@/components/modules/settings/update-profile-details-form";
import UpdateSocialLinks from "@/components/modules/settings/update-social-links";
import { getProfileInfo } from "@/services/auth";
import { getAccountSummary } from "@/services/settings";
import { IUser } from "@/types";
import { Metadata } from "next";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your TechTips Hub profile settings.",
  keywords: "Profile, Settings, TechTips Hub",
};

/**
 * Account settings: who you are on TechTips Hub, what that account has
 * produced, and the links that hang off it.
 */
const SettingsPage = async () => {
  const [profileData, summary] = await Promise.all([
    getProfileInfo().catch(() => null),
    getAccountSummary().catch(() => null),
  ]);

  const user = (profileData?.data as IUser) ?? undefined;

  return (
    <div className="space-y-8">
      <PageTitle
        title="Your profile"
        description="The details readers see when they land on your profile or one of your articles."
        action={
          user?.username ? (
            <Link
              href={`/profile/@${user.username}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-default/60 px-3 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              View public profile
              <HiOutlineArrowRight aria-hidden className="size-3.5" />
            </Link>
          ) : undefined
        }
      />

      {!user?._id && (
        <div
          role="alert"
          className="rounded-xl border border-default/60 bg-default-50/60 px-4 py-3 text-sm text-default-600"
        >
          We could not load your account details.{" "}
          {profileData?.message ||
            "The fields below start empty — reload the page to try again."}
        </div>
      )}

      {summary && <AccountSummary summary={summary} />}

      <UpdateProfileDetailsForm {...user} articleCount={summary?.articles} />
      <UpdateSocialLinks socialLinks={user?.socialLinks} />
    </div>
  );
};

export default SettingsPage;
