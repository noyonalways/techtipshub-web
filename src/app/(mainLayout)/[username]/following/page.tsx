import PeopleList from "@/components/modules/profile/people-list";
import { getFollowingByUserId, getUserByUsername } from "@/services/user";
import { allBlogsForBuild } from "@/lib/blog-index";
import { normaliseRouteUsername } from "@/utils/username";
import { IUFollowing, IUser } from "@/types";
import { Metadata } from "next";

interface IProps {
  params: Promise<{ username: string }>;
}

export const revalidate = 43200; // Revalidate every 12 hours (43200 seconds)

/**
 * The authors who have a prerendered profile page (`users/[username]`), so the
 * reader's follower lists are generated alongside them.
 */
const authorUsernames = async () => {
  const { rows } = await allBlogsForBuild();
  const seen = new Set<string>();

  for (const row of rows) {
    const username = row.author?.username;
    if (username) seen.add(username);
  }

  return [...seen];
};

export async function generateStaticParams() {
  const usernames = await authorUsernames();
  // The short form is the one the app links to.
  return usernames.map((username) => ({ username: `@${username}` }));
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { username: routeUsername } = await params;
  const username = normaliseRouteUsername(routeUsername);
  return {
    title: `People @${username} follows`,
    alternates: { canonical: `/@${username}/following` },
    robots: { index: false, follow: true },
  };
}

const Following = async ({ params }: IProps) => {
  const { username: routeUsername } = await params;
  const data = await getUserByUsername(normaliseRouteUsername(routeUsername));

  const { username, _id, totalFollowing, totalFollowers } =
    (data?.data as IUser) ?? {};

  const followingData = await getFollowingByUserId(_id);
  const following = Array.isArray(followingData?.data)
    ? (followingData.data as IUFollowing[])
    : [];

  return (
    <PeopleList
      title={`People ${username ? `@${username}` : "this member"} follows`}
      people={following.map((current) => current.following).filter(Boolean)}
      emptyMessage="Authors this member follows will be listed here."
      ownUsername={username}
      activeTab="following"
      counts={{ followers: totalFollowers, following: totalFollowing }}
    />
  );
};

export default Following;
