import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Base Page Object class to be extended by all page objects
 */
export class BasePage {
  readonly page: Page;
  readonly url: string;

  /**
   * @param page - Playwright page
   * @param url - URL of the page, can be relative to baseURL
   */
  constructor(page: Page, url = "/") {
    this.page = page;
    this.url = url;
  }

  /**
   * Navigate to the page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take a screenshot
   * @param name - Name of the screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  /**
   * Visual testing with screenshot
   */
  async expectScreenshotMatch(): Promise<void> {
    await expect(this.page).toHaveScreenshot();
  }
}
