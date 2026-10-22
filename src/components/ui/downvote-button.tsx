"use client";

import { useUser } from "@/context/user.provider";
import { useVoteOnPost } from "@/hooks/post.hook";
import { Button, ButtonProps } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { AuthenticationModal } from "../modals";

interface IProps extends ButtonProps {
  children: ReactNode;
  postId: string;
  slug?: string;
}

const DownVoteButton = ({ children, postId, slug,  ...props }: IProps) => {
  const { user } = useUser();
  const { mutate: upVote, isPending } = useVoteOnPost();

  const handleDownvote = () => {
    upVote({ postId: postId, voteType: "downvote" });
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
