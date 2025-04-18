# Specyfikacja Architektury Autentykacji dla 10x-Cards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Struktura stron autoryzacyjnych

#### Nowe strony:

- **`/auth/login.astro`** - strona logowania z formularzem
- **`/auth/register.astro`** - strona rejestracji z formularzem
- **`/auth/reset-password.astro`** - strona do resetowania hasła
- **`/auth/reset-password-confirm.astro`** - strona potwierdzająca zmianę hasła po kliknięciu w link
- **`/auth/profile.astro`** - strona profilu użytkownika z opcją usunięcia konta

#### Modyfikacje istniejących stron:

- Strony zabezpieczone (np. `/generate.astro`, inne strony z fiszkami) - dodanie weryfikacji stanu autoryzacji
- Nawigacja globalna - aktualizacja o elementy związane z kontem użytkownika

### 1.2. Komponenty React

#### Nowe komponenty:

- **`AuthCard.tsx`** - wrapper dla formularzy autoryzacyjnych, zapewniający spójny wygląd
- **`LoginForm.tsx`** - interaktywny formularz logowania
- **`RegisterForm.tsx`** - interaktywny formularz rejestracji
- **`ResetPasswordForm.tsx`** - interaktywny formularz resetowania hasła
- **`ProfileDropdown.tsx`** - komponent menu użytkownika w nawigacji
- **`DeleteAccountForm.tsx`** - formularz potwierdzenia usunięcia konta

#### Rozszerzenia nawigacji:

- **`UserNav.tsx`** - modyfikacja wyświetlania stanu zalogowania i przycisków akcji

### 1.3. Walidacja i obsługa błędów

#### Walidacja front-end:

- **Adres email**:
  - Format poprawnego adresu email
  - Wymagane pole
- **Hasło**:
  - Minimalna długość 8 znaków
  - Wymagana duża litera, mała litera, cyfra
  - Wymagane pole
- **Potwierdzenie hasła**:
  - Musi być identyczne z hasłem

#### Komunikaty błędów:

- Błędy walidacji formularza (client-side):
  - Wyświetlane pod każdym polem w formie tekstowej
  - Podświetlenie pola z błędem (czerwona ramka)
- Błędy autoryzacji (server-side):
  - Wiadomość z API wyświetlana u góry formularza
  - Ogólne błędy serwera (500) - komunikat o problemach technicznych

### 1.4. Przepływy użytkownika

#### Rejestracja:

1. Użytkownik wchodzi na stronę `/auth/register`
2. Wypełnia formularz z adresem email i hasłem
3. Po walidacji danych frontend wysyła żądanie do `/api/auth/register`
4. Po pomyślnej rejestracji użytkownik otrzymuje potwierdzenie
5. Użytkownik zostaje automatycznie zalogowany i przekierowany na stronę główną
6. W przypadku błędu, informacja jest wyświetlana w formularzu

#### Logowanie:

1. Użytkownik wchodzi na stronę `/auth/login`
2. Wypełnia formularz z adresem email i hasłem
3. Po walidacji danych frontend wysyła żądanie do `/api/auth/login`
4. Po pomyślnym logowaniu użytkownik jest przekierowywany do widoku generowania fiszek
5. W przypadku błędu, informacja jest wyświetlana w formularzu

#### Reset hasła:

1. Użytkownik klika na "Zapomniałem hasła" na stronie logowania
2. Wypełnia formularz podając email
3. System wysyła link resetujący na podany adres
4. Użytkownik klika w link z emaila i trafia na stronę resetowania hasła
5. Wprowadza nowe hasło i zatwierdza
6. Po pomyślnej zmianie jest przekierowywany na stronę logowania

#### Wylogowanie:

1. Użytkownik klika przycisk "Wyloguj" w menu użytkownika
2. System wysyła żądanie do `/api/auth/logout`
3. Po wylogowaniu użytkownik jest przekierowywany na stronę główną (niezalogowany)

#### Usunięcie konta:

1. Użytkownik wchodzi na stronę profilu
2. Klika przycisk "Usuń konto"
3. System wyświetla formularz z potwierdzeniem (wymaga wpisania hasła)
4. Po potwierdzeniu, konto użytkownika i wszystkie jego fiszki są trwale usuwane
5. Użytkownik jest wylogowywany i przekierowywany na stronę główną

## 2. LOGIKA BACKENDOWA

### 2.1. Struktura API

#### Endpointy autoryzacji:

- **`POST /api/auth/register`** - rejestracja nowego użytkownika
  - Parametry: `email`, `password`
  - Zwraca: `user` lub `error`
- **`POST /api/auth/login`** - logowanie użytkownika
  - Parametry: `email`, `password`
  - Zwraca: `user` lub `error`
- **`POST /api/auth/logout`** - wylogowanie użytkownika
  - Zwraca: statusy `200` lub `400` z `error`
- **`POST /api/auth/reset-password`** - inicjacja procesu resetowania hasła
  - Parametry: `email`
  - Zwraca: statusy `200` lub `400` z `error`
