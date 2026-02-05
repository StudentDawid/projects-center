# ✅ Validation Checklist

Comprehensive checklist to verify code before committing.

## Pre-Development

- [ ] Read relevant documentation from `ai-rules/rules/`
- [ ] Discussed with team or user (if major change)
- [ ] Created task list and got approval
- [ ] Identified library type (feature/entity/widget/store/utility)

## Code Quality

### TypeScript & Compilation

- [ ] No TypeScript errors: `yarn tsc --noEmit`
- [ ] No `any` types used
- [ ] All props/emits are typed
- [ ] Return types specified for functions
- [ ] Strict mode compatible

### Linting & Formatting

- [ ] No ESLint errors: `yarn lint`
- [ ] Code formatted: `yarn format`
- [ ] ESLint warnings reviewed and justified
- [ ] Prettier formatting applied

### Vue 3 Components

- [ ] Uses `<script setup lang="ts">` (not Options API)
- [ ] Proper prop definition with types
- [ ] Emits properly typed
- [ ] Lifecycle hooks in correct order
- [ ] Single root element in template
- [ ] Scoped styles (`<style scoped lang="scss">`)

## Architecture Compliance

### File Structure

- [ ] Correct folder location (features/entities/widgets/stores/shared)
- [ ] Has `project.json` file
- [ ] Has main `index.ts` with barrel exports
- [ ] Organized into ui/, hooks/, model/, lib/ folders
- [ ] Related files grouped together

### Imports & Dependencies

- [ ] Uses `@shared/*` paths (not relative `../../../`)
- [ ] No direct file imports (use barrel exports)
- [ ] No cyclic dependencies
- [ ] Third-party imports before project imports
- [ ] All public API exported from `index.ts`

### FSD Principles

- [ ] Features don't import features
- [ ] Entity state in store (not feature)
- [ ] Utilities framework-agnostic
- [ ] Components in appropriate scope
- [ ] No mixing of concerns

## Documentation

### Code Comments

- [ ] Comments explain WHY not WHAT
- [ ] JSDoc on public functions
- [ ] Complex logic explained
- [ ] No obvious/redundant comments

### Type Definitions

- [ ] Interfaces documented
- [ ] Types grouped logically
- [ ] Public types exported
- [ ] Internal types prefixed with underscore

### README Updates

- [ ] Main README updated (if significant feature)
- [ ] New library documented
- [ ] Usage examples provided
- [ ] Breaking changes noted

## Testing

### Unit Tests

- [ ] Business logic has tests
- [ ] Edge cases covered
- [ ] Tests pass: `yarn test`
- [ ] Test coverage acceptable (aim for >70%)

### Component Tests

- [ ] Props validation tested
- [ ] Emits triggered correctly
- [ ] User interactions work
- [ ] Error states handled

### E2E Tests

- [ ] Critical user flows tested
- [ ] Tests pass: `yarn test:e2e`
- [ ] Test data properly cleaned up

## Performance

### Bundle Size

- [ ] No unused imports
- [ ] No accidental duplication
- [ ] Lazy loading used for heavy components
- [ ] Bundle size reasonable

### Runtime Performance

- [ ] Computed properties used (not methods in template)
- [ ] Watchers debounced if needed
- [ ] No N+1 queries
- [ ] Proper memoization used

### Accessibility (a11y)

- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient
- [ ] Form labels associated

## Security

### Input Validation

- [ ] User input validated
- [ ] SQL injection prevention (if applicable)
- [ ] XSS protection (Vue handles by default)
- [ ] CSRF tokens used (if needed)

### Dependencies

- [ ] No known vulnerabilities: `yarn audit`
- [ ] Dependencies are necessary
- [ ] Version pinning appropriate

## Environment Setup

### Development Server

- [ ] `yarn dev` runs without errors
- [ ] Hot reload works
- [ ] Console has no errors/warnings
- [ ] Responsive design tested

### Production Build

- [ ] `yarn build` completes successfully
- [ ] Build size reasonable
- [ ] `yarn preview` works
- [ ] No build warnings

### Cross-Browser Testing

- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile responsive

## Git & Commits

### Before Committing

- [ ] All files staged: `git status`
- [ ] No uncommitted changes to important files
- [ ] Commit message is clear and descriptive
- [ ] Related tests committed with code

### Commit Message

- [ ] Follows conventional commits format
- [ ] First line ≤ 50 characters
- [ ] Explains WHAT and WHY (not HOW)
- [ ] References issues/tickets if applicable

Example format:
```
feat: add new card manager feature

- Implement card CRUD operations
- Add filtering and sorting UI
- Create card entity store with persistence

Closes #123
```

### Git History

- [ ] Commits are logical and atomic
- [ ] No accidental debug code
- [ ] No secrets or API keys committed
- [ ] `.gitignore` properly configured

## Library-Specific Checks

### Feature Libraries

- [ ] Has UI components in `/ui`
- [ ] Has composables in `/hooks`
- [ ] Has types in `/model`
- [ ] Business logic in hooks (not components)

### Entity Libraries

- [ ] Has store in `/lib`
- [ ] Has display component in `/ui`
- [ ] Has types in `/model`
- [ ] Persistence configured (if needed)

### Widget Libraries

- [ ] No business logic (pure UI)
- [ ] Props well-documented
- [ ] Reusable across features
- [ ] Component in `/ui`
- [ ] Props/slots typed in `/model`

### Store Libraries

- [ ] Pinia store properly configured
- [ ] State immutable by default
- [ ] Actions for state mutations
- [ ] Persist plugin configured (if needed)

### Utility Libraries

- [ ] No Vue dependencies
- [ ] Pure functions (no side effects)
- [ ] Well-tested
- [ ] Properly typed
- [ ] Documented with examples

## Final Review Checklist

- [ ] Runs without errors: `yarn dev`
- [ ] Compiles: `yarn tsc --noEmit`
- [ ] Lints: `yarn lint`
- [ ] Tests pass: `yarn test`
- [ ] Follows style guide
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] Commit message clear
- [ ] Ready for code review
- [ ] Team notified (if needed)

## Edge Cases to Test

- [ ] Empty states
- [ ] Error states
- [ ] Loading states
- [ ] Very long content
- [ ] Multiple selections
- [ ] Rapid clicking
- [ ] Network failures (if applicable)
- [ ] Permission issues (if applicable)

## Common Issues to Avoid

| Issue | How to Avoid |
|-------|------------|
| Circular imports | Use barrel exports, entity for sharing |
| Performance issues | Use computed, lazy load, debounce |
| Type errors | Run `yarn tsc --noEmit` frequently |
| CSS conflicts | Use scoped styles, unique class names |
| State mutations | Use Pinia actions, ref() for reactivity |
| Missing exports | Check index.ts barrel exports |
| Wrong imports | Use `@shared/*` instead of relative paths |
| Accessibility issues | Use semantic HTML, ARIA labels |

## After Commit

- [ ] Push to branch: `git push`
- [ ] Create/update pull request
- [ ] Request code review
- [ ] Monitor CI/CD pipeline
- [ ] Address review feedback promptly
- [ ] Merge when approved
- [ ] Verify deployment

## Performance Budget

Targets for this project:
- Bundle size < 500KB (gzipped)
- Initial load < 3s
- Time to Interactive (TTI) < 5s
- Lighthouse score > 80

Run audits:
```bash
yarn build
yarn preview
# Open DevTools → Lighthouse
```

## Related Documentation

- See `general.md` for communication rules
- See `architecture.md` for structure rules
- See `coding-standards.md` for code quality rules
- See `technical-stack.md` for tool usage
