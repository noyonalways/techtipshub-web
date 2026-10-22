interface IProps {
  title: string
}

const DashboardTitle = ({title}: IProps) => {
  return (
    <div className="flex flex-col mb-8">
      <h1 className="text-3xl font-semibold inline-block relative w-fit">
        {title}
        <span className="absolute left-0 -bottom-2 h-1 bg-primary rounded-full w-1/2" />
      </h1>
    </div>
  );
};

export default DashboardTitle;