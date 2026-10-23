import { manageBlogsPath, writeBlogPath } from "@/lib/blog-routes";
import { AdSlot } from "@/components/adsense";
import ProfileHeader from "@/components/modules/profile/profile-header";
import ProfileArticleList from "@/components/modules/profile/profile-article-list";
import ButtonLink from "@/components/ui/button-link";
import Container from "@/components/ui/container";
import EditProfileDropdown from "@/components/ui/edit-profile-dropdown";
import ProfileShareDropdown from "@/components/ui/profile-share-dropdown";
import { getProfileInfo } from "@/services/auth";
import { getBlogsByUserId } from "@/services/blog";
import { IBlog, IUser } from "@/types";
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
    description: `Explore ${fullName}'s profile on TechTipsHub — their articles, activity and links.`,
    openGraph: {
      title: `${fullName}'s Profile`,
      description: `Check out ${fullName}'s profile on TechTipsHub.`,
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
                href="/contact"
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

  const blogsData = await getBlogsByUserId(user._id, {
    limit: String(PROFILE_PAGE_SIZE),
    page: "1",
  }).catch(() => null);
  // Includes the signed-out case, where the service returns an empty list.
  const blogs = Array.isArray(blogsData?.data)
    ? (blogsData.data as IBlog[])
    : [];
  const totalBlogs = Number.isFinite(Number(blogsData?.meta?.total))
    ? Number(blogsData?.meta?.total)
    : blogs.length;

  return (
    <section className="py-10 lg:py-14">
      <Container>
        <div>
          <ProfileHeader
            user={user}
            blogCount={totalBlogs}
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
              href={manageBlogsPath}
              radius="lg"
              variant="bordered"
              className="justify-between"
            >
              Manage articles
            </ButtonLink>
            <ButtonLink href={writeBlogPath} radius="lg" color="primary">
              Write a new blog
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
              <p className="text-sm tabular-nums text-default-600">
                {totalBlogs === 0
                  ? "Nothing published yet"
                  : `${totalBlogs.toLocaleString()} published · newest first`}
              </p>
            </div>

            <div className="mt-5">
              <ProfileArticleList
                userId={user._id}
                initialBlogs={blogs}
                total={totalBlogs}
                emptyMessage="You have not published anything yet. Your first blog starts here."
              />
            </div>

            {totalBlogs === 0 && (
              <div className="mt-5">
                <ButtonLink href={writeBlogPath} radius="lg" color="primary">
                  Start writing
                </ButtonLink>
              </div>
            )}
          </section>

          {/* A profile with fewer than three published articles has no list to
              frame an ad: nothing to put the unit after. */}
          {totalBlogs >= 3 && (
            <div className="mt-12">
              <AdSlot variant="display" placement="own-profile-end" />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default DynamicProfilePage;
