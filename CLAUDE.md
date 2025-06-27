# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production version
- `pnpm start` - Start production server

### Testing
- `pnpm test` - Run tests with Vitest in watch mode
- `pnpm test:cov` - Run tests with coverage report

### Code Quality
- `pnpm lint` - Run ESLint for code linting

## Architecture

This is a Next.js 15 Todo application following Test-Driven Development (TDD) principles with the "Tidy First" methodology.

### Tech Stack
- **Next.js 15** with App Router
- **React 19** 
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Vitest** with jsdom for testing
- **pnpm** as package manager

### Directory Structure
- `app/` - Next.js App Router pages and layouts
- `docs/` - Comprehensive documentation including architecture, features, and examples
- `instructions/` - Development workflow guidelines and coding standards
- `public/` - Static assets

### Development Workflow

This project strictly follows TDD with "Tidy First" methodology:

1. **Tidy First** (Optional) - Clean up existing code structure before adding features
2. **Red** - Write failing test that defines new behavior
3. **Green** - Write minimal code to make test pass
4. **Refactor** - Improve code structure while maintaining passing tests
5. **Commit** - Separate commits for behavioral changes (`feat:`/`fix:`) and structural changes (`refactor:`/`tidy:`)

### Testing
- Tests run in jsdom environment with Vitest
- Follow TDD cycle: write failing test first, then implement minimal passing code
- All tests must pass before committing code changes

### Documentation
- Extensive documentation in `docs/` directory
- Feature specifications in `docs/features/`
- Architecture details in `docs/01_ARCHITECTURE.md`
- UI specifications in `docs/ui/`