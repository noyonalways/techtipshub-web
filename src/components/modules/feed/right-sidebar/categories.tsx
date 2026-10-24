import React from "react";
import CategoryButton from "@/components/ui/category-button";
import { ICategory } from "@/types";

interface IProps {
  categories: ICategory[];
}

const Categories = ({ categories }: IProps) => {
  return (
    <div className="space-y-3 rounded-xl border border-default/50 p-5">
      <h2 className="text-sm font-semibold">Categories</h2>
      <div className="flex flex-wrap gap-2">
        {categories.length === 0 ? (
          <p className="text-sm text-default-600">No categories yet.</p>
        ) : (
          categories.map((category) => (
            <CategoryButton key={category._id} {...category} />
          ))
        )}
      </div>
    </div>
  );
};

export default Categories;
