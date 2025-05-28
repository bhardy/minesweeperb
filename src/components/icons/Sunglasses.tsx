import type { SVGProps } from "react";
import SunglassesSvg from "@/public/icons/sunglasses.svg";

export const SunglassesIcon = ({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) => {
  return <SunglassesSvg width={size} height={size} {...props} />;
};
