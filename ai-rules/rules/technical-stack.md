# 🛠️ Technical Stack

Overview of technologies, frameworks, and tools used in this project.

## Core Framework Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Nuxt.js** | 4.x | SSR/SSG Vue framework (main framework) |
| **Vue.js** | 3.x | Progressive JavaScript framework |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Vite** | Latest | Fast module bundler |

## State Management

| Technology | Purpose |
|-----------|---------|
| **Pinia** | Vue state management (replaces Vuex) |
| **pinia-plugin-persist** | Automatic persistence to localStorage |

## UI & Styling

| Technology | Purpose |
|-----------|---------|
| **Vuetify 3** | Vue 3 Material Design component library |
| **Tailwind CSS** | Utility-first CSS framework |
| **SCSS/Sass** | Enhanced CSS with nesting, variables, mixins |
| **Material Icons** | Google Material Design icons |

## HTTP & API

| Technology | Purpose |
|-----------|---------|
| **Axios** | HTTP client for API requests |
| **Vue-Query** / **Tanstack Query** | Server state management & caching |

## Form Handling

| Technology | Purpose |
|-----------|---------|
| **Vee-Validate** | Vue form validation library |

## Testing

| Technology | Purpose |
|-----------|---------|
| **Vitest** | Unit testing (Vite-native) |
| **Playwright** | End-to-end testing |

## Build & Deployment

| Technology | Purpose |
|-----------|---------|
| **Nx** | Monorepo management tool |
| **GitHub Pages** | Static site hosting |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

## Development Tools

| Technology | Purpose |
|-----------|---------|
| **VS Code** | Code editor |
| **Cursor IDE** | AI-powered VS Code alternative |
| **Node.js** | JavaScript runtime |
| **Yarn** | Package manager |

## Key Versions

View current versions:
```bash
yarn list --depth=0
```

Check main dependencies in `package.json`:
```json
{
  "dependencies": {
    "vue": "^3.x",
    "nuxt": "^4.x",
    "pinia": "^2.x",
    "axios": "^1.x",
    "vuetify": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^latest",
    "eslint": "^latest",
    "prettier": "^latest",
    "vitest": "^latest",
    "@playwright/test": "^latest"
  }
}
```

## Architecture Support

### Feature-Sliced Design (FSD)

Libraries are organized using FSD principles:
- https://feature-sliced.design/
- Clear layer separation (features → entities → shared)
- Independent, reusable slices
- Easy refactoring and scaling

### Monorepo Structure (Nx)

Managed through Nx:
- https://nx.dev/
- Workspace dependencies tracking
- Task graph execution
- Code generation scaffolds

## Development Commands

### Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Development server with specific app
nx serve rpg-tools
```

### Building

```bash
# Build for production
yarn build

# Build all projects
yarn build:all

# Preview production build locally
yarn preview
```

### Code Quality

```bash
# Run ESLint
yarn lint

# Fix linting issues
yarn lint:fix

# Format code with Prettier
yarn format

# Check formatting
yarn format:check

# Type check
yarn tsc --noEmit
```

### Testing

```bash
# Run unit tests
yarn test

# Run E2E tests
yarn test:e2e

# Run tests in watch mode
yarn test:watch
```

### Workspace Management

```bash
# View project graph
yarn graph

# Run affected tests
yarn affected:test

# Build affected projects
yarn affected:build
```

## Browser Compatibility

- **Chrome/Edge** - Latest 2 versions
- **Firefox** - Latest 2 versions
- **Safari** - Latest 2 versions
- **Mobile** - iOS 12+, Android 8+

TypeScript compilation targets ES2022 for modern syntax support.

## Environment Variables

Create `.env` files for environment configuration:

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api
DEBUG=true

# .env.production
VITE_API_URL=https://api.example.com
DEBUG=false
```

## Performance Optimizations

Enabled features:
- **Code Splitting** - Via Vite dynamic imports
- **Tree Shaking** - Remove unused code
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - Via Vite
- **Gzip Compression** - Server-level

## Database (if applicable)

Not currently used. All data stored in:
- **localStorage** - Client-side persistence (via Pinia)
- **Google Sheets** - Data source (via GDDB library)

## Authentication (if applicable)

Currently not implemented. When needed:
- Plan: OAuth 2.0 or JWT tokens
- Libraries: `@nuxtjs/auth` or Keycloak (see commented sections)

## DevOps & CI/CD

Potential setup (not yet configured):
- **GitHub Actions** - CI/CD workflows
- **GitHub Pages** - Static deployment
- **Docker** - Containerization (optional)

## Learning Resources

- **Nuxt Docs**: https://nuxt.com/docs
- **Vue 3 Docs**: https://vuejs.org/
- **Pinia Docs**: https://pinia.vuejs.org/
- **TypeScript Docs**: https://www.typescriptlang.org/
- **FSD Guide**: https://feature-sliced.design/
- **Nx Documentation**: https://nx.dev/docs

## Adding New Dependencies

```bash
# Add to main workspace
yarn add package-name

# Add to specific library
nx add package-name --scope=@my-lib
```

Always commit `package.json` and `yarn.lock` after adding dependencies.

## Updating Dependencies

```bash
# Check outdated packages
yarn outdated

# Update all packages
yarn upgrade-interactive

# Update specific package
yarn upgrade package-name@latest
```

Test thoroughly after major version updates.
