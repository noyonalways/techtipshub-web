import MiniFooter from "@/components/shared/mini-footer";
import Categories from "./categories";
import { siteCategories } from "@/lib/site-settings";
import { AdSlot } from "@/components/adsense";

/**
 * The feed's right rail.
 *
 * A server component: the category list is the same for every reader, so it is
 * fetched once (and cached by tag) and shipped as markup instead of being
 * requested again in the browser after hydration. The ad unit and the footer
 * inside it are the client parts.
 */
const RightSideBar = async () => {
  const categories = await siteCategories();

  return (
    <aside className="tth-rail hidden w-72 shrink-0 border-l border-default/60 xl:block">
      <div className="tth-rail-inner flex flex-col gap-5 px-4 py-5">
        <div className="shrink-0">
          <Categories categories={categories} />
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
