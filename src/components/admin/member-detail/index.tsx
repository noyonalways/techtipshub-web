"use client";

import BlockError, { RetryButton } from "@/components/admin/block-error";
import { formatCount, formatDate, initialsOf } from "@/components/admin/format";
import EmptyState from "@/components/modules/admin/kit/empty-state";
import { focusRing } from "@/components/modules/admin/kit/tau";
import SectionCard from "@/components/modules/admin/section-card";
import {
  MEMBER_PEOPLE_LIMIT,
  memberProfileHref,
  useFoundMember,
  useMemberFollowers,
  useMemberFollowing,
  type IPeoplePage,
  type TPersonRow,
} from "@/hooks/admin-members";
import { useMemberArticles } from "@/hooks/admin-member-articles";
import {
  useBlockUser,
  useDeleteUserAccount,
  useMakeAdmin,
  useUnblockUser,
} from "@/hooks/user.hook";
import { ADMIN_BLOGS_KEY } from "@/hooks/admin-blogs";
import { ADMIN_MEMBERS_KEY } from "@/hooks/admin-members";
import { TRASHED_USERS_KEY } from "@/hooks/admin-trash";
import ConfirmDialog from "@/components/modules/admin/kit/confirm-dialog";
import type { IBlog } from "@/types";
import { Avatar, Skeleton } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback } from "react";
import {
  RiArrowLeftLine,
  RiExternalLinkLine,
  RiMailLine,
  RiShieldUserLine,
  RiTimeLine,
  RiUserForbidLine,
  RiUserReceivedLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import StatusPill from "@/components/ui/status-pill";

const linkClass = `rounded font-medium text-primary-accessible underline-offset-4 hover:underline ${focusRing}`;

const quietButton = `inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border border-default-200 px-3 text-sm font-medium transition-colors hover:bg-default-100 sm:min-h-9 ${focusRing}`;

const BackLink = () => (
  <Link
    href="/admin/manage-users"
    className={`inline-flex min-h-11 items-center gap-1.5 rounded text-sm text-default-600 underline-offset-4 hover:text-foreground hover:underline sm:min-h-9 ${focusRing}`}
  >
    <RiArrowLeftLine aria-hidden className="size-4" />
    All members
  </Link>
);

const Loading = () => (
  <div aria-busy="true">
    <p className="sr-only" role="status">
      Loading this member
    </p>
    <div className="flex items-center gap-4">
      <Skeleton className="size-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-52 rounded" />
        <Skeleton className="h-4 w-36 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-default/60 bg-default/60 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2 bg-background p-4">
          <Skeleton className="h-7 w-16 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      ))}
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className="h-64 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

/**
 * One figure in the stat strip. `href` links to where the number lives, and
 * `fallback` is shown in the number slot when the API reports no count at all.
 */
const Figure = ({
  value,
  label,
  href,
  hint,
  fallback,
}: {
  value?: number;
  label: string;
  href?: string;
  hint?: string;
  fallback?: string;
}) => {
  const hasValue = typeof value === "number";

  const content = (
    <>
      <span
        className={`block font-[family-name:var(--type-editorial)] font-semibold leading-none tracking-[-0.015em] tabular-nums ${
          hasValue ? "text-[1.5rem] sm:text-[1.75rem]" : "text-lg"
        }`}
      >
        {hasValue ? formatCount(value) : fallback || "Not recorded"}
      </span>
      <span className="mt-1.5 block text-xs text-default-600">{label}</span>
      {hint && (
        <span className="mt-0.5 block text-xs text-default-600">{hint}</span>
      )}
    </>
  );

  return href ? (
    <Link
      href={href}
      className={`block bg-background p-4 transition-colors hover:bg-default-50 ${focusRing}`}
    >
      {content}
    </Link>
  ) : (
    <div className="bg-background p-4">{content}</div>
  );
};

const PeopleList = ({
  title,
  people,
  total,
  empty,
  href,
  loading,
  error,
  onRetry,
}: {
  title: string;
  people: IPeoplePage | undefined;
  total?: number;
  empty: string;
  href?: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) => {
  const rows = people?.rows ?? [];
  const count = people?.total ?? total;
  const more =
    typeof count === "number" && count > rows.length ? count - rows.length : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {typeof count === "number" && (
          <span className="text-xs tabular-nums text-default-600">
            {formatCount(count)}
          </span>
        )}
      </div>

      {loading && (
        <div className="mt-2 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full rounded-md" />
          ))}
          <p className="sr-only" role="status">
            Loading {title.toLowerCase()}
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="mt-2">
          <p className="text-sm text-default-600">{title} did not load.</p>
          <button
            type="button"
            onClick={onRetry}
            className={`mt-2 ${quietButton}`}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="mt-1.5 text-sm leading-relaxed text-default-600">
          {empty}
        </p>
      )}

      {!loading && !error && rows.length > 0 && (
        <ul className="mt-1.5 divide-y divide-default/50">
          {rows.map((person) => (
            <li key={person._id}>
              <PersonLink person={person} />
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && more > 0 && href && (
        <Link href={href} className={`mt-2 inline-flex text-xs ${linkClass}`}>
          {formatCount(more)} more on the public profile
        </Link>
      )}
    </div>
  );
};

const PersonLink = ({ person }: { person: TPersonRow }) => {
  const name = person.fullName || "Unnamed member";
  const body = (
    <>
      <Avatar
        src={person.profilePicture}
        name={initialsOf(person.fullName)}
        size="sm"
        className="size-7 shrink-0"
      />
      <span className="min-w-0">
        <span className="block truncate text-sm">{name}</span>
        {person.username && (
          <span className="block truncate text-xs text-default-600">
            @{person.username}
          </span>
        )}
      </span>
    </>
  );

  return person.username ? (
    <Link
      href={`/users/@${person.username}`}
      className={`flex min-h-11 items-center gap-2.5 rounded py-1.5 ${focusRing}`}
    >
      {body}
    </Link>
  ) : (
    <div className="flex min-h-11 items-center gap-2.5 py-1.5">{body}</div>
  );
};

const ArticleRow = ({ blog }: { blog: IBlog }) => (
  <li className="py-3 first:pt-0 last:pb-0">
    <Link
      href={`/blogs/${blog.slug}`}
      className={`line-clamp-2 rounded font-medium leading-snug underline-offset-4 hover:underline ${focusRing}`}
    >
      {blog.title || "Untitled article"}
    </Link>
    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs tabular-nums text-default-600">
      <span>{formatDate(blog.createdAt) || "No date"}</span>
      <span>{blog.category?.name || "No category"}</span>
      <span>{formatCount(blog.totalViews)} views</span>
      <span>{formatCount(blog.totalComments)} comments</span>
    </p>
  </li>
);

const MemberDetail = ({ memberId }: { memberId: string }) => {
  const memberQuery = useFoundMember(memberId);
  const member = memberQuery.member;

  const articlesQuery = useMemberArticles(member ? memberId : undefined);
  const followersQuery = useMemberFollowers(member ? memberId : undefined);
  const followingQuery = useMemberFollowing(member ? memberId : undefined);

  const { mutate: blockUser, isPending: isBlockPending } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnblockPending } = useUnblockUser();
  const { mutate: makeAdmin, isPending: isPromotePending } = useMakeAdmin();
  const { mutate: deleteAccount, isPending: isDeletePending } =
    useDeleteUserAccount();
  const queryClient = useQueryClient();

  // Every account action changes the lists this member appears in, so the
  // caches that hold them are cleared before the row is refetched.
  const refreshMember = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ADMIN_MEMBERS_KEY });
    void queryClient.invalidateQueries({ queryKey: ["GET_ALL_USERS"] });
    void memberQuery.refetch();
  }, [queryClient, memberQuery]);

  const isBlocked = member?.status === "Blocked";
  const isAdmin = member?.role === "Admin";
  const memberName = member?.fullName || member?.username || "this member";

  const handleToggleBlock = useCallback(
    (id: string) => {
      if (!member) return;
      if (member.status === "Active") {
        blockUser(id, { onSuccess: () => refreshMember() });
      } else {
        unblockUser(id, { onSuccess: () => refreshMember() });
      }
    },
    [blockUser, unblockUser, member, refreshMember],
  );

  const handleMakeAdmin = useCallback(
    (id: string) => {
      makeAdmin(id, { onSuccess: () => refreshMember() });
    },
    [makeAdmin, refreshMember],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteAccount(id, {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: TRASHED_USERS_KEY });
          void queryClient.invalidateQueries({ queryKey: ADMIN_BLOGS_KEY });
          void queryClient.invalidateQueries({
            queryKey: ["ADMIN_TRASH_COUNTS"],
          });
          refreshMember();
        },
      });
    },
    [deleteAccount, queryClient, refreshMember],
  );

  if (memberQuery.isLoading) {
    return (
      <div>
        <BackLink />
        <div className="mt-4">
          <Loading />
        </div>
      </div>
    );
  }

  if (memberQuery.isError) {
    return (
      <div>
        <BackLink />
        <div className="mt-4 rounded-[10px] border border-default/60">
          <BlockError
            title="This member could not be loaded"
            description="The member lookup failed. Check that the API is running, then try again."
            action={<RetryButton onClick={() => memberQuery.refetch()} />}
          />
        </div>
      </div>
    );
  }

  if (memberQuery.isMissing || !member) {
    return (
      <div>
        <BackLink />
        <div className="mt-4">
          <EmptyState
            title="No member with this id"
            description="No live account has this id. If it was deleted, it is in the trash until someone restores it."
            action={
              <Link href="/admin/trash" className={linkClass}>
                Open the trash
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const publicProfile = memberProfileHref(member.username);
  const followersHref = member.username
    ? `/${member.username}/followers`
    : undefined;
  const followingHref = member.username
    ? `/${member.username}/following`
    : undefined;

  const articles = articlesQuery.data;
  const articlesFailed = articles?.failed ?? false;
  const articlesTotal = articlesFailed ? undefined : articles?.total;
  const joined = formatDate(member.createdAt);

  return (
    <div className="space-y-6">
      <BackLink />

      <section aria-labelledby="member-name">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar
              src={member.profilePicture}
              name={initialsOf(member.fullName)}
              className="size-16 shrink-0 text-xl"
            />
            <div className="min-w-0">
              <h2
                id="member-name"
                className="truncate font-[family-name:var(--type-editorial)] text-[1.5rem] font-semibold leading-tight tracking-[-0.015em] sm:text-[1.75rem]"
              >
                {member.fullName || "Unnamed member"}
              </h2>
              <p className="mt-0.5 truncate text-sm text-default-600">
                {member.username ? `@${member.username}` : "No username"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusPill
                  tone={member.role === "Admin" ? "primary" : "neutral"}
                >
                  {member.role}
                </StatusPill>
                <StatusPill
                  dot
                  tone={member.status === "Active" ? "success" : "danger"}
                >
                  {member.status}
                </StatusPill>
                {member.isVerified && (
                  <StatusPill tone="neutral">Verified</StatusPill>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {publicProfile && (
              <Link href={publicProfile} className={quietButton}>
                <RiExternalLinkLine aria-hidden className="size-4" />
                Public profile
              </Link>
            )}

            {isBlocked ? (
              <ConfirmDialog
                trigger={
                  <button type="button" className={quietButton}>
                    <RiUserReceivedLine aria-hidden className="size-4" />
                    Unblock account
                  </button>
                }
                title={`Unblock ${memberName}?`}
                description="They can sign in, vote and comment again straight away."
                confirmLabel="Unblock account"
                isPending={isUnblockPending}
                onConfirm={() => handleToggleBlock(member._id)}
              />
            ) : (
              <ConfirmDialog
                trigger={
                  <button
                    type="button"
                    className={quietButton}
                    disabled={isAdmin}
                    title={
                      isAdmin ? "Admin accounts cannot be blocked" : undefined
                    }
                  >
                    <RiUserForbidLine aria-hidden className="size-4" />
                    Block account
                  </button>
                }
                title={`Block ${memberName}?`}
                description="They stay visible on the site but cannot sign in, comment or vote until you unblock them."
                confirmLabel="Block account"
                tone="danger"
                isPending={isBlockPending}
                onConfirm={() => handleToggleBlock(member._id)}
              />
            )}

            {isAdmin ? (
              <span
                className={`${quietButton} cursor-default text-default-600`}
                aria-label="This member is already an admin"
              >
                <RiShieldUserLine aria-hidden className="size-4" />
                Already an admin
              </span>
            ) : (
              <ConfirmDialog
                trigger={
                  <button
                    type="button"
                    className={quietButton}
                    disabled={isBlocked}
                    title={
                      isBlocked ? "Unblock them before promoting" : undefined
                    }
                  >
                    <RiShieldUserLine aria-hidden className="size-4" />
                    Make admin
                  </button>
                }
                title={`Make ${memberName} an admin?`}
                description="Admins can manage articles, comments, members and settings. This screen cannot undo it."
                confirmLabel="Make admin"
                isPending={isPromotePending}
                onConfirm={() => handleMakeAdmin(member._id)}
              />
            )}

            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  disabled={isAdmin}
                  title={
                    isAdmin ? "Admin accounts cannot be deleted" : undefined
                  }
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border border-danger/40 px-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50 sm:min-h-9 ${focusRing}`}
                >
                  <RiDeleteBinLine aria-hidden className="size-4" />
                  Delete account
                </button>
              }
              title={`Delete ${memberName}'s account?`}
              description="Their articles, comments, views and votes go with the account and do not come back. The login can be restored from Trash."
              confirmLabel="Delete account"
              tone="danger"
              isPending={isDeletePending}
              onConfirm={() => handleDelete(member._id)}
            />
          </div>
        </div>

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
          <div className="flex min-w-0 items-center gap-1.5">
            <dt className="text-default-600">Email</dt>
            <dd className="min-w-0 truncate">
              {member.email ? (
                <a
                  href={`mailto:${member.email}`}
                  className={`inline-flex items-center gap-1 rounded underline-offset-4 hover:underline ${focusRing}`}
                >
                  <RiMailLine
                    aria-hidden
                    className="size-3.5 text-default-600"
                  />
                  {member.email}
                </a>
              ) : (
                "Not recorded"
              )}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-default-600">Joined</dt>
            <dd className="tabular-nums">
              {joined ? (
                <span className="inline-flex items-center gap-1">
                  <RiTimeLine
                    aria-hidden
                    className="size-3.5 text-default-600"
                  />
                  {joined}
                </span>
              ) : (
                "Not recorded"
              )}
            </dd>
          </div>
          {member.designation && (
            <div className="flex min-w-0 items-center gap-1.5">
              <dt className="text-default-600">Role at work</dt>
              <dd className="min-w-0 truncate">{member.designation}</dd>
            </div>
          )}
        </dl>

        {member.bio && (
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-default-700">
            {member.bio}
          </p>
        )}
      </section>

      <section aria-label="Activity">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-default/60 bg-default/60 sm:grid-cols-4">
          <Figure
            value={articlesTotal}
            label="Published articles"
            hint={articlesFailed ? "The list did not load" : "All time"}
          />
          <Figure
            value={followersQuery.data?.total ?? member.totalFollowers}
            label="Followers"
            hint={followersHref ? "Opens the public list" : undefined}
            href={followersHref}
          />
          <Figure
            value={followingQuery.data?.total ?? member.totalFollowing}
            label="Following"
            hint={followingHref ? "Opens the public list" : undefined}
            href={followingHref}
          />
          <Figure
            label="Member since"
            hint={joined ? "Date the account was created" : undefined}
            fallback={joined || "Not recorded"}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <SectionCard
          title="Latest articles"
          description={
            typeof articlesTotal === "number" && articlesTotal > 0
              ? `Newest of ${formatCount(articlesTotal)} published`
              : "Newest first"
          }
          action={
            <Link href="/admin/manage-blogs" className={`text-xs ${linkClass}`}>
              All articles
            </Link>
          }
        >
          {articlesQuery.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-md" />
              ))}
              <p className="sr-only" role="status">
                Loading articles
              </p>
            </div>
          )}

          {!articlesQuery.isLoading && articlesFailed && (
            <BlockError
              title="Articles could not be loaded"
              description="The article list did not come back. Try again in a moment."
              action={<RetryButton onClick={() => articlesQuery.refetch()} />}
            />
          )}

          {!articlesQuery.isLoading &&
            !articlesFailed &&
            (articles?.result.length ?? 0) === 0 && (
              <EmptyState
                variant="inline"
                title="No published articles"
                description={`${
                  member.fullName || "This member"
                } has not published anything yet, so there is nothing on the public profile.`}
              />
            )}

          {!articlesQuery.isLoading &&
            !articlesFailed &&
            (articles?.result.length ?? 0) > 0 && (
              <ul className="divide-y divide-default/50">
                {articles!.result.map((blog) => (
                  <ArticleRow key={blog._id} blog={blog} />
                ))}
              </ul>
            )}
        </SectionCard>

        <SectionCard
          title="Follows"
          description="Who this member reads, and who reads them."
        >
          <div className="space-y-5">
            <PeopleList
              title="Follows"
              people={followingQuery.data}
              empty="This member does not follow anyone."
              href={followingHref}
              loading={followingQuery.isLoading}
              error={followingQuery.isError}
              onRetry={() => followingQuery.refetch()}
            />
            <PeopleList
              title="Followed by"
              people={followersQuery.data}
              empty="Nobody follows this member yet."
              href={followersHref}
              loading={followersQuery.isLoading}
              error={followersQuery.isError}
              onRetry={() => followersQuery.refetch()}
            />
            <p className="text-xs text-default-600">
              Showing up to {MEMBER_PEOPLE_LIMIT} rows per list.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default MemberDetail;
