import PeopleList from "@/components/modules/profile/people-list";
import { getFollowersByUserId, getUserByUsername } from "@/services/user";
import { allBlogsForBuild } from "@/lib/blog-index";
import { normaliseRouteUsername } from "@/utils/username";
import { IUFollower, IUser } from "@/types";
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
    title: `People following @${username}`,
    alternates: { canonical: `/@${username}/followers` },
    // A directory of names with no content of its own; the profile is the page
    // worth ranking.
    robots: { index: false, follow: true },
  };
}

const Followers = async ({ params }: IProps) => {
  const { username: routeUsername } = await params;
  const data = await getUserByUsername(normaliseRouteUsername(routeUsername));

  const { username, _id, totalFollowing, totalFollowers } =
    (data?.data as IUser) ?? {};

  const followersData = await getFollowersByUserId(_id);
  const followers = Array.isArray(followersData?.data)
    ? (followersData.data as IUFollower[])
    : [];

  return (
    <PeopleList
      title={`People following ${username ? `@${username}` : "this member"}`}
      people={followers.map((current) => current.follower).filter(Boolean)}
      emptyMessage="When other members follow this profile, they will be listed here."
      ownUsername={username}
      activeTab="followers"
      counts={{ followers: totalFollowers, following: totalFollowing }}
    />
  );
};

export default Followers;
