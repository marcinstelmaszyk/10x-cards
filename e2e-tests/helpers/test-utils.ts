import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

// Ensure screenshots directory exists
const screenshotsDir = path.join(process.cwd(), "screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Custom test fixture with additional helpers
 */
export const test = base.extend({
  // Add context isolation for each test
  context: async ({ browser }, callback) => {
    // Create a new isolated context for this test
    const context = await browser.newContext();
    await callback(context);
    // Dispose the context after the test
    await context.close();
  },
});

/**
 * Helper to wait for a given time
 * @param ms - Milliseconds to wait
 */
export const wait = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Helper to check if an element is visible
 * @param selector - CSS selector for the element
 * @param page - Playwright page
 */
export const isVisible = async (selector: string, page: Page): Promise<boolean> => {
  try {
    const element = await page.$(selector);
    if (!element) return false;

    const isVisible = await element.isVisible();
    return isVisible;
  } catch {
    return false;
  }
};

// Re-export expect for convenience
export { expect };
