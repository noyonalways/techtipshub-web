import AdSlot from "@/components/adsense/ad-slot";
import AdBanner from "@/components/adsense/ad-banner";
import ProfileHeader from "@/components/modules/profile/profile-header";
import ProfileArticleList from "@/components/modules/profile/profile-article-list";
import ButtonLink from "@/components/ui/button-link";
import Container from "@/components/ui/container";
import FollowUnFollowButton from "@/components/ui/follow-unfollow-button";
import ProfileShareDropdown from "@/components/ui/profile-share-dropdown";
import { getPostsByUserId } from "@/services/post";
import { getUserByUsername } from "@/services/user";
import { IPost, IUser } from "@/types";
import { Metadata } from "next";
import { BiSupport } from "react-icons/bi";

/** Articles requested on the first paint; the rest load a page at a time. */
const PROFILE_PAGE_SIZE = 8;

type Props = {
  params: Promise<{ username: string }>;
};

const usernameFromRoute = (routeUsername: string) =>
  routeUsername.split("40")[1] || routeUsername;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username: routeUsername } = await params;
  const actualUsername = usernameFromRoute(routeUsername);
  const data = await getUserByUsername(actualUsername).catch(() => null);
  const { fullName, profilePicture } = (data?.data as IUser) ?? {};

  if (!fullName) {
    return { title: "Member not found" };
  }

  return {
    title: `${fullName} (@${actualUsername})`,
    description: `Read articles by ${fullName} on TechTips Hub — tutorials and field notes from the tech community.`,
    openGraph: {
      title: `${fullName} (@${actualUsername})`,
      description: `Read articles by ${fullName} on TechTips Hub.`,
      url: `/users/@${actualUsername}`,
      images: profilePicture ? [{ url: profilePicture }] : [],
    },
  };
}

const GetUserByIdPage = async ({ params }: Props) => {
  const { username: routeUsername } = await params;
  const data = await getUserByUsername(usernameFromRoute(routeUsername));

  const user = (data?.data as IUser) ?? undefined;

  if (!user?._id || user.isDeleted) {
    return (
      <section className="py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-md text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              404
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">
              We could not find that member
            </h1>
            <p className="mt-2 text-default-600">
              The profile may have been removed, or the link may be wrong.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/" radius="lg" color="primary">
                Back to the feed
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
                {user._id && <FollowUnFollowButton id={user._id} />}
              </>
            }
          />

          <section className="mt-10" aria-labelledby="profile-articles">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2
                id="profile-articles"
                className="text-xl font-bold tracking-tight"
              >
                Articles
              </h2>
              <p className="text-sm tabular-nums text-default-500">
                {totalPosts === 1
                  ? "1 published article · newest first"
                  : `${totalPosts.toLocaleString()} published articles · newest first`}
              </p>
            </div>

            <div className="mt-5">
              <ProfileArticleList
                userId={user._id}
                initialPosts={posts}
                total={totalPosts}
                emptyMessage={`${user.fullName || "This member"} has not published an article yet.`}
              />
            </div>
          </section>

          <div className="mt-12">
            <AdSlot>
              <AdBanner />
            </AdSlot>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default GetUserByIdPage;
