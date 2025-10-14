# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Development**: `npm run dev` (uses Turbopack for fast builds)
- **Build**: `npm run build` (production build with Turbopack)
- **Start**: `npm run start` (production server)
- **Lint**: `npm run lint` (ESLint)

## Architecture Overview

This is a Next.js 15 application using the App Router with a dashboard-based layout system:

### Project Structure
- **Route Groups**: Uses `(dashboard)` and `(field)` route groups for different layout contexts
- **UI Components**: Built with shadcn/ui components (New York style) and Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React icon library

### Key Architectural Patterns
- **Layout Composition**: Dashboard layout includes AppSidebar with collapsible navigation, breadcrumbs, and main content area
- **Component Organization**: 
  - `/components/ui/` - Reusable UI primitives (buttons, cards, etc.)
  - `/components/` - Application-specific components (sidebar, navigation)
  - `/hooks/` - Custom React hooks
  - `/lib/` - Utility functions

### Technology Stack
- Next.js 15 with React 19
- TypeScript with strict mode
- shadcn/ui component system
- Tailwind CSS v4
- React Hook Form + Zod for form validation
- Path aliases configured (`@/*` -> `./src/*`)

### Component System
The application uses shadcn/ui with:
- Base color: neutral
- CSS variables for theming
- Lucide icons
- New York component style
- RSC (React Server Components) enabled

## Development Notes
- Uses Turbopack for both dev and build for faster performance
- Strict TypeScript configuration with ES2017 target
- Font optimization with Geist Sans and Geist Mono