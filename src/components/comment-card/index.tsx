import { IComment } from "@/types/comment.type";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MdModeEdit, MdDelete } from "react-icons/md";
import UpdateDeleteComment from "../modules/post/update-delete-comment";

interface IProps extends IComment {}

const CommentCard = ({ user, content, createdAt, images, _id }: IProps) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  // Dynamic grid class based on the number of images
  const gridCols =
    images.length === 1
      ? "grid-cols-1"
      : images.length === 2
      ? "grid-cols-2"
      : images.length === 3
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className="border border-default/50 p-4 rounded-lg relative">
      <UpdateDeleteComment
        commentUserEmail={user?.email}
        commentId={_id}
        content={content}
      />
      <Link
        href={`/users/@${user?.username}`}
        className="inline-flex space-x-4"
      >
        <Avatar
          className="size-12 object-cover"
          radius="full"
          src={user?.profilePicture}
          name={user?.fullName}
        />
        <div className="flex flex-col items-start">
          <h3 className="font-medium">{user?.fullName}</h3>
          <span className="text-default-500 text-xs">{timeAgo}</span>
        </div>
      </Link>

      <p className="text-default-500 text-base my-4">{content}</p>
      {images && images.length > 0 && (
        <div className={`grid gap-4 max-w-lg ${gridCols}`}>
          {images?.map((image, index) => (
            <Image
              key={index}
              className={`${
                images?.length === 1 ? "col-span-full" : ""
              } object-cover rounded-lg`}
              src={image}
              alt={`Comment image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
