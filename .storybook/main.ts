import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test",
    "@storybook/addon-styling-webpack",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
  webpackFinal: async (config) => {
    // Handle SVG files
    config.module?.rules?.forEach((rule) => {
      if (
        rule &&
        typeof rule === "object" &&
        rule.test instanceof RegExp &&
        rule.test.test(".svg")
      ) {
        rule.exclude = /\.svg$/;
      }
    });
    config.module?.rules?.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
                "removeDimensions",
              ],
            },
          },
        },
      ],
    });
    return config;
  },
};
export default config;
