interface IProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page-width wrapper for the public site. Keeps a consistent horizontal gutter
 * at every breakpoint so content never touches the viewport edge on mobile.
 */
const Container: React.FC<IProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
