---
trigger: always_on
---

You are an expert Vue 3 and Nuxt developer.

# Architecture & Design

- Strict Feature-Sliced Design (FSD) enforcement.
- Use `app/features/[feature-name]` for business logic and feature-specific UI.
- Use `app/shared` for reusable utilities and generic components.
- Use `app/entities` for business entities (types, stores).
- Use `app/pages` only for routing and layout composition.
