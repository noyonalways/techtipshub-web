import { Spinner } from "@heroui/spinner";

interface IProps {}

const Loading: React.FC<IProps> = () => {
  return (
    <div className="relative">
      <div className="h-screen fixed inset-0 z-[1111] bg-default/60 backdrop-blur top-0 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    </div>
  );
};

export default Loading;