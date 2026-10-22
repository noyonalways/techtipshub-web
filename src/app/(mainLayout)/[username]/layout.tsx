import Container from "@/components/ui/container";
import FollowUnFollowButton from "@/components/ui/follow-unfollow-button";
import { getUserByUsername } from "@/services/user";
import { IUser } from "@/types";
import { Avatar } from "@heroui/avatar";
import { PiCalendarDotsLight } from "react-icons/pi";

interface IProps {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
}

const FollowersFollowingLayout = async ({ params, children }: IProps) => {
  const { username: rawUsername } = await params;
  const data = await getUserByUsername(rawUsername.split("40")[1]);

  const {
    _id,
    profilePicture,
    fullName,
    designation,
    createdAt,
  } = (data.data as IUser) ?? {};
  return (
    <section className="py-10">
      <Container>
        <div>
          <div className="flex flex-col lg:flex-row gap-4 lg:min-h-dvh lg:items-start">
            <div className="border border-default/50 p-6 rounded-lg basis-[30%]">
              <div className="flex flex-col items-start space-y-4">
                <Avatar
                  color="primary"
                  className="w-20 h-20 lg:size-24 object-cover"
                  radius="full"
                  src={profilePicture}
                  isBordered
                />
                <div className="space-y-2">
                  <h1 className="text-xl font-bold">{fullName}</h1>
                  {designation && <p>{designation}</p>}
                </div>
                <FollowUnFollowButton id={_id} />

                <div className="text-default-600 flex space-x-2 items-center">
                  <PiCalendarDotsLight className="text-lg" />
                  <span>
                    Member Since,{" "}
                    {createdAt && new Date(createdAt).toDateString()}
                  </span>
                </div>
              </div>
            </div>
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FollowersFollowingLayout;