---
name: Global components Rule
description: Standardy dla komponentów React
applyTo: "**/*"
---
# 🎯 General Rules & Communication

All developers and AI assistants should follow these fundamental rules.

## Communication Language

- **Always communicate in Polish.** This is the primary language for all documentation, comments, and discussions.
- **AI Assistants (Copilot, Cursor, etc.) must ALWAYS respond in Polish** - no exceptions, regardless of the user's input language.
- Keep messages concise and action-oriented.
- When explaining technical concepts, use Polish terms where established (e.g., "feature", "store", "komponent").

## Verification Requirements

- **Always verify your changes** before considering work complete.
- Run linting and type checking: `yarn lint` and `yarn tsc --noEmit`
- Test the functionality in development environment: `yarn dev`
- Review error messages in VS Code Problems panel
- Check for TypeScript compilation errors

## Task Planning & Approval

- When starting a task, present a clear task list for user review
- Ask for confirmation or adjustments before implementing
- Do not begin coding until user approval is given
- Read all relevant documentation files before starting
- Break complex tasks into smaller, manageable steps

## Code Quality Standards

- Use `<script setup lang="ts">` for Vue components (not class-based or Options API)
- Always use TypeScript - `.ts` or `.vue` files required
- Follow ESLint and Prettier configurations automatically
- Write meaningful variable and function names (no `a`, `x`, `temp`)
- Add JSDoc comments for complex functions

## Import Conventions

- Use `@shared/*` path aliases instead of relative paths
- Never use direct file system paths like `libs/features/vue/...`
- Group imports: Vue/Nuxt → third-party → project imports
- Always use named exports where possible (not default exports)

## File Organization

- Create `index.ts` files for barrel exports (public API)
- Organize files into logical folders: `ui/`, `hooks/`, `model/`, `types/`, `lib/`
- Each library must have `project.json` for Nx
- Keep related files together in the same feature/entity/widget

## Dependency Management

- Do not create cyclic dependencies between libraries
- Features should not depend on other features directly
- Use entities and stores for shared state
- Keep utilities in `libs/shared/` for framework-agnostic code

## Testing Requirements

- E2E tests in Playwright for critical user journeys
- Unit tests using Vitest for business logic
- Test files should be in the same library as code being tested
- Run tests before committing: `yarn test`

## Documentation

- Prepare API documentation in `root/api-docs/` folder
- Add comments for non-obvious logic
- Update README files when adding major features
- Document any custom configurations or workarounds

## Before Submitting Work

- [ ] Code compiles without errors
- [ ] No linting errors: `yarn lint`
- [ ] No TypeScript errors: `yarn tsc --noEmit`
- [ ] Development server runs: `yarn dev`
- [ ] Changes follow the established style guide
- [ ] All related tests pass
- [ ] Commit messages are clear and descriptive

## Breaking the Rules

If you identify a rule that:
- Conflicts with modern best practices
- Creates technical debt
- Prevents needed functionality

**Always discuss with the user first.** Ask for clarification or suggest improvements rather than breaking established conventions.
