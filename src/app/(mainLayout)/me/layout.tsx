interface IProps {
  children: React.ReactNode;
}

/**
 * The account area.
 *
 * The site header and footer come from the parent layout (`(mainLayout)`), so
 * this one exists only to say what the account area is not: it has no settings
 * rail. Writing is the reason it exists, so the composer owns the full width and
 * the sticky toolbar can span the viewport. Account settings keep their rail
 * under `/settings`.
 */
const MeLayout: React.FC<IProps> = ({ children }) => <div>{children}</div>;

export default MeLayout;
