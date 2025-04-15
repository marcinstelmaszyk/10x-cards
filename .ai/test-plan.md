# Plan Testów dla Projektu 10x-cards

## 1. Wprowadzenie i cele testowania

Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji 10x-cards - narzędzia do generowania i zarządzania fiszkami edukacyjnymi z wykorzystaniem sztucznej inteligencji. Głównym celem testowania jest zapewnienie wysokiej jakości oprogramowania poprzez weryfikację poprawności działania wszystkich funkcjonalności, wydajności systemu oraz bezpieczeństwa danych użytkowników.

### Cele szczegółowe:
- Weryfikacja poprawności działania generatora fiszek opartego o AI
- Sprawdzenie procesu zapisywania, edycji i zarządzania fiszkami
- Testowanie interfejsu użytkownika pod kątem responsywności i dostępności
- Weryfikacja integracji z bazą danych Supabase
- Sprawdzenie zabezpieczeń i mechanizmów autoryzacji
- Identyfikacja potencjalnych problemów wydajnościowych

## 2. Zakres testów

Testy obejmą wszystkie kluczowe komponenty i funkcjonalności aplikacji 10x-cards:

1. **Generowanie fiszek**:
   - Proces wprowadzania tekstu źródłowego
   - Walidacja długości tekstu (1000-10000 znaków)
   - Integracja z API generacji opartym o AI
   - Obsługa błędów generacji

2. **Zarządzanie fiszkami**:
   - Zapisywanie wygenerowanych fiszek (wszystkich lub wybranych)
   - Edycja treści fiszek (przód i tył)
   - Akceptowanie i odrzucanie propozycji fiszek
   - Walidacja danych (max 200 znaków na przód, max 500 znaków na tył)

3. **Integracja z bazą danych**:
   - Poprawność operacji CRUD na tabelach w Supabase
   - Obsługa błędów bazy danych
   - Spójność danych

4. **Interfejs użytkownika**:
   - Responsywność dla różnych urządzeń i rozmiarów ekranu
   - Dostępność i zgodność z WCAG
   - Intuicyjność nawigacji

5. **Bezpieczeństwo**:
   - Autoryzacja użytkowników
   - Walidacja danych wejściowych
   - Zabezpieczenie API

## 3. Typy testów do przeprowadzenia

### 3.1. Testy jednostkowe
- Testowanie poszczególnych komponentów React
- Testowanie funkcji walidacyjnych
- Testowanie serwisów i pomocników

### 3.2. Testy integracyjne
- Integracja frontendu z backendem (API)
- Integracja z Supabase
- Integracja z serwisem AI (OpenRouter)

### 3.3. Testy końcowe (E2E)
- Przeprowadzenie pełnych scenariuszy użycia
- Testowanie procesu generacji i zapisywania fiszek
- Testowanie edycji i zarządzania fiszkami

### 3.4. Testy wydajnościowe
- Testowanie czasu ładowania aplikacji
- Testowanie czasu odpowiedzi API
- Testowanie wydajności przy dużej liczbie fiszek

### 3.5. Testy bezpieczeństwa
- Testowanie mechanizmów autoryzacji
- Testowanie walidacji danych wejściowych
- Testowanie zabezpieczeń API

### 3.6. Testy użyteczności i dostępności
- Testowanie intuicyjności interfejsu
- Testowanie zgodności z WCAG
- Testowanie responsywności

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Generowanie fiszek
1. **Generowanie z poprawnym tekstem**
   - Wprowadzenie tekstu o długości 5000 znaków
   - Weryfikacja poprawności procesu generacji
   - Sprawdzenie czy wygenerowane fiszki zawierają sensowne dane

2. **Generowanie z tekstem o minimalnej długości**
   - Wprowadzenie tekstu o długości dokładnie 1000 znaków
   - Weryfikacja czy proces generacji działa poprawnie

3. **Generowanie z tekstem o maksymalnej długości**
   - Wprowadzenie tekstu o długości dokładnie 10000 znaków
   - Weryfikacja czy proces generacji działa poprawnie i nie przekracza limitów

4. **Obsługa błędów walidacji**
   - Próba generacji z tekstem krótszym niż 1000 znaków
   - Próba generacji z tekstem dłuższym niż 10000 znaków
   - Weryfikacja poprawności komunikatów o błędach

5. **Obsługa błędów API**
   - Symulacja awarii API generacji
   - Weryfikacja poprawności obsługi błędów i komunikatów

