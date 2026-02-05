# 🔄 Migration Guide - Framework-Organized AI Rules

## What Changed?

The AI rules have been reorganized for clarity by splitting monolithic files into **universal** and **framework-specific** versions.

### Old Structure
```
ai-rules/rules/
├── coding-standards.md      # Mixed Vue + universal content
├── architecture.md          # Mixed Vue + universal content
└── ...
```

### New Structure
```
ai-rules/rules/
├── coding-standards-general.md      # Universal standards
├── coding-standards-vue.md          # Vue 3 specific
├── coding-standards-react.md        # React specific (future)
├── architecture-general.md          # Universal FSD concepts
├── architecture-vue.md              # Vue 3 patterns
├── architecture-react.md            # React patterns (future)
└── INDEX.md                         # Navigation guide (NEW)
```

## What to Do Now?

### ✅ If you're working with Vue
1. Read [INDEX.md](INDEX.md) for navigation
2. Start with [general.md](general.md) for communication rules
3. Follow the **"For Vue Development"** section in [INDEX.md](INDEX.md)

### ✅ If you're starting a new project
1. Check [INDEX.md](INDEX.md) for quick navigation
2. The old `coding-standards.md` and `architecture.md` are still available as reference
3. Use the **NEW** framework-specific files for accuracy

### ✅ If you find yourself confused
1. Open [INDEX.md](INDEX.md) - it has navigation tables and quick-find references
2. Use "By Topic" table to find specific information
3. Use "When to Use Which File" table for your situation

## Why This Change?

✅ **Reduced cognitive load** - Vue developers don't read React docs  
✅ **Easier to maintain** - Change universal rules once, all frameworks benefit  
✅ **Future-proof** - New frameworks (React, Svelte) can be added without duplication  
✅ **Clearer navigation** - Know exactly which file to read for your framework  
✅ **Better organization** - Matches the monorepo's framework-tiered structure  

## Where Are The Old Files?

Old files are **still available** for reference:
- `coding-standards.md` - Contains both Vue and universal content
- `architecture.md` - Contains both Vue and universal content

**But they're now DEPRECATED in favor of the organized versions.**

## How to Contribute

If you find issues or want to improve rules:

1. Check if it's **universal** (TypeScript, naming, testing) → Update `*-general.md`
2. Check if it's **Vue specific** → Update `*-vue.md`
3. Check if it's **React specific** → Update `*-react.md`
4. Update appropriate file and commit with message: `docs: update AI rules - [topic]`

Example:
```bash
# If updating Vue composable patterns
git add ai-rules/rules/coding-standards-vue.md
git commit -m "docs: add useCallback memoization pattern to Vue standards"
```

## Questions?

Refer to [INDEX.md](INDEX.md) for:
- 📋 **Quick Navigation** - Find any rule quickly
- 🎯 **By Topic** - Organized alphabetically
- 🎨 **By Framework** - Clear Vue vs React workflow
- 📚 **Reading Order** - Suggested study paths
- 💡 **Pro Tips** - How to use these files effectively

---

**Last Updated:** February 5, 2026  
**Status:** Framework-specific organization complete
