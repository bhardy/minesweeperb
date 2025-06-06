import type { SVGProps } from "react";
import FlagSvg from "./svg/flag.svg";

export const FlagIcon = ({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) => {
  return <FlagSvg width={size} height={size} {...props} />;
};
