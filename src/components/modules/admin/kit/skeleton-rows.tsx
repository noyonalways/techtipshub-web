import { Skeleton } from "@heroui/skeleton";

const widths = ["w-32", "w-40", "w-24", "w-20", "w-16"];

/**
 * Placeholder rows for `DataTable`. Rendered inside the real table body so the
 * header stays in place and the row height matches the loaded state. Cells
 * carry the same hairline as real rows, which keeps the frame from jumping
 * when the data lands.
 */
export default function SkeletonRows({
  rows = 6,
  columns,
}: {
  rows?: number;
  columns: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td
              key={columnIndex}
              className="border-b border-default/50 px-4 py-3.5 group-last/row:border-b-0"
            >
              <Skeleton className="h-3.5 rounded">
                <span
                  className={`block ${widths[columnIndex % widths.length]}`}
                  aria-hidden
                >
                  &nbsp;
                </span>
              </Skeleton>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
