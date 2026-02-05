# 🤖 Consolidated AI Rules & Guidelines

This directory contains consolidated AI rules and guidelines organized by topic and framework.

**Source consolidation from:**
- `.cursorrules` - General Cursor IDE rules
- `.cursor/rules/` - Cursor-specific technical rules
- `.agent/rules/` - Agent-specific rules for automated operations

## 📚 Files Overview

### Core Rules (Applicable to All Frameworks)

- **general.md** - General communication and verification rules
- **rules/general-rules/architecture-general.md** - FSD architecture and universal project structure
- **rules/general-rules/coding-standards-general.md** - Universal code quality and style standards
- **rules/general-rules/library-creation.md** - Step-by-step guide for creating new libraries
- **rules/general-rules/technical-stack.md** - Technology stack and build tools
- **rules/general-rules/validation-checklist.md** - Checklist before committing changes

### Framework-Specific Rules

| Topic | Vue 3 | React |
|-------|-------|-------|
| **Architecture** | [rules/vue/architecture-vue.md](rules/vue/architecture-vue.md) | [rules/react/architecture-react.md](rules/react/architecture-react.md) |
| **Coding Standards** | [rules/vue/coding-standards-vue.md](rules/vue/coding-standards-vue.md) | [rules/react/coding-standards-react.md](rules/react/coding-standards-react.md) |

## 🎯 How to Use These Rules

### For Vue Development

1. **Starting a new task** → Read [general.md](rules/general.md) for communication rules
2. **Understanding project structure** → Read [rules/general-rules/architecture-general.md](rules/general-rules/architecture-general.md), then [rules/vue/architecture-vue.md](rules/vue/architecture-vue.md)
3. **Code standards** → Read [rules/general-rules/coding-standards-general.md](rules/general-rules/coding-standards-general.md), then [rules/vue/coding-standards-vue.md](rules/vue/coding-standards-vue.md)
4. **Creating new libraries** → Follow [rules/general-rules/library-creation.md](rules/general-rules/library-creation.md)
5. **Before committing** → Use [rules/general-rules/validation-checklist.md](rules/general-rules/validation-checklist.md)
6. **Understanding tech stack** → See [rules/general-rules/technical-stack.md](rules/general-rules/technical-stack.md)

### For React Development (Future)

1. **Starting a new task** → Read [general.md](rules/general.md) for communication rules
2. **Understanding project structure** → Read [rules/general-rules/architecture-general.md](rules/general-rules/architecture-general.md), then [rules/react/architecture-react.md](rules/react/architecture-react.md)
3. **Code standards** → Read [rules/general-rules/coding-standards-general.md](rules/general-rules/coding-standards-general.md), then [rules/react/coding-standards-react.md](rules/react/coding-standards-react.md)
4. **Creating new libraries** → Follow [rules/general-rules/library-creation.md](rules/general-rules/library-creation.md)
5. **Before committing** → Use [rules/general-rules/validation-checklist.md](rules/general-rules/validation-checklist.md)
6. **Understanding tech stack** → See [rules/general-rules/technical-stack.md](rules/general-rules/technical-stack.md)

## 📂 Directory Structure

```
ai-rules/
├── README.md                              # Overview (will be replaced)
├── README-NEW.md                          # New framework-organized structure
└── rules/
    ├── general.md                         # Communication & verification
    ├── technical-stack.md                 # Technology overview
    ├── library-creation.md                # Library creation guide
    ├── validation-checklist.md            # Pre-commit checklist
    │
    ├── architecture-general.md            # Universal FSD architecture
    ├── architecture-vue.md                # Vue 3 & Nuxt architecture
    ├── architecture-react.md              # React architecture (future)
    │
    ├── coding-standards-general.md        # Universal TypeScript/naming/testing
    ├── coding-standards-vue.md            # Vue 3 specific standards
    └── coding-standards-react.md          # React specific standards (future)
```

## 🔄 Sources & Consolidation

All rules have been consolidated and reorganized from:

- **`.cursorrules`** - Root-level Cursor rules
- **`.cursor/rules/basic.mdc`** - Cursor workflow rules
- **`.cursor/rules/technical.mdc`** - Cursor technical instructions
- **`.agent/rules/basic.md`** - Agent general rules
- **`.agent/rules/code-style-guide.md`** - Agent architecture rules
- **`.agent/rules/library-creation-guide.md`** - Agent library creation guide

## 🎨 Framework-Specific Organization

This AI rules directory is now organized to match the monorepo's framework-tiered architecture:

- **`libs/features/vue/`** → Follow rules in `coding-standards-vue.md` + `architecture-vue.md`
- **`libs/features/react/`** → Follow rules in `coding-standards-react.md` + `architecture-react.md`
- **`libs/shared/`** → Follow rules in `coding-standards-general.md` + `architecture-general.md`

This ensures developers have clear, focused guidance for their chosen framework, reducing cognitive load and maintaining consistency across the codebase.

## 📝 Last Updated

- **Framework split completed:** February 5, 2026
- **Files reorganized:** architecture-{general,vue,react}, coding-standards-{general,vue,react}
- **Cross-references added:** All framework-specific files link back to general standards
- **Navigation guide added:** Clear instructions for Vue vs React development workflow
