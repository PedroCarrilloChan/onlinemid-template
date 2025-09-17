# OnlineMid Portal

## Overview

OnlineMid Portal is a full-stack web application built with React and Express. The project follows a monorepo structure with separate client and server directories, utilizing modern TypeScript throughout. The application features a complete development setup with Vite for frontend bundling, Drizzle ORM for database management, and shadcn/ui for a comprehensive component library.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Hookform Resolvers for validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **API Design**: RESTful API structure with `/api` prefix routing
- **Development Tools**: tsx for TypeScript execution in development

### Database Architecture
- **Database**: PostgreSQL (configured via Neon serverless driver)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Type Safety**: Full TypeScript integration with inferred types

### Storage Layer
- **Abstraction**: Storage interface pattern for database operations
- **Implementation**: Memory storage for development, easily swappable for production
- **CRUD Operations**: Structured interface for user management operations

### Authentication & Authorization
- **Session-based**: Express sessions with PostgreSQL backing
- **User Schema**: Username/password authentication with UUID primary keys
- **Validation**: Zod schemas integrated with Drizzle for runtime validation

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Modern TypeSQL ORM with type safety
- **drizzle-kit**: Database migration and introspection tool

### UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible, unstyled UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **clsx & tailwind-merge**: Conditional class name utilities

### Development and Build Tools
- **vite**: Fast frontend build tool with HMR
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development plugins

### State Management and Data Fetching
- **@tanstack/react-query**: Powerful data synchronization for React
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Validation library resolvers for react-hook-form

### Additional Utilities
- **wouter**: Minimalist routing for React
- **date-fns**: Modern date utility library
- **nanoid**: URL-safe unique string ID generator
- **cmdk**: Command palette component