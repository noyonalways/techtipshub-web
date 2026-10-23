"use client";

import CategoriesManager from "@/components/admin/categories-manager";
import AdminPageHeader from "@/components/modules/admin/kit/page-header";
import { useAdminTitle } from "@/components/shared/admin-sidebar/use-admin-title";

const CategoriesPage = () => {
  useAdminTitle("Categories");

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="The topics readers filter the feed by. Each row shows how many published articles use it, so you can see what is in use before you change it."
      />
      <CategoriesManager />
    </div>
  );
};

export default CategoriesPage;
