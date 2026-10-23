import PeopleList from "@/components/modules/profile/people-list";
import { getFollowersByUserId, getUserByUsername } from "@/services/user";
import { IUFollower, IUser } from "@/types";
import { Metadata } from "next";

interface IProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { username: routeUsername } = await params;
  const username = routeUsername.split("40")[1];
  return {
    title: `People following @${username}`,
    alternates: { canonical: `/@${username}/followers` },
  };
}

const Followers = async ({ params }: IProps) => {
  const { username: routeUsername } = await params;
  const data = await getUserByUsername(routeUsername.split("40")[1]);

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
