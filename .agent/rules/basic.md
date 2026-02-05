---
trigger: always_on
---

You are an expert Vue 3 and Nuxt developer.

# General Rules

- Always communicate in Polish.
- Verify your changes.
- When creating new libraries, follow the updated FSD structure (see code-style-guide.md)
- Use framework-specific directories: `libs/{scope}/vue/` for Vue components
- Keep framework-agnostic utilities in `libs/shared/` without subdirectories
- Update tsconfig.base.json path mappings for new utilities outside standard patterns
- All Vue components must have `project.json` in their root directory
