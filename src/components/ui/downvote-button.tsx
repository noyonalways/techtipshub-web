"use client";

import { useUser } from "@/context/user.provider";
import { useVoteOnBlog } from "@/hooks/blog.hook";
import { Button, ButtonProps } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { AuthenticationModal } from "../modals";

interface IProps extends ButtonProps {
  children: ReactNode;
  blogId: string;
  slug?: string;
}

const DownVoteButton = ({ children, blogId, slug,  ...props }: IProps) => {
  const { user } = useUser();
  const { mutate: upVote, isPending } = useVoteOnBlog();

  const handleDownvote = () => {
    upVote({ blogId: blogId, voteType: "downvote" });
  };

  return (
    <>
      {user ? (
        <Button isLoading={isPending} onClick={handleDownvote} {...props}>
          {children}
        </Button>
      ) : (
        <AuthenticationModal buttonContent={children} redirect={`blogs/${slug}`} {...props} />
      )}
    </>
  );
};

export default DownVoteButton;
