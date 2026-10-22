import { IUser } from "@/types";
import { Avatar } from "@heroui/avatar";
import Link from "next/link";
import type { ReactNode } from "react";
import { BsTwitterX } from "react-icons/bs";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { PiArticleLight, PiCalendarDotsLight } from "react-icons/pi";

interface IProps {
  user: Partial<IUser>;
  /** Share / follow / edit controls rendered beside the identity. */
  actions?: ReactNode;
  /** Path of this profile, used for the "Blog posts" link. */
  postsHref?: string;
  /**
   * Authoritative article count. The stored `user.totalPosts` can lag behind
   * (or miss) the real number of published articles, so pages that have the
   * server's count pass it here.
   */
  postCount?: number;
}

const socialIcons: Record<string, ReactNode> = {
  Linkedin: <FaLinkedin aria-hidden className="size-4" />,
  Twitter: <BsTwitterX aria-hidden className="size-4" />,
  Github: <FaGithub aria-hidden className="size-4" />,
  Facebook: <FaFacebook aria-hidden className="size-4" />,
  Instagram: <FaInstagram aria-hidden className="size-4" />,
  Youtube: <FaYoutube aria-hidden className="size-4" />,
};

const Stat = ({
  href,
  value,
  label,
}: {
  href?: string;
  value: number | undefined;
  label: string;
}) => {
  const inner = (
    <>
      <span className="text-lg font-bold tabular-nums tracking-tight">
        {(value ?? 0).toLocaleString()}
      </span>
      <span className="mt-0.5 block text-xs uppercase tracking-wider text-default-500">
        {label}
      </span>
    </>
  );

  return href ? (
    <Link
      href={href}
      className="block px-4 py-3 transition-colors first:pl-0 sm:first:pl-0 hover:text-primary"
    >
      {inner}
    </Link>
  ) : (
    <div className="px-4 py-3 first:pl-0">{inner}</div>
  );
};

/**
 * Identity block for a public member profile. Both `/users/@…` (someone else)
 * and `/profile/@…` (signed-in visitor) share the same structure; only the
 * action slot differs.
 */
const ProfileHeader = ({ user, actions, postsHref, postCount }: IProps) => {
  const {
    _id,
    fullName,
    username,
    designation,
    profilePicture,
    isVerified,
    totalFollowers,
    totalFollowing,
    totalPosts,
    location,
    bio,
    createdAt,
    socialLinks,
  } = user;

  const displayName = fullName || username || "Member";
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : null;

  const links = (socialLinks ?? []).filter((link) => link?.url);

  return (
    <header className="border-b border-default/60 pb-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <Avatar
            color="primary"
            radius="full"
            isBordered
            src={profilePicture}
            name={displayName.charAt(0).toUpperCase()}
            className="size-24 shrink-0 object-cover text-3xl font-bold lg:size-28"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="text-pretty text-3xl font-bold tracking-tight md:text-4xl">
                {displayName}
              </h1>
              {isVerified && (
                <span
                  className="inline-flex items-center gap-1 text-primary"
                  title="Verified member"
                >
                  <MdVerified aria-hidden className="size-5" />
                  <span className="sr-only">Verified</span>
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-default-500">
              {username && <span>@{username}</span>}
              {designation && (
                <>
                  <span aria-hidden className="text-default-300">
                    ·
                  </span>
                  <span className="text-default-600">{designation}</span>
                </>
              )}
            </div>

            {bio && (
              <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-default-700">
                {bio}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>

      {/* Statistics */}
      <dl className="mt-7 flex flex-wrap divide-x divide-default/60 sm:-ml-4">
        <Stat
          href={username ? `/@${username}/following` : undefined}
          value={totalFollowing}
          label="Following"
        />
        <Stat
          href={username ? `/@${username}/followers` : undefined}
          value={totalFollowers}
          label="Followers"
        />
        <Stat href={postsHref} value={postCount ?? totalPosts} label="Posts" />
      </dl>

      {/* Facts */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-default/60 pt-5 text-sm text-default-600">
        {location && (
          <span className="inline-flex items-center gap-2">
            <FiMapPin aria-hidden className="size-4 text-default-400" />
            {location}
          </span>
        )}

        {memberSince && (
          <span className="inline-flex items-center gap-2">
            <PiCalendarDotsLight
              aria-hidden
              className="size-4 text-default-400"
            />
            Member since {memberSince}
          </span>
        )}

        {links.length > 0 && (
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.platform}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  aria-label={link.platform}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-default-500 transition-colors hover:bg-default-100 hover:text-primary"
                >
                  {socialIcons[link.platform] ?? link.platform}
                </a>
              </li>
            ))}
          </ul>
        )}

        {_id && postsHref && (
          <Link
            href={postsHref}
            className="ml-auto inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
          >
            <PiArticleLight aria-hidden className="size-4" />
            Read their writing
          </Link>
        )}
      </div>
    </header>
  );
};

export default ProfileHeader;
