import { Divider } from "@heroui/divider";

interface IProps {
  title: string;
  description: string;
}

const PageTitle = ({title, description}: IProps) => {
  return (
    <div className="space-y-1 my-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="pb-4 text-default-500">{description}</p>
      <Divider className="bg-default/50" />
    </div>
  );
};

export default PageTitle;