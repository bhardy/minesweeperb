import type { Meta, StoryObj } from "@storybook/react";
import { MineIcon, FlagIcon, HappyIcon, SadIcon, SunglassesIcon } from ".";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect } from "react";

const icons = {
  Mine: MineIcon,
  Flag: FlagIcon,
  Happy: HappyIcon,
  Sad: SadIcon,
  Sunglasses: SunglassesIcon,
} as const;

type IconName = keyof typeof icons;
type Theme = "system" | "light" | "dark";
type Size = "small" | "medium" | "large";

const sizeMap = {
  small: "24px",
  medium: "48px",
  large: "60px",
} as const;

interface IconStoryProps {
  icon: IconName;
  theme: Theme;
  size: Size;
}

const meta = {
  title: "Components/Icons",
  component: () => null,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "select",
      options: Object.keys(icons),
    },
    theme: {
      control: "select",
      options: ["system", "light", "dark"],
    },
    size: {
      control: "select",
      options: Object.keys(sizeMap),
    },
  },
} satisfies Meta<IconStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const IconGrid = ({ size }: { size: Size }) => (
  <div className="grid grid-cols-3 gap-4 p-4">
    {Object.entries(icons).map(([name, Icon]) => (
      <div key={name} className="flex flex-col items-center gap-2">
        <Icon style={{ width: sizeMap[size], height: sizeMap[size] }} />
        <span className="text-sm">{name}</span>
      </div>
    ))}
  </div>
);

const SingleIcon = ({ icon, size }: { icon: IconName; size: Size }) => {
  const Icon = icons[icon];
  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <Icon style={{ width: sizeMap[size], height: sizeMap[size] }} />
      <span className="text-sm">{icon}</span>
    </div>
  );
};

const ThemeWrapper = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return <>{children}</>;
};

export const Grid: Story = {
  args: {
    theme: "system",
    size: "medium",
  },
  render: (args: Record<string, unknown>) => (
    <ThemeProvider
      attribute="class"
      defaultTheme={args.theme as Theme}
      enableSystem
    >
      <ThemeWrapper theme={args.theme as Theme}>
        <div className="rounded-lg border p-4">
          <IconGrid size={args.size as Size} />
        </div>
      </ThemeWrapper>
    </ThemeProvider>
  ),
};

export const Single: Story = {
  args: {
    icon: "Mine",
    theme: "system",
    size: "medium",
  },
  render: (args: Record<string, unknown>) => (
    <ThemeProvider
      attribute="class"
      defaultTheme={args.theme as Theme}
      enableSystem
    >
      <ThemeWrapper theme={args.theme as Theme}>
        <div className="rounded-lg border p-4">
          <SingleIcon icon={args.icon as IconName} size={args.size as Size} />
        </div>
      </ThemeWrapper>
    </ThemeProvider>
  ),
};
