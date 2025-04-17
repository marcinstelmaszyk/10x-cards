import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class FlashcardGenerationPage {
  readonly page: Page;
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly saveAllButton: Locator;
  readonly saveAcceptedButton: Locator;
  readonly flashcardProposalsContainer: Locator;
  readonly flashcardList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textInput = page.locator('[data-test-id="flashcard-text-input"]');
    this.generateButton = page.locator('[data-test-id="generate-flashcards-button"]');
    this.saveAllButton = page.locator('[data-test-id="save-all-flashcards-button"]');
    this.saveAcceptedButton = page.locator('[data-test-id="save-accepted-flashcards-button"]');
    this.flashcardProposalsContainer = page.locator('[data-test-id="flashcard-proposals-container"]');
    this.flashcardList = page.locator('[data-test-id="flashcard-list"]');
  }

  async goto() {
    await this.page.goto("/generate");

    await this.page.waitForLoadState("networkidle");
    await expect(this.page.locator('[data-test-id="flashcard-generation-view"]')).toBeVisible({ timeout: 10000 });
  }

  async fillTextInput(text: string) {
    await this.textInput.fill(text);
  }

  async clickGenerateButton() {
    await this.generateButton.click();
    // Wait for the proposals to appear
    await this.waitForFlashcardProposals();
  }

  async waitForFlashcardProposals() {
    await expect(this.flashcardProposalsContainer).toBeVisible({ timeout: 30000 });
  }

  async saveAllProposals() {
    await this.saveAllButton.click();
    // Wait for the save operation to complete (adjust as needed)
    await expect(this.saveAllButton).not.toBeDisabled({ timeout: 10000 });
  }

  async saveAcceptedProposals() {
    await this.saveAcceptedButton.click();
    // Wait for the save operation to complete
    await expect(this.saveAcceptedButton).not.toBeDisabled({ timeout: 10000 });
  }

  async getFlashcardItems() {
    return this.page.locator('[data-test-id^="flashcard-item-"]');
  }

  async acceptFlashcard(index: number) {
    const items = await this.getFlashcardItems();
    const count = await items.count();

    if (index < 0 || index >= count) {
      throw new Error(`Index ${index} out of bounds for flashcard items count ${count}`);
    }

    const acceptButton = items.nth(index).locator('[data-test-id^="flashcard-accept-button-"]');
    await acceptButton.click();
  }

  async acceptAllFlashcards() {
    const items = await this.getFlashcardItems();
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const acceptButton = items.nth(i).locator('[data-test-id^="flashcard-accept-button-"]');
      await acceptButton.click();
    }
  }
}