- **`POST /api/auth/reset-password-confirm`** - zmiana hasła po resecie
  - Parametry: `token`, `newPassword`
  - Zwraca: statusy `200` lub `400` z `error`
- **`POST /api/auth/delete-account`** - usunięcie konta użytkownika
  - Parametry: `password`
  - Zwraca: statusy `200` lub `400` z `error`

### 2.2. Walidacja danych wejściowych

#### Walidacja na serwerze:

- Sprawdzanie poprawności formatu adresu email
- Sprawdzanie siły hasła
- Sprawdzanie czy email nie jest już zajęty (podczas rejestracji)
- Sanityzacja wejść przed przekazaniem do Supabase

#### Formaty odpowiedzi:

- Powodzenie:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "email"
    }
  }
  ```
- Błąd:
  ```json
  {
    "error": "Opisowy komunikat błędu"
  }
  ```

### 2.3. Obsługa wyjątków

#### Typy obsługiwanych błędów:

- Błędy autoryzacji Supabase (nieprawidłowe dane logowania)
- Błędy walidacji danych wejściowych
- Błędy związane z limitami żądań (rate limiting)
- Ogólne błędy serwera

#### Strategie obsługi:

- Logowanie błędów w systemie (bez danych osobowych)
- Zwracanie czytelnych komunikatów dla użytkownika
- Obsługa ponownych prób dla operacji wrażliwych (np. reset hasła)

### 2.4. Modyfikacje renderowania stron

#### Strony SSR wymagające autoryzacji:

- Wszystkie strony poza listą PUBLIC_PATHS będą renderowane serwerowo
- Dostęp do tych stron wymaga uwierzytelnienia (middleware sprawdza sesję)
- W przypadku braku autoryzacji - przekierowanie do logowania

#### Modyfikacje astro.config.mjs:

- Konfiguracja `output: "server"` już istnieje
- Nie wymagane dodatkowe zmiany, ponieważ Astro już jest skonfigurowane do renderowania serwerowego

## 3. SYSTEM AUTENTYKACJI

### 3.1. Implementacja Supabase Auth

#### Integracja z Supabase:

- Wykorzystanie pakietu `@supabase/ssr` zgodnie z wytycznymi
- Stworzenie serwisu `createSupabaseServerInstance` obsługującego ciasteczka
- Zapewnienie spójnej obsługi sesji w middleware

#### Pliki konfiguracyjne:

- **`src/db/supabase.server.ts`** - implementacja instancji serwerowej z obsługą ciasteczek
- **`src/middleware/index.ts`** - aktualizacja middleware do obsługi sesji

### 3.2. Zarządzanie sesją

#### Przepływ danych:

- Pobieranie sesji z ciasteczek podczas każdego żądania
- Zapisywanie danych użytkownika w `Astro.locals.user`
- Aktualizacja ciasteczek przy zmianach w sesji

#### Bezpieczeństwo ciasteczek:

- Ustawienie flag bezpieczeństwa: `httpOnly`, `secure`, `sameSite: "lax"`
- Centralizacja opcji w jednym miejscu
- Wykorzystanie wyłącznie metod `getAll` i `setAll` dla spójności

### 3.3. Ochrona ścieżek

#### Konfiguracja publicznych ścieżek:

```typescript
const PUBLIC_PATHS = [
  // Strony autoryzacyjne
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/reset-password-confirm",
  // Endpointy API autoryzacji
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/reset-password-confirm",
  // Strona główna
  "/",
];
```

#### Logika middleware:

- Sprawdzanie czy ścieżka jest w PUBLIC_PATHS
- Dla niepublicznych ścieżek - weryfikacja sesji użytkownika
- Przekierowanie na stronę logowania w przypadku braku autoryzacji

### 3.4. Integracja z istniejącą funkcjonalnością

#### Dostęp do danych użytkownika:

- Możliwość odczytu `Astro.locals.user` w komponentach Astro
- Przekazywanie ID użytkownika do API przy operacjach na fiszkach
- Filtrowanie danych w zapytaniach do bazy po ID użytkownika

#### Bezpieczeństwo endpointów API:

- Zabezpieczenie wywołań API sprawdzeniem istnienia sesji
- Weryfikacja czy użytkownik ma prawo dostępu do danych
- Konsekwentne sprawdzanie uprawnień w każdym endpoincie

### 3.5. Zgodność z wymogami prawnymi (RODO)

#### Realizacja prawa do usunięcia danych:

- Implementacja mechanizmu usuwania konta wraz ze wszystkimi danymi użytkownika
- Usuwanie fiszek powiązanych z kontem użytkownika podczas usuwania konta
- Dokumentacja procesu usuwania danych dla użytkowników

#### Realizacja prawa wglądu do danych:

- Możliwość pobrania kopii danych użytkownika i jego fiszek
- Przejrzysta informacja o przechowywanych danych w profilu użytkownika