### 4.2. Zarządzanie fiszkami
1. **Zapisywanie wszystkich fiszek**
   - Wygenerowanie listy propozycji
   - Zapisanie wszystkich propozycji
   - Weryfikacja poprawności zapisanych danych w bazie

2. **Zapisywanie wybranych fiszek**
   - Wygenerowanie listy propozycji
   - Akceptacja tylko niektórych propozycji
   - Zapisanie zaakceptowanych propozycji
   - Weryfikacja czy zostały zapisane tylko zaakceptowane fiszki

3. **Edycja fiszek**
   - Wygenerowanie propozycji
   - Edycja treści (przód i tył)
   - Zapisanie zedytowanych fiszek
   - Weryfikacja poprawności zapisanych danych i oznaczenia źródła jako "ai-edited"

4. **Walidacja danych fiszek**
   - Próba zapisania fiszki z pustym frontem lub tyłem
   - Próba zapisania fiszki z frontem dłuższym niż 200 znaków
   - Próba zapisania fiszki z tyłem dłuższym niż 500 znaków
   - Weryfikacja poprawności komunikatów o błędach

5. **Odrzucanie propozycji**
   - Wygenerowanie propozycji
   - Odrzucenie niektórych propozycji
   - Weryfikacja czy odrzucone propozycje nie są zapisywane

### 4.3. Integracja z bazą danych
1. **Zapisywanie nowych fiszek**
   - Generacja i zapisanie fiszek
   - Weryfikacja poprawności danych w bazie

2. **Obsługa błędów bazy danych**
   - Symulacja awarii bazy danych
   - Weryfikacja poprawności obsługi błędów

### 4.4. Interfejs użytkownika
1. **Responsywność**
   - Testowanie aplikacji na różnych urządzeniach
   - Testowanie przy różnych rozmiarach okna przeglądarki

2. **Dostępność**
   - Testowanie zgodności z WCAG 2.1
   - Weryfikacja poprawności czytników ekranowych
   - Testowanie nawigacji klawiaturowej

3. **Wskaźniki stanu**
   - Weryfikacja poprawności loaderów podczas generacji
   - Weryfikacja komunikatów o błędach
   - Weryfikacja powiadomień o sukcesie

## 5. Środowisko testowe

### 5.1. Środowisko rozwojowe
- Lokalne środowisko deweloperskie
- Node.js w najnowszej stabilnej wersji
- Supabase lokalnie lub zdalny serwer testowy
- Przeglądarka Chrome/Firefox/Safari w najnowszych wersjach

### 5.2. Środowisko testowe
- Serwer testowy z wdrożoną aplikacją
- Testowa baza danych Supabase
- Konfiguracja testowa dla API OpenRouter

### 5.3. Środowisko produkcyjne
- Serwer produkcyjny (testy akceptacyjne)
- Produkcyjna baza danych (testy tylko dla kluczowych funkcjonalności)

## 6. Narzędzia do testowania

### 6.1. Testy jednostkowe i integracyjne
- Vitest dla testów jednostkowych
- Playwright dla testów integracyjnych i E2E
- React Testing Library dla testów komponentów React

### 6.2. Testy wydajnościowe
- Lighthouse dla testów wydajności frontendu
- k6 lub Artillery dla testów obciążeniowych API

### 6.3. Testy bezpieczeństwa
- OWASP ZAP dla testów bezpieczeństwa
- ESLint z wtyczkami bezpieczeństwa dla statycznej analizy kodu

### 6.4. Testy dostępności
- Axe dla testów dostępności
- Pa11y dla automatyzacji testów WCAG

## 7. Harmonogram testów

### 7.1. Testy jednostkowe
- Prowadzone na bieżąco podczas rozwoju
- Automatyczne uruchamianie przy każdym commicie

### 7.2. Testy integracyjne
- Prowadzone co najmniej raz w tygodniu
- Automatyczne uruchamianie przy każdym pull requeście

### 7.3. Testy E2E
- Prowadzone przed każdym wydaniem
- Automatyczne uruchamianie w nocy dla stabilnych gałęzi
- Wykorzystanie Playwright do symulacji interakcji użytkownika

### 7.4. Testy wydajnościowe
- Prowadzone raz w miesiącu
- Automatyczne uruchamianie przed istotnymi wydaniami

### 7.5. Testy bezpieczeństwa
- Prowadzone raz na kwartał
- Dodatkowe testy przy zmianach w logice autoryzacji

