import { test as base, expect } from "@playwright/test";
import { installMetaNetwork, type MetaNetwork } from "./helpers/meta-network";

/** `meta` is installed before any navigation, so no facebook request can ever escape. */
export const test = base.extend<{ meta: MetaNetwork }>({
  meta: async ({ context }, use) => {
    await use(await installMetaNetwork(context));
  },
});

export { expect };
