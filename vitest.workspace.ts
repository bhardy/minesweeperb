import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineWorkspace } from "vitest/config";
import type { TestProjectInlineConfiguration } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
const projects: TestProjectInlineConfiguration[] = [
  // Unit tests configuration
  {
    test: {
      name: "unit",
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
  },
];

// Only add Storybook tests when explicitly requested
if (process.env.STORYBOOK_TESTS === "true") {
  projects.push({
    plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
      (
        await import("@storybook/experimental-addon-test/vitest-plugin")
      ).storybookTest({
        configDir: path.join(dirname, ".storybook"),
      }),
    ],
    test: {
      name: "storybook",
      environment: "jsdom",
      globals: true,
      setupFiles: [".storybook/vitest.setup.ts"],
    },
  });
}

export default defineWorkspace(projects);
