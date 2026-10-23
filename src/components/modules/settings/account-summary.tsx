import { manageBlogsPath } from "@/lib/blog-routes";
import StatTile from "@/components/modules/settings/stat-tile";
import type { IAccountSummary } from "@/services/settings";
import { FiEye } from "react-icons/fi";
import { HiOutlineChatBubbleLeftEllipsis } from "react-icons/hi2";
import { MdOutlineArticle } from "react-icons/md";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/**
 * What the account has produced, at a glance: articles, total reads and
 * comments, plus the newest piece with a shortcut back to it. Every number is
 * read from the same list the profile and manage-blogs use.
 */
const AccountSummary = ({ summary }: { summary: IAccountSummary }) => {
  return (
    <section aria-label="Your account at a glance">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Articles"
          value={summary.articles.toLocaleString()}
          hint="published and public"
          icon={<MdOutlineArticle className="size-3.5" />}
          href={manageBlogsPath}
        />
        <StatTile
          label="Reads"
          value={summary.views.toLocaleString()}
          hint="unique views, all time"
          icon={<FiEye className="size-3.5" />}
        />
        <StatTile
          label="Comments"
          value={summary.comments.toLocaleString()}
          hint="from readers"
          icon={<HiOutlineChatBubbleLeftEllipsis className="size-3.5" />}
        />
        {summary.newest ? (
          <StatTile
            label="Newest"
            value={formatDate(summary.newest.createdAt)}
            hint={summary.newest.title}
            href={`/blogs/${summary.newest.slug}`}
            compact
          />
        ) : (
          <StatTile
            label="Newest"
            value="—"
            hint="No articles yet. Write the first one."
          />
        )}
      </div>
    </section>
  );
};

export default AccountSummary;
