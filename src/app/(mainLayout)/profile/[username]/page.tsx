import AdBanner from "@/components/adsense/ad-banner";
import ProfileHeader from "@/components/modules/profile/profile-header";
import ProfileArticleList from "@/components/modules/profile/profile-article-list";
import ButtonLink from "@/components/ui/button-link";
import Container from "@/components/ui/container";
import EditProfileDropdown from "@/components/ui/edit-profile-dropdown";
import ProfileShareDropdown from "@/components/ui/profile-share-dropdown";
import { getProfileInfo } from "@/services/auth";
import { getPostsByUserId } from "@/services/post";
import { IPost, IUser } from "@/types";
import { Metadata } from "next";
import { BiSupport } from "react-icons/bi";

/** Articles requested on the first paint; the rest load a page at a time. */
const PROFILE_PAGE_SIZE = 8;

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username: routeUsername } = await params;
  const profileData = await getProfileInfo().catch(() => null);
  const { fullName } = (profileData?.data as IUser) ?? {};
  const actualUsername = routeUsername.split("40")[1] || routeUsername;

  if (!fullName) {
    return { title: "Your profile" };
  }

  return {
    title: `${fullName}'s Profile`,
    description: `Explore ${fullName}'s profile on TechTips Hub — their articles, activity and links.`,
    openGraph: {
      title: `${fullName}'s Profile`,
      description: `Check out ${fullName}'s profile on TechTips Hub.`,
      url: `/profile/@${actualUsername}`,
    },
  };
}

const DynamicProfilePage = async () => {
  const profileData = await getProfileInfo().catch(() => null);
  const user = (profileData?.data as IUser) ?? undefined;

  if (!profileData?.success || !user?._id) {
    return (
      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-md text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              We could not load your profile
            </h1>
            <p className="mt-2 text-default-600">
              {profileData?.message ||
                "Something went wrong while loading your account. Try again in a moment."}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/login" radius="lg" color="primary">
                Sign in again
              </ButtonLink>
              <ButtonLink
                href="/contact-us"
                radius="lg"
                variant="bordered"
                startContent={<BiSupport />}
              >
                Contact support
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const postsData = await getPostsByUserId(user._id, {
    limit: String(PROFILE_PAGE_SIZE),
    page: "1",
  }).catch(() => null);
  // Includes the signed-out case, where the service returns an empty list.
  const posts = Array.isArray(postsData?.data)
    ? (postsData.data as IPost[])
    : [];
  const totalPosts = Number.isFinite(Number(postsData?.meta?.total))
    ? Number(postsData?.meta?.total)
    : posts.length;

  return (
    <section className="py-10 lg:py-14">
      <Container>
        <div className="mx-auto max-w-4xl">
          <ProfileHeader
            user={user}
            postCount={totalPosts}
            actions={
              <>
                <ProfileShareDropdown />
                <EditProfileDropdown />
              </>
            }
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ButtonLink
              href="/settings"
              radius="lg"
              variant="bordered"
              className="justify-between"
            >
              Edit profile details
            </ButtonLink>
            <ButtonLink
              href="/settings/manage-blogs"
              radius="lg"
              variant="bordered"
              className="justify-between"
            >
              Manage articles
            </ButtonLink>
            <ButtonLink href="/write-blog" radius="lg" color="primary">
              Write a new post
            </ButtonLink>
          </div>

          <section className="mt-10" aria-labelledby="profile-articles">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2
                id="profile-articles"
                className="text-xl font-bold tracking-tight"
              >
                Your articles
              </h2>
              <p className="text-sm tabular-nums text-default-500">
                {totalPosts === 0
                  ? "Nothing published yet"
                  : `${totalPosts.toLocaleString()} published · newest first`}
              </p>
            </div>

            <div className="mt-5">
              <ProfileArticleList
                userId={user._id}
                initialPosts={posts}
                total={totalPosts}
                emptyMessage="You have not published anything yet. Your first post starts here."
              />
            </div>

            {totalPosts === 0 && (
              <div className="mt-5">
                <ButtonLink href="/write-blog" radius="lg" color="primary">
                  Start writing
                </ButtonLink>
              </div>
            )}
          </section>

          <div className="mt-12">
            <AdBanner />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default DynamicProfilePage;
