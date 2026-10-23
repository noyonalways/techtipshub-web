interface IProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page-width wrapper for the site. Keeps a consistent horizontal gutter at
 * every breakpoint so content never touches the viewport edge on mobile, and
 * stays on the same axis as the header and the footer (`max-w-page`, set in
 * globals.css).
 *
 * A page that needs a narrower column caps its content *inside* this wrapper,
 * so the left edge stays put and only the right edge moves.
 */
const Container: React.FC<IProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
