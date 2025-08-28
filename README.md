# Overview

A mobile-first Arabic phone directory application (كاشف الأرقام) built with React frontend and Express backend. The application allows users to search for phone numbers and names, manage contacts, view search history, and create user profiles. It features a Progressive Web App (PWA) architecture with offline capabilities and Arabic language support with RTL layout.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Arabic font support (Noto Sans Arabic)
- **State Management**: TanStack Query for server state and caching
- **Build Tool**: Vite with custom configuration for development and production
- **PWA Features**: Service worker for offline caching, web app manifest for mobile installation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints with JSON responses
- **Data Layer**: In-memory storage with interface abstraction for future database migration
- **Development Setup**: Vite middleware integration for hot reloading
- **Error Handling**: Centralized error middleware with structured responses

## Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Two main tables - users and search_history
- **Validation**: Zod schemas for type-safe data validation
- **Migration**: Drizzle Kit for database schema management

## Mobile-First Design
- **Responsive Layout**: Tailwind breakpoints optimized for mobile devices
- **Touch Interactions**: Custom touch-target classes for accessibility
- **Bottom Navigation**: Native mobile app-style navigation
- **Arabic RTL Support**: Complete right-to-left layout with proper font loading

## Authentication & Data Flow
- **No Authentication**: Currently uses in-memory storage with sample data
- **Search Functionality**: Dual search modes (phone number and name) with history tracking
- **Real-time Updates**: TanStack Query provides optimistic updates and cache management

# External Dependencies

## Core Technologies
- **Database**: Neon PostgreSQL (configured but using in-memory storage currently)
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **UI Framework**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Noto Sans Arabic, Inter) for multilingual support

## Development Tools
- **Runtime Error Handling**: Replit-specific error modal for development
- **Code Analysis**: Replit Cartographer for development insights
- **Build Pipeline**: ESBuild for production bundling
- **PWA Tools**: Custom service worker implementation

## Deployment Considerations
- **Static Assets**: Vite handles asset optimization and bundling
- **Environment Variables**: DATABASE_URL for production database connection
- **Production Build**: Separates client and server builds for optimal deployment
