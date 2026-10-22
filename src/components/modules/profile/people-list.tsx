import { Avatar } from "@heroui/avatar";
import Link from "next/link";

export interface IPersonSummary {
  _id: string;
  fullName?: string;
  username?: string;
  designation?: string;
  profilePicture?: string;
}

interface IProps {
  title: string;
  people: IPersonSummary[];
  emptyMessage: string;
  /** Username of the profile these lists belong to. */
  ownUsername: string;
  activeTab: "followers" | "following";
  counts?: { followers?: number; following?: number };
}

const Tab = ({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) => (
  <Link
    href={href}
    aria-current={active ? "page" : undefined}
    className={`-mb-px flex items-baseline gap-1.5 border-b-2 px-0.5 pb-3 text-sm font-medium transition-colors ${
      active
        ? "border-primary text-primary"
        : "border-transparent text-default-600 hover:text-foreground"
    }`}
  >
    {label}
    {/* Counts only when the API supplied them. */}
    {typeof count === "number" && (
      <span className="text-xs tabular-nums text-default-400">{count}</span>
    )}
  </Link>
);

/**
 * Shared people list for the followers/following tabs. Renders an honest empty
 * state instead of a blank panel.
 */
const PeopleList = ({
  title,
  people,
  emptyMessage,
  ownUsername,
  activeTab,
  counts,
}: IProps) => {
  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {typeof counts?.followers === "number" &&
          typeof counts?.following === "number" && (
            <p className="text-sm tabular-nums text-default-500">
              {counts.followers.toLocaleString()} followers ·{" "}
              {counts.following.toLocaleString()} following
            </p>
          )}
      </div>

      <div className="mt-5 flex gap-6 border-b border-default/60">
        <Tab
          href={`/@${ownUsername}/followers`}
          label="Followers"
          count={counts?.followers}
          active={activeTab === "followers"}
        />
        <Tab
          href={`/@${ownUsername}/following`}
          label="Following"
          count={counts?.following}
          active={activeTab === "following"}
        />
      </div>

      {people.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-default/60 px-6 py-14 text-center">
          <p className="text-sm font-medium">
            {activeTab === "followers" ? "No followers yet" : "Not following anyone yet"}
          </p>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-default-500">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-default/60 border-y border-default/60">
          {people.map((person) => (
            <li key={person._id}>
              <Link
                href={`/users/@${person.username}`}
                className="flex items-start gap-3 px-1 py-3.5 transition-colors hover:bg-default-50"
              >
                <Avatar
                  size="sm"
                  radius="full"
                  src={person.profilePicture || undefined}
                  name={(person.fullName || person.username || "?")
                    .charAt(0)
                    .toUpperCase()}
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {person.fullName || person.username}
                  </p>
                  {person.username && (
                    <p className="truncate text-xs text-default-500">
                      @{person.username}
                    </p>
                  )}
                </div>
                {person.designation && (
                  <span className="hidden max-w-[40%] truncate text-xs text-default-500 sm:block">
                    {person.designation}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PeopleList;
