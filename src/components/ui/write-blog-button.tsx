"use client";

import { useUser } from "@/context/user.provider";
import { WriteBlogModal } from "../modals";

interface IProps {}

const WriteBlogButton: React.FC<IProps> = () => {
  const { user } = useUser();
  return (
    <>
      {user && <WriteBlogModal />}
    </>
  );
};

export default WriteBlogButton;
;
