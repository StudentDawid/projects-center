# 📖 AI Rules - Detailed Guide

This folder contains detailed AI rules and guidelines, organized by topic and framework.

## 🎯 Quick Navigation

### By Topic

| Topic | Description |
|-------|-------------|
| [general.md](general.md) | Communication rules, verification requirements, task planning |
| [architecture-general.md](architecture-general.md) | FSD architecture concepts, library types, universal patterns |
| [architecture-vue.md](architecture-vue.md) | Vue 3 & Nuxt specific architecture, library examples |
| [architecture-react.md](architecture-react.md) | React specific architecture, hook patterns, store setup |
| [coding-standards-general.md](coding-standards-general.md) | TypeScript standards, naming, testing, universal code review |
| [coding-standards-vue.md](coding-standards-vue.md) | Vue 3 components, composables, lifecycle, scoped styles |
| [coding-standards-react.md](coding-standards-react.md) | React hooks, functional components, JSX, CSS approaches |
| [library-creation.md](library-creation.md) | Step-by-step guide for creating features, entities, widgets, stores |
| [technical-stack.md](technical-stack.md) | Tech versions, build tools, development commands |
| [validation-checklist.md](validation-checklist.md) | Pre-commit checks, testing, performance, accessibility |

### By Framework

#### 🟢 Vue 3 Development

Start here for Vue projects:

1. [general.md](general.md) - Communication rules
2. [architecture-general.md](architecture-general.md) - Understand FSD
3. [architecture-vue.md](architecture-vue.md) - Vue library structure
4. [coding-standards-general.md](coding-standards-general.md) - Universal standards
5. [coding-standards-vue.md](coding-standards-vue.md) - Vue patterns
6. [library-creation.md](library-creation.md) - Create new features
7. [validation-checklist.md](validation-checklist.md) - Before commit

#### ⚛️ React Development (Future)

Prepare for React projects:

1. [general.md](general.md) - Communication rules
2. [architecture-general.md](architecture-general.md) - Understand FSD
3. [architecture-react.md](architecture-react.md) - React library structure
4. [coding-standards-general.md](coding-standards-general.md) - Universal standards
5. [coding-standards-react.md](coding-standards-react.md) - React patterns
6. [library-creation.md](library-creation.md) - Create new features
7. [validation-checklist.md](validation-checklist.md) - Before commit

## 📋 When to Use Which File

| Situation | File |
|-----------|------|
| Starting a new task | [general.md](general.md) |
| Creating a feature library | [library-creation.md](library-creation.md) |
| Need component examples | [architecture-vue.md](architecture-vue.md) or [architecture-react.md](architecture-react.md) |
| Writing Vue code | [coding-standards-vue.md](coding-standards-vue.md) |
| Writing React code | [coding-standards-react.md](coding-standards-react.md) |
| Understanding architecture | [architecture-general.md](architecture-general.md) |
| Before committing code | [validation-checklist.md](validation-checklist.md) |
| Learning the tech stack | [technical-stack.md](technical-stack.md) |

## 🔗 Cross-References

Each file contains links to related rules:

- **General files** link to framework-specific implementations
- **Framework files** link back to general standards for universal context
- **Library creation** references architecture and coding standards
- **Validation checklist** references all applicable standards

## 📚 Reading Order

### For First-Time Setup (30 min read)

1. **[general.md](general.md)** (5 min) - Understand communication style
2. **[architecture-general.md](architecture-general.md)** (10 min) - Learn FSD principles
3. **[architecture-vue.md](architecture-vue.md)** (10 min) - Understand Vue structure
4. **[library-creation.md](library-creation.md)** (5 min) - See library structure

### For Creating Your First Feature (15 min read)

1. **[library-creation.md](library-creation.md)** (5 min) - Step-by-step creation
2. **[architecture-vue.md](architecture-vue.md)** (5 min) - Feature structure example
3. **[coding-standards-vue.md](coding-standards-vue.md)** (5 min) - Vue code patterns

### Before Committing Code (10 min read)

1. **[validation-checklist.md](validation-checklist.md)** (5 min) - Full checklist
2. **[coding-standards-general.md](coding-standards-general.md)** (3 min) - Quick review
3. **[coding-standards-vue.md](coding-standards-vue.md)** (2 min) - Vue-specific check

## 🎨 File Organization Philosophy

Rules are organized across **three tiers**:

### Tier 1: Universal Rules
- Applied to all frameworks
- TypeScript patterns, naming conventions, testing strategies
- Files: `*-general.md`

### Tier 2: Framework-Specific Rules
- Vue 3, React, etc.
- Framework library structure, component patterns, styling approaches
- Files: `*-vue.md`, `*-react.md`, etc.

### Tier 3: Implementation Guides
- Step-by-step instructions
- Applicable across frameworks
- Files: `library-creation.md`, `validation-checklist.md`

This three-tier structure ensures:
✅ Developers don't repeat reading universal rules for each framework  
✅ Framework-specific nuances are clearly highlighted  
✅ New frameworks can be added (Vue → React → Svelte) without duplicating content  
✅ Easy updates: change universal rules in one place, all frameworks benefit  

## 💡 Pro Tips

- **Bookmark the framework navigation table** above for quick reference
- **Use Ctrl+F (Cmd+F)** to search within files
- **Check section headings** to find what you need quickly
- **Follow cross-references** to understand full context
- **Come back to validation-checklist.md** before every commit

## 📝 Version History

- **v2.0** (Feb 5, 2026) - Framework-specific organization (general, vue, react)
- **v1.0** (Earlier) - Consolidated from 3 source files (.cursorrules, .cursor, .agent)
