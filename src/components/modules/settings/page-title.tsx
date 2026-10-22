import type { ReactNode } from "react";

interface IProps {
  title: string;
  description: string;
  /** Optional control rendered on the right of the heading (a button, link…). */
  action?: ReactNode;
}

/**
 * Page heading for the dense account area. Sits on the same hairline rule
 * used across the public site, sized for scanning rather than reading.
 */
const PageTitle = ({ title, description, action }: IProps) => {
  return (
    <div className="flex flex-col gap-3 border-b border-default/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-default-500">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageTitle;
