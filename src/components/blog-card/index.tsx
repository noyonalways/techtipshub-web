import { IPost } from "@/types";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Image as NextImage } from "@heroui/image";
import Link from "next/link";
import { AiOutlineComment } from "react-icons/ai";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { HiOutlineEye } from "react-icons/hi2";
import { parseHtmlContent } from "@/utils";
import UpVoteButton from "../ui/upvote-button";
import DownVoteButton from "../ui/downvote-button";
import Image from "next/image";

interface IProps extends IPost {}

const BlogCard = ({
  author,
  title,
  content,
  totalViews,
  totalComments,
  coverImage,
  createdAt,
  isPremium,
  downVotes,
  upVotes,
  category,
  slug,
  _id,
}: IProps) => {
  const parsedContent = parseHtmlContent(content);

  return (
    <div className="border border-default/50 p-6 rounded-xl space-y-4 w-full">
      <div className="flex justify-between items-end">
        <Link
          href={`/users/@${author?.username}`}
          className="flex space-x-4 items-center"
        >
          <Avatar
            className="size-12 object-cover"
            radius="full"
            src={author?.profilePicture}
            color="primary"
            isBordered
          />
          <div>
            <h3 className="text-base font-medium">
              {author?.fullName}{" "}
              {author?.isPremiumUser && (
                <span
                  title="Premium User"
                  className="ml-1 hover:bg-purple-200 inline-block bg-slate-200 px-2 rounded-md text-sm  dark:text-white dark:bg-primary/60"
                >
                  Pro
                </span>
              )}{" "}
            </h3>
            <span className="text-xs">
              @{author?.username} - {new Date(createdAt)?.toDateString()}
            </span>
          </div>
        </Link>
        {isPremium && (
          <span className="bg-primary-100 text-xs px-3 py-1 rounded-full text-primary dark:text-white">
            Premium
          </span>
        )}
      </div>
      <Link
        href={`/blogs/${slug}`}
        className="flex flex-col-reverse lg:flex-row lg:items-start lg:space-x-4"
      >
        <div className="lg:flex-1 space-y-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p>
            {parsedContent.length > 120
              ? parsedContent.substring(0, 120) + "..."
              : parsedContent}
          </p>
        </div>
        <div className="basis-full lg:basis-[28%] mb-3 lg:mb-0 rounded-md overflow-hidden">
          <Image
            className="w-full h-full object-cover"
            src={coverImage}
            alt={`${title}-cover-image`}
            width={320}
            height={320}
          />
        </div>
      </Link>
      <div className="flex flex-col items-end lg:flex-row lg:items-center justify-between space-y-2 lg:space-y-0">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <div className={`flex space-x-2 items-center`}>
            <div className="flex items-center space-x-1">
              <Button
                isIconOnly
                size="sm"
                radius="full"
                variant="light"
                isDisabled
              >
                <BiDownvote size={14} />
              </Button>
              <span className="text-sm text-gray-500">{downVotes}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                isIconOnly
                size="sm"
                radius="full"
                variant="light"
                isDisabled
              >
                <BiUpvote size={14} />
              </Button>
              <span className="text-sm text-gray-500">{upVotes}</span>
            </div>
          </div>

          <Button
            isDisabled
            size="sm"
            variant="light"
            startContent={<AiOutlineComment className="text-lg" />}
          >
            {totalComments} Comments
          </Button>
          <Button
            isDisabled
            size="sm"
            variant="light"
            startContent={<HiOutlineEye className="text-lg" />}
          >
            {totalViews} Views
          </Button>
        </div>
        <span className="px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-900">
          {category.name}
        </span>
      </div>
    </div>
  );
};

export default BlogCard;
