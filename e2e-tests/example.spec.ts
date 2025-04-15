import { test, expect } from "@playwright/test";
import { BasePage } from "./pages/BasePage";

test.describe("Example tests", () => {
  test("has title", async ({ page }) => {
    // Example of a simple page test
    const basePage = new BasePage(page, "/");
    await basePage.goto();

    // Check the page title
    await expect(page).toHaveTitle(/10x Cards/);
  });

  test("navigation works", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Example of clicking a navigation element
    // Update the selector to match your actual navigation element
    await page.click("text=Home");

    // Assert URL changed
    await expect(page).toHaveURL("/");
  });

  test("visual comparison test", async ({ page }) => {
    // Navigate to the page
    await page.goto("/");

    // Take a screenshot for visual comparison
    // This will compare with a baseline screenshot if it exists
    await expect(page).toHaveScreenshot("homepage.png");
  });
});
