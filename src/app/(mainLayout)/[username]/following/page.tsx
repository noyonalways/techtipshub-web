import PeopleList from "@/components/modules/profile/people-list";
import { getFollowingByUserId, getUserByUsername } from "@/services/user";
import { IUFollowing, IUser } from "@/types";
import { Metadata } from "next";

interface IProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const { username: routeUsername } = await params;
  const username = routeUsername.split("40")[1];
  return {
    title: `People @${username} follows`,
    alternates: { canonical: `/@${username}/following` },
  };
}

const Following = async ({ params }: IProps) => {
  const { username: routeUsername } = await params;
  const data = await getUserByUsername(routeUsername.split("40")[1]);

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
