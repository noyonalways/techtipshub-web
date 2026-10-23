"use client";

import React, { useEffect, useState } from "react";
import MiniFooter from "@/components/shared/mini-footer";
import { Skeleton } from "@heroui/react";
import Categories from "./categories";
import { getAllCategories } from "@/services/category";
import { ICategory } from "@/types";
import { AdSlot } from "@/components/adsense";

const RightSideBar = () => {
  const [categories, setCategories] = useState<ICategory[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getAllCategories();
        setCategories(categoryData?.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <aside className="tth-rail hidden w-72 shrink-0 border-l border-default/60 xl:block">
      <div className="tth-rail-inner flex flex-col gap-5 px-4 py-5">
        <div className="shrink-0">
          {isLoading ? (
            <div className="space-y-3 rounded-xl border border-default/50 p-5">
              <h2 className="text-sm font-semibold">Categories</h2>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            </div>
          ) : (
            <Categories categories={categories || []} />
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <MiniFooter />
          {/* Sidebar ad unit, kept last so it sits below the categories. */}
          <div className="tth-rail-ad">
            <AdSlot
              placement="right-rail"
              className="mt-0 rounded-[10px] border border-default/60 bg-default-50/30 px-3 pb-2"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSideBar;
