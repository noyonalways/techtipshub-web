import { IBlog } from "@/types";

interface IProps {
  blog: IBlog
}

const PrintBlog = ({blog}: IProps) => {
  return (
    <div>
      <h1>Component</h1>
    </div>
  );
};

export default PrintBlog;
