import type { ReactNode } from "react";
import SkeletonRows from "./skeleton-rows";

export interface DataTableColumn {
  key: string;
  header: string;
  className?: string;
  align?: "left" | "right";
}

interface IProps<T> {
  columns: DataTableColumn[];
  rows: T[];
  getRowKey: (row: T) => string;
  renderCell: (row: T, columnKey: string) => ReactNode;
  isLoading?: boolean;
  /** Default 6. */
  skeletonRows?: number;
  /** Rendered inside a full-width cell when there are no rows and nothing is loading. */
  emptyState?: ReactNode;
  /** Rendered under the table, above the frame's bottom edge. */
  footer?: ReactNode;
  /** Default "48rem"; a number is read as px. The table scrolls inside the frame below this width. */
  minWidth?: string | number;
  /** Screen-reader caption naming the dataset. */
  caption?: string;
}

/**
 * The single table primitive for admin lists. The page never scrolls sideways:
 * the frame clips, the scroll container owns any overflow, and the table keeps
 * a readable minimum width while rows stay full-width above it.
 *
 * The header is sticky inside the scroll container, so a long list keeps its
 * column names in view on a laptop. Separators are hairlines, never zebra
 * stripes, and a right-aligned column also gets tabular figures so numbers
 * stack. `role="status"` text announces the loading state because a shimmer
 * alone is not an announcement.
 */
export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  renderCell,
  isLoading = false,
  skeletonRows = 6,
  emptyState,
  footer,
  minWidth = "48rem",
  caption,
}: IProps<T>) {
  return (
    <div className="overflow-hidden bg-content-1">
      <div className="max-h-[70vh] overflow-auto">
        <table
          className="w-full border-separate border-spacing-0 text-left text-sm"
          style={{ minWidth }}
        >
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`tth-label-sm sticky top-0 z-10 whitespace-nowrap border-b border-default/60 bg-content-1 px-4 py-2.5 ${
                    column.align === "right" ? "text-right" : "text-left"
                  } ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <SkeletonRows rows={skeletonRows} columns={columns.length} />
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="group/row align-middle transition-colors hover:bg-default-50/70 focus-within:bg-default-50/70"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`border-b border-default/50 px-4 py-3 transition-colors group-last/row:border-b-0 ${
                        column.align === "right"
                          ? "text-right tabular-nums"
                          : ""
                      } ${column.className ?? ""}`}
                    >
                      {renderCell(row, column.key)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyState}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <p className="sr-only" role="status">
          Loading rows
        </p>
      )}

      {footer}
    </div>
  );
}
