import { Button } from "@heroui/button";
import { AiOutlineComment } from "react-icons/ai";

interface IProps {}

const BlogCommentButton = ({}: IProps) => {
  return (
    <Button
      htmlFor="comment-field"
      as={"label"}
      className="text-2xl mx-2"
      variant="light"
      isIconOnly
      radius="full"
    >
      <AiOutlineComment />
    </Button>
  );
};

export default BlogCommentButton;
