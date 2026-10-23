import Container from "@/components/ui/container";
import FollowUnFollowButton from "@/components/ui/follow-unfollow-button";
import { getUserByUsername } from "@/services/user";
import { IUser } from "@/types";
import { Avatar } from "@heroui/avatar";
import Link from "next/link";
import { PiCalendarDotsLight } from "react-icons/pi";

interface IProps {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
}

const FollowersFollowingLayout = async ({ params, children }: IProps) => {
  const { username: rawUsername } = await params;
  const data = await getUserByUsername(rawUsername.split("40")[1]);

  const { _id, profilePicture, fullName, username, designation, createdAt } =
    (data?.data as IUser) ?? {};

  return (
    <section className="py-10 lg:py-14">
      <Container>
        <div className="grid items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
          {/* Identity card */}
          <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
            <div className="flex items-start gap-4 border-b border-default/60 pb-6 lg:flex-col lg:items-start">
              <Avatar
                color="primary"
                className="size-16 shrink-0 object-cover lg:size-20"
                radius="full"
                src={profilePicture}
                name={(fullName || username || "?").charAt(0).toUpperCase()}
                isBordered
              />

              <div className="min-w-0 space-y-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {fullName || "Member"}
                </h1>
                {username && (
                  <Link
                    href={`/users/@${username}`}
                    className="inline-block text-sm text-default-600 transition-colors hover:text-primary-accessible"
                  >
                    @{username}
                  </Link>
                )}
                {designation && (
                  <p className="text-sm leading-relaxed text-default-600">
                    {designation}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              {_id && <FollowUnFollowButton id={_id} />}

              {createdAt && (
                <p className="flex items-center gap-2 text-sm text-default-600">
                  <PiCalendarDotsLight className="size-4" aria-hidden />
                  Member since {new Date(createdAt).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}

              {username && (
                <Link
                  href={`/users/@${username}`}
                  className="text-sm font-medium text-primary-accessible underline-offset-4 hover:underline"
                >
                  View full profile
                </Link>
              )}
            </div>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </section>
  );
};

export default FollowersFollowingLayout;
