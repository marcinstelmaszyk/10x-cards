import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Tymczasowe dane logowania - PAMIĘTAJ O USUNIĘCIU PRZED COMMIT!
  const username = "e2etests@dummy.pl";
  const password = "e2etests123";

  // Usunięto sprawdzanie zmiennych środowiskowych
  // if (!username || !password) {
  //   throw new Error("Zmienne środowiskowe E2E_TEST_USERNAME i E2E_TEST_PASSWORD muszą być ustawione.");
  // }

  // Przejdź do strony logowania - dostosuj URL w razie potrzeby
  await page.goto("/auth/login");

  // Wprowadź dane logowania - dostosuj selektory w razie potrzeby
  await page.locator("#email").fill(username);
  await page.locator("#password").fill(password);
  await page.locator('button[type="submit"]').click();

  // Poczekaj na potwierdzenie zalogowania - np. sprawdzenie URL lub widoczności elementu
  // Oczekujemy przekierowania na stronę generowania fiszek
  await expect(page).toHaveURL("/generate");

  // Zapisz stan uwierzytelnienia do pliku
  await page.context().storageState({ path: authFile });

  console.log(`Stan uwierzytelnienia zapisany w ${authFile}`);
});
