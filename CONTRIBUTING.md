# Contributing to SelfHub

Thanks for your interest in contributing! Pull requests are welcome.

## Getting Started

1. Fork the repository and clone your fork.
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string.
4. Run the development server:

   ```bash
   pnpm dev
   ```

## Before Submitting a PR

- Make sure the type check and build pass:

  ```bash
  pnpm typecheck
  pnpm build
  ```

- Keep changes focused - one feature or fix per PR.
- Use conventional commit messages (`feat:`, `fix:`, `docs:`, `chore:`, etc.).

## Reporting Issues

Open an issue on GitHub with a clear description, steps to reproduce, and your environment details (Node.js version, OS).
