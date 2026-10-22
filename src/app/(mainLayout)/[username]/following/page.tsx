import AdBanner from "@/components/adsense/ad-banner";
import { getFollowingByUserId, getUserByUsername } from "@/services/user";
import { IUFollowing, IUser } from "@/types";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import Link from "next/link";

interface IProps {
  params: Promise<{ username: string }>;
}

const Following = async ({ params }: IProps) => {
  const { username: routeUsername } = await params;
  const data = await getUserByUsername(routeUsername.split("40")[1]);

  const { username, _id, totalFollowing, totalFollowers } =
    (data.data as IUser) ?? {};

  const followingData = await getFollowingByUserId(_id);
  const following = followingData?.data as IUFollowing[];

  return (
    <div className="p-4 border border-default/50 rounded-lg flex-1 space-y-4">
      <div className="flex items-center space-x-1 border-b border-default/50">
        <Link href={`/@${username}/followers`}>
          <Button variant="light" radius="sm">
            Followers ({totalFollowers})
          </Button>
        </Link>
        <Link href={`/@${username}/following`}>
          <Button variant="light" radius="sm">
            Following ({totalFollowing})
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {following.map((current) => (
          <Link
            href={`/users/@${current.following.username}`}
            key={current._id}
            className="bg-default-100 flex items-start space-x-3 p-4 rounded-md"
          >
            <Avatar
              color="primary"
              className="w-8 h-8 object-cover"
              radius="full"
              src={current.following.profilePicture}
            />

            <div className="space-y-2">
              <h1 className="font-medium">{current.following.fullName}</h1>
              {current?.following?.designation && (
                <small className="text-default-500">
                  {current?.following?.designation}
                </small>
              )}
            </div>
          </Link>
        ))}
      </div>

      <AdBanner />
    </div>
  );
};

export default Following;
