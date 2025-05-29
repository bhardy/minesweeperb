import type { SVGProps } from "react";
import SunglassesSvg from "./svg/sunglasses.svg";

export const SunglassesIcon = ({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) => {
  return <SunglassesSvg width={size} height={size} {...props} />;
};
