# 10x-cards

## Project Description

10x-cards is an application designed to streamline the creation and management of educational flashcards. It leverages AI by integrating language models (LLM) to automatically generate flashcard suggestions from pasted text. In addition to automated generation, users can manually create, edit, and manage flashcards, making it a versatile tool for effective learning using spaced repetition techniques.

## Tech Stack

- **Frontend**: Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, built-in authentication, and more)
- **AI Integration**: LLM models via Openrouter.ai for generating flashcard suggestions
- **Development Tools**: Node.js (v22.14.0 as specified in .nvmrc), npm

## Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd 10x-cards
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
4. Ensure you are using Node.js version **22.14.0** (as specified in the .nvmrc file).

## Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build.
- `npm run astro` - Executes Astro CLI commands.
- `npm run lint` - Lints the project files.
- `npm run lint:fix` - Automatically fixes linting issues.
- `npm run format` - Formats the code using Prettier.

## Project Scope

The project scope includes:

- **Automatic Flashcards Generation**: Users can paste text (e.g., excerpts from textbooks) and receive AI-generated flashcard suggestions.
- **Manual Flashcards Management**: Functionality for manually creating, editing, and deleting flashcards.
- **User Authentication**: Registration, login, and secure access to personalized flashcards.
- **Spaced Repetition Integration**: Incorporation of a review algorithm to help users schedule effective study sessions.
- **Metrics and Analytics**: Tracking the number and acceptance rate of flashcards generated by the AI.

## Project Status

MVP under active development.

## License

This project is licensed under the MIT License.
