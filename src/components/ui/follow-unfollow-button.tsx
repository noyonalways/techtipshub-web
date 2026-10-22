"use client";

import { useUser } from "@/context/user.provider";
import { useFollowUser, useUnfollowUser } from "@/hooks/user.hook";
import { getUserFollowingStatus } from "@/services/user";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import { HiMinus } from "react-icons/hi2";
import { AuthenticationModal } from "../modals";

interface IProps {
  id: string;
}

const FollowUnFollowButton: React.FC<IProps> = ({ id }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");
  const { user: loggedInUser } = useUser();
  const { mutate: followUser, isPending: isFollowPending } = useFollowUser();
  const { mutate: unFollowUser, isPending: isUnFollowPending } =
    useUnfollowUser();

  const handleGetUserFollowingStatus = async () => {
    setIsLoading(true);
    if (!loggedInUser) {
      setIsFollowing(false); // No user, not following
      setIsLoading(false);
      return;
    }

    if (loggedInUser.role === "Admin") {
      setIsFollowing(false);
      setIsLoading(false);
      return;
    }

    const response = await getUserFollowingStatus(id);
    if (response?.data?.isFollowing) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleGetUserFollowingStatus(); // Call when user changes or after follow/unfollow
  }, [loggedInUser, isFollowPending, isUnFollowPending]);

  // Set the redirect path to the current path on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectPath(window.location.pathname);
    }
  }, []);

  const handleFollow = () => {
    followUser(id);
  };

  const handleUnFollow = () => {
    unFollowUser(id);
  };

  // Authentication modal button props
  const props = {
    size: "sm",
    radius: "full",
    variant: "solid",
    color: "primary",
    startContent: <GoPlus className="text-lg" />,
  };

  return (
    <>
      {isLoading ? (
        <Button
          size="sm"
          radius="full"
          variant="solid"
          color="primary"
          isLoading={isLoading}
         />
      ) : (
        <>
          {loggedInUser ? (
            <>
              {isFollowing ? (
                <Button
                  onClick={handleUnFollow}
                  isDisabled={loggedInUser?._id === id}
                  size="sm"
                  radius="full"
                  variant="solid"
                  color="primary"
                  startContent={<HiMinus className="text-lg" />}
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  isDisabled={
                    loggedInUser?._id === id || loggedInUser?.role === "Admin"
                  }
                  size="sm"
                  radius="full"
                  variant="solid"
                  color="primary"
                  startContent={<GoPlus className="text-lg" />}
                >
                  Follow
                </Button>
              )}
            </>
          ) : (
            <AuthenticationModal
              redirect={redirectPath}
              buttonContent={"Follow"}
              {...props}
            />
          )}
        </>
      )}
    </>
  );
};

export default FollowUnFollowButton;
