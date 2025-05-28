import type { SVGProps } from "react";
import HappySvg from "@/public/icons/happy.svg";

export const HappyIcon = ({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) => {
  return <HappySvg width={size} height={size} {...props} />;
};
