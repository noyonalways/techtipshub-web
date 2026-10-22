"use client";

import React, { useEffect, useState } from "react";
import MiniFooter from "@/components/shared/mini-footer";
import { Skeleton } from "@heroui/react";
import Categories from "./categories";
import { getAllCategories } from "@/services/category";
import { ICategory } from "@/types";
import AdBanner from "@/components/adsense/ad-banner";

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
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-l border-default/50 px-4 py-6 xl:block xl:w-72">
      <div className="h-full space-y-6 overflow-y-auto">
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

        <div className="space-y-4">
          <MiniFooter />
          {/* Existing sidebar ad unit — position frozen. */}
          <AdBanner />
        </div>
      </div>
    </aside>
  );
};

export default RightSideBar;
