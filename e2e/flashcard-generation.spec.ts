import { test, expect } from "@playwright/test";
import { FlashcardGenerationPage } from "./page-objects/FlashcardGenerationPage";

const SAMPLE_TEXT = `Historia sztucznej inteligencji sięga lat 50. XX wieku, kiedy to pionierzy informatyki zaczęli zadawać pytanie, czy maszyny mogą myśleć. Alan Turing, brytyjski matematyk, opublikował w 1950 roku artykuł zatytułowany "Computing Machinery and Intelligence", w którym wprowadził koncepcję testu Turinga, czyli sposobu na określenie, czy maszyna wykazuje inteligencję porównywalną z ludzką. Pierwsze programy AI, takie jak Logic Theorist stworzony przez Allena Newella i Herberta Simona w 1956 roku, potrafiły udowadniać twierdzenia matematyczne. W tym samym roku, podczas konferencji w Dartmouth, John McCarthy ukuł termin "sztuczna inteligencja", co uznaje się za oficjalne narodziny tej dziedziny. Lata 60. i 70. przyniosły rozwój systemów eksperckich, czyli programów komputerowych symulujących procesy decyzyjne ekspertów w danej dziedzinie. Jednym z pierwszych był DENDRAL, system opracowany na Uniwersytecie Stanforda, który analizował dane spektroskopowe w celu identyfikacji związków chemicznych. Kolejnym kamieniem milowym był MYCIN, system diagnostyczny dla chorób zakaźnych. W latach 80. nastąpił pierwszy "zimowy okres" w rozwoju AI, spowodowany niespełnionymi obietnicami i ograniczeniami technologicznymi. Jednak już w latach 90. zainteresowanie sztuczną inteligencją odżyło za sprawą nowych podejść, takich jak uczenie maszynowe. Przełomowym momentem było zwycięstwo komputera Deep Blue firmy IBM nad mistrzem świata w szachach, Garrim Kasparowem, w 1997 roku. XXI wiek przyniósł prawdziwą rewolucję w dziedzinie AI dzięki dostępności ogromnych zbiorów danych, zwiększonej mocy obliczeniowej i postępom w algorytmach uczenia głębokiego. W 2011 roku system Watson firmy IBM zwyciężył w teleturnieju Jeopardy, a w 2016 program AlphaGo pokonał mistrza świata w grze Go, Lee Sedola. Obecnie sztuczna inteligencja znajduje zastosowanie w niemal każdej dziedzinie życia: od wyszukiwarek internetowych, przez systemy rekomendacji, rozpoznawanie obrazów i mowy, aż po autonomiczne pojazdy i zaawansowaną diagnostykę medyczną. Modele językowe, takie jak GPT (Generative Pre-trained Transformer), potrafią generować tekst łudząco przypominający ludzki i prowadzić konwersacje na niemal każdy temat. Wraz z rozwojem AI pojawiają się jednak istotne pytania etyczne dotyczące prywatności, bezpieczeństwa, stronniczości algorytmów oraz potencjalnego wpływu na rynek pracy i społeczeństwo. Badacze i eksperci apelują o odpowiedzialne rozwijanie i wdrażanie technologii AI, które powinno uwzględniać nie tylko aspekty techniczne, ale również społeczne i humanistyczne.`;

// Testy użyją automatycznie zapisanego stanu uwierzytelnienia dzięki konfiguracji w playwright.config.ts
test.describe("Flashcard Generation Flow", () => {
  let flashcardPage: FlashcardGenerationPage;

  test.beforeEach(async ({ page }) => {
    flashcardPage = new FlashcardGenerationPage(page);
    await flashcardPage.goto();
  });

  test("Generate and save all flashcards", async () => {
    // Arrange: Wypełnij pole tekstowe przykładowym tekstem
    await flashcardPage.fillTextInput(SAMPLE_TEXT);

    // Act: Wygeneruj fiszki
    await flashcardPage.clickGenerateButton();

    // Assert: Sprawdź, czy fiszki zostały wygenerowane
    const flashcardItems = await flashcardPage.getFlashcardItems();
    const count = await flashcardItems.count();
    expect(count).toBeGreaterThan(0);

    // Act: Zapisz wszystkie fiszki
    await flashcardPage.saveAllProposals();

    // Assert: Sprawdź stan sukcesu (np. powiadomienie toast lub przekierowanie do nowej strony)
    // To zależy od zachowania aplikacji po zapisaniu
    // Na przykład, jeśli kontener propozycji znika:
    await expect(flashcardPage.flashcardProposalsContainer).not.toBeVisible();
  });

  test("Accept some flashcards and check border color", async () => {
    // Arrange: Wypełnij pole tekstowe przykładowym tekstem i wygeneruj fiszki
    await flashcardPage.fillTextInput(SAMPLE_TEXT);
    await flashcardPage.clickGenerateButton();

    // Act: Zaakceptuj pierwszą i trzecią fiszkę
    const flashcardItems = await flashcardPage.getFlashcardItems();
    await flashcardPage.acceptFlashcard(0);
    await flashcardPage.acceptFlashcard(2);

    // Assert: Sprawdź, czy zaakceptowane fiszki mają zielony kolor obramowania
    // Oczekiwany kolor dla border-green-500 to rgb(34, 197, 94)
    const expectedBorderColor = "rgb(34, 197, 94)";

    const firstItem = flashcardItems.nth(0);
    await expect(firstItem).toHaveCSS("border-color", expectedBorderColor);

    const thirdItem = flashcardItems.nth(2);
    await expect(thirdItem).toHaveCSS("border-color", expectedBorderColor);

    // Opcjonalnie: Sprawdź, czy druga (niezaakceptowana) fiszka NIE ma zielonego obramowania
    const secondItem = flashcardItems.nth(1);
    await expect(secondItem).not.toHaveCSS("border-color", expectedBorderColor);
  });
});
