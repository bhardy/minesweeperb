import type { SVGProps } from "react";
import MineSvg from "./svg/mine.svg";

export const MineIcon = ({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) => {
  return <MineSvg width={size} height={size} {...props} />;
};
