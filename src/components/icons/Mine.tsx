import type { SVGProps } from "react";
import MineSvg from "@/public/icons/mine.svg";

export const MineIcon = ({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) => {
  return <MineSvg width={size} height={size} {...props} />;
};
