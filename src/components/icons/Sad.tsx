import type { SVGProps } from "react";
import SadSvg from "@/public/icons/sad.svg";

export const SadIcon = ({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) => {
  return <SadSvg width={size} height={size} {...props} />;
};
