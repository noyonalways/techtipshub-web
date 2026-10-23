interface IProps {
  /** Accessible name for the scrollable region, e.g. "Cookie categories". */
  label: string;
  children: React.ReactNode;
}

/**
 * Data table inside a legal document.
 *
 * On phones a four-column table becomes unreadable if it is squeezed into the
 * viewport, so the table keeps a readable minimum width (see
 * `.legal-table-scroll` in globals.css) and scrolls sideways inside this
 * container. The region is focusable so keyboard users can scroll it with the
 * arrow keys, and it carries a name for screen readers.
 */
const LegalTable = ({ label, children }: IProps) => {
  return (
    <div>
      <div className="mb-2 text-xs text-default-600 sm:hidden">
        Swipe sideways to see every column.
      </div>
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className="legal-table-scroll rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-300"
      >
        {children}
      </div>
    </div>
  );
};

export default LegalTable;
