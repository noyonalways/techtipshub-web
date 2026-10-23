export * from "./auth.type";
export * from "./category.type";
export * from "./blog.type";
export * from "./user.type";
export * from "./follower.type"
export * from "./admin.type";

import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
