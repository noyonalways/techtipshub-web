"use client";

import { ICategory } from "@/types";
import { Button } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { categoryPath } from "@/lib/feed-routes";

interface IProps extends ICategory {
  /** Marks the category whose page is open. */
  active?: boolean;
}

/**
 * A category chip. It links to the category's own page rather than rewriting
 * the feed's query string, so the filter is crawlable and the page it lands on
 * can be cached. A name that cannot form a path falls back to the feed.
 */
const CategoryButton = ({ name, active = false }: IProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const href = categoryPath(name);
  const isCurrent = active || (href !== "/" && pathname === href);

  return (
    <Button
      className="bg-default-100 font-medium text-foreground hover:bg-default-200 data-[current=true]:bg-default-200"
      data-current={isCurrent}
      aria-current={isCurrent ? "page" : undefined}
      onClick={() => router.push(href)}
      radius="full"
      size="sm"
      variant="flat"
    >
      {name}
    </Button>
  );
};

export default CategoryButton;
