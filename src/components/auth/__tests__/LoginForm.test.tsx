import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";

// Mockujemy fetch API
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mockujemy window.location.href
const originalLocation = window.location;
beforeEach(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { href: "" },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});

describe("LoginForm", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders login form correctly", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
    expect(screen.getByText(/forgot password/i)).toBeDefined();
    expect(screen.getByText(/don't have an account/i)).toBeDefined();
    expect(screen.getByText(/register/i)).toBeDefined();
  });

  it("validates required fields", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    // Kliknij submit bez wypełniania pól
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText("Email is required")).toBeDefined();
    expect(screen.getByText("Password is required")).toBeDefined();
  });

  it("doesn't submit form with invalid email format", async () => {
    // Mockujemy fetch, ale nie powinien być wywołany
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<LoginForm />);
    const user = userEvent.setup();

    // Wprowadź nieprawidłowy format email
    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Sprawdź, czy fetch nie został wywołany - co oznacza że walidacja zadziałała
    expect(mockFetch).not.toHaveBeenCalled();

    // Sprawdź, czy przycisk jest nadal aktywny (nie w stanie ładowania)
    expect(screen.getByRole("button", { name: /login/i })).toBeDefined();
  });

  it("submits the form with valid data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ redirectTo: "/dashboard" }),
    });

    render(<LoginForm />);
    const user = userEvent.setup();

    // Wypełnij prawidłowe dane
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });

    // Sprawdź czy nastąpiło przekierowanie
    expect(window.location.href).toBe("/dashboard");
  });

  it("displays API error messages", async () => {
    const errorMessage = "Invalid credentials";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    });

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });

  it("handles network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("An error occurred during login. Please try again.")).toBeDefined();
    });
  });

  it("disables form elements during submission", async () => {
    // Mockujemy opóźnioną odpowiedź, żeby zobaczyć stan ładowania
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ redirectTo: "/dashboard" }),
            });
          }, 100);
        })
    );

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Sprawdź czy przycisk jest wyłączony i wyświetla stan ładowania
    expect(screen.getByRole("button", { name: /logging in/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /logging in/i }).hasAttribute("disabled")).toBe(true);

    // Sprawdź czy pola są wyłączone podczas ładowania
    expect(screen.getByLabelText(/email/i).hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText(/password/i).hasAttribute("disabled")).toBe(true);

    // Poczekaj na zakończenie zapytania
    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });
});
