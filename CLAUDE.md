# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AuthFill is a browser extension for one-click email verification. It connects to email providers via IMAP to fetch verification codes/links automatically.

## Common Commands

```bash
# Development (starts all apps via Turbo)
pnpm run dev

# Build all packages
pnpm run build

# Lint all packages
pnpm run lint

# Format code
pnpm run format

# Build extension for specific browser
pnpm --filter extension build:chrome
pnpm --filter extension build:firefox
pnpm --filter extension build:edge
pnpm --filter extension build:opera

# Deploy proxy to Cloudflare Workers
pnpm --filter proxy deploy
```

## Architecture

This is a pnpm monorepo managed with Turbo. Structure:

```
apps/
  extension/    # Browser extension (React popup + background service worker)
  proxy/        # Cloudflare Worker - IMAP proxy via WebSocket
  web/          # Landing page (TanStack Start)
packages/
  ui/           # Shared Radix UI components
  hooks/        # Shared React hooks
  eslint/       # Shared ESLint config
  typescript/   # Shared TypeScript config
```

### Extension Architecture

- **Popup UI**: React app with TanStack Router (hash-based routing for extension compatibility)
- **Background script**: Service worker handling IMAP connections, account management, and message passing
- **Key directories**:
  - `src/background/accounts/` - CRUD for email accounts
  - `src/background/listeners/` - Browser event handlers
  - `src/routes/` - File-based TanStack Router pages
- Uses `webextension-polyfill` for cross-browser compatibility
- Manifest v3 configuration in `manifest.config.ts`

### Proxy Architecture

- Hono-based Cloudflare Worker
- Handles WebSocket connections for IMAP proxy (`/imap/ws`)
- Test endpoint for connection verification (`/imap/test`)
- Uses `cf-imap` library for IMAP within Workers environment

### Inter-app Communication

The extension popup communicates with the background script via message passing. The background script connects to the proxy via WebSocket to establish IMAP connections (required due to browser extension limitations).

## Tech Stack

- **Framework**: React 19, TanStack Router, TanStack Query
- **Styling**: Tailwind CSS 4, Radix UI
- **Build**: Vite, Turbo
- **Runtime**: Node 22.14.0, pnpm 8.15.6
- **Validation**: Zod
- **State**: Jotai (extension)

## Development Setup

1. `cp .env.example .env`
2. `pnpm install`
3. `pnpm run dev`
4. Load unpacked extension from `apps/extension/dist`

For Firefox: add `BROWSER=firefox` to `.env` before running dev.

## Local Ports

- Extension dev: 3001
- Proxy dev: 4000
- Web dev: 3000