### 7.6. Testy dostępności
- Prowadzone przed każdym wydaniem
- Regularne audyty manualne co kwartał

## 8. Kryteria akceptacji testów

### 8.1. Testy jednostkowe
- Pokrycie kodu testami minimum 80%
- Wszystkie testy przechodzą pomyślnie

### 8.2. Testy integracyjne
- Wszystkie scenariusze testowe przechodzą pomyślnie
- Czas odpowiedzi API nie przekracza 1 sekundy

### 8.3. Testy E2E
- Wszystkie kluczowe funkcjonalności działają zgodnie z wymaganiami
- Brak krytycznych błędów w logach

### 8.4. Testy wydajnościowe
- Czas ładowania aplikacji poniżej 2 sekund
- Wynik Lighthouse minimum 90 dla wydajności

### 8.5. Testy bezpieczeństwa
- Brak krytycznych i wysokich zagrożeń bezpieczeństwa
- Poprawna implementacja mechanizmów autoryzacji

### 8.6. Testy dostępności
- Zgodność z WCAG 2.1 na poziomie AA
- Brak krytycznych problemów z dostępnością

## 9. Role i odpowiedzialności w procesie testowania

### 9.1. Deweloperzy
- Tworzenie i utrzymanie testów jednostkowych
- Rozwiązywanie problemów wykrytych podczas testów
- Udział w przeglądach kodu

### 9.2. Testerzy
- Projektowanie i wykonywanie testów manualnych
- Tworzenie i utrzymanie testów automatycznych
- Raportowanie błędów i monitorowanie ich rozwiązania

### 9.3. DevOps
- Konfiguracja i utrzymanie środowisk testowych
- Konfiguracja CI/CD dla automatyzacji testów
- Monitorowanie wydajności aplikacji

### 9.4. Product Owner
- Ustalanie priorytetów testowania
- Akceptacja testów z perspektywy biznesowej
- Podejmowanie decyzji o gotowości do wydania

## 10. Procedury raportowania błędów

### 10.1. Format raportu błędu
- Tytuł błędu
- Środowisko testowe
- Kroki do reprodukcji
- Rzeczywisty rezultat
- Oczekiwany rezultat
- Zrzuty ekranu lub nagrania
- Poziom krytyczności (krytyczny, wysoki, średni, niski)

### 10.2. Proces obsługi błędów
- Zgłoszenie błędu w systemie śledzenia błędów
- Triage i przypisanie priorytetu
- Przydzielenie osoby odpowiedzialnej
- Naprawienie błędu
- Weryfikacja naprawy
- Zamknięcie zgłoszenia

### 10.3. Metryki jakości
- Liczba wykrytych błędów
- Czas od wykrycia do naprawy
- Liczba błędów powracających
- Liczba błędów wykrytych po wydaniu

## 11. Ryzyka i plany ich minimalizacji

### 11.1. Ryzyka techniczne
- **Ryzyko**: Problemy z integracją z API AI
  **Minimalizacja**: Przygotowanie mocków API, testy integracyjne, monitorowanie dostępności

- **Ryzyko**: Problemy z wydajnością przy dużej liczbie fiszek
  **Minimalizacja**: Testy wydajnościowe, paginacja, optymalizacja zapytań

- **Ryzyko**: Problemy z kompatybilnością przeglądarek
  **Minimalizacja**: Testy w różnych przeglądarkach, wykorzystanie cross-browser frameworks

### 11.2. Ryzyka procesowe
- **Ryzyko**: Zbyt krótki czas na testy przed wydaniem
  **Minimalizacja**: Automatyzacja testów, ciągła integracja, testy równoległe z rozwojem

- **Ryzyko**: Niewystarczające zasoby do testowania
  **Minimalizacja**: Priorytetyzacja testów, automatyzacja, zaangażowanie całego zespołu

### 11.3. Ryzyka biznesowe
- **Ryzyko**: Słaba jakość generowanych fiszek przez AI
  **Minimalizacja**: Testy jakościowe generacji, możliwość edycji przez użytkownika, mechanizm oceny jakości

## 12. Dokumentacja testowa

### 12.1. Dokumenty związane z testowaniem
- Plan testów (niniejszy dokument)
- Przypadki testowe
- Raporty z testów
- Raporty błędów
- Dokumentacja środowisk testowych

### 12.2. Utrzymanie dokumentacji
- Regularna aktualizacja dokumentacji testowej
- Wersjonowanie dokumentacji
- Przeglądy dokumentacji co kwartał 