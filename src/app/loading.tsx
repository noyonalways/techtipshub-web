import { Button } from "@heroui/button";
import { FaCircleNotch } from "react-icons/fa6";

interface IProps {}

const RootLoading = ({}: IProps) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Button isIconOnly className="text-3xl" size="lg"color="primary" variant="light">
        <FaCircleNotch className="animate-spin" />
      </Button>
    </div>
  );
};

export default RootLoading;