"use client"

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
    <div className="hidden lg:inline-block xl:basis-[22%] 2xl:basis-[18%] space-y-6 sticky top-16 lg:pt-4 2xl:pr-2 lg:pl-0 h-[calc(100vh-85px)] lg:overflow-y-hidden">
      {isLoading ? (
        <div className="border border-default/50 p-6 rounded-xl space-y-2">
          <h2 className="font-semibold text-lg">Categories</h2>
          <div className="gap-2 flex flex-wrap">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      ) : (
        <Categories categories={categories || []} />
      )}
      <div className="space-y-4">
        <MiniFooter />
        {/* ad banner */}
        <AdBanner />
      </div>
    </div>
  );
};

export default RightSideBar;
