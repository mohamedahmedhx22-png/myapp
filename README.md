# Overview

A mobile-first Arabic phone directory application (كاشف الأرقام) built with React frontend and Express backend. The application allows users to search for phone numbers and names, manage contacts, view search history, and create user profiles. It features a Progressive Web App (PWA) architecture with offline capabilities and Arabic language support with RTL layout.

## 🆕 New Features (Latest Update)

### Enhanced Phone Discovery System
- **Advanced Search**: Search by phone number or name with detailed results
- **Name Tracking**: See who added each name and when
- **Verification System**: Verify phone number names with multiple methods
- **Community Contributions**: Users can add new names for phone numbers

### Digital Marketplace
- **Services & Products**: Browse business services and products
- **Category Filtering**: Filter by business categories
- **Advanced Search**: Search within services and products
- **Business Profiles**: Direct access to business profiles

### Business Categories
- **10 Pre-defined Categories**: Restaurants, retail, healthcare, education, automotive, beauty, technology, real estate, financial, entertainment
- **Arabic Support**: Full Arabic language support with icons
- **Organized Structure**: Better organization of business types

## User Preferences

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
- **Schema**: Enhanced schema with new tables for phone discovery and business categories
- **Validation**: Zod schemas for type-safe data validation
- **Migration**: Drizzle Kit for database schema management

## Mobile-First Design
- **Responsive Layout**: Tailwind breakpoints optimized for mobile devices
- **Touch Interactions**: Custom touch-target classes for accessibility
- **Bottom Navigation**: Native mobile app-style navigation with 6 main sections
- **Arabic RTL Support**: Complete right-to-left layout with proper font loading

## Authentication & Data Flow
- **Phone Authentication**: Uses phone number-based authentication
- **Search Functionality**: Dual search modes (phone number and name) with history tracking
- **Real-time Updates**: TanStack Query provides optimistic updates and cache management
- **Enhanced Discovery**: New phone number discovery system with community contributions

# New API Endpoints

## Phone Discovery System
- `POST /api/phone-numbers/:phoneNumber/names` - Add new name
- `GET /api/phone-numbers/:phoneNumber/names` - Get names for phone number
- `GET /api/phone-numbers/search` - Search phone numbers by name
- `POST /api/phone-numbers/names/:id/verify` - Verify phone name
- `POST /api/phone-numbers/verify` - Request verification
- `POST /api/phone-numbers/verify-code` - Verify with code

## Business Categories & Marketplace
- `GET /api/business-categories` - Get all business categories
- `GET /api/search/services` - Search services with category filtering
- `GET /api/search/products` - Search products with category filtering
- `GET /api/businesses/:businessId/services-products` - Get business services and products

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

# Getting Started

## Development
```bash
npm install
npm run dev
```

## Database Setup
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/database"

# Run migrations
npm run db:push
```

## Production Build
```bash
npm run build
npm start
```

# Features Roadmap

## Completed ✅
- Basic phone directory functionality
- User authentication system
- Contact management
- Search history
- Enhanced phone discovery system
- Digital marketplace
- Business categories
- PWA capabilities

## Planned 🚧
- SMS verification integration
- Advanced analytics
- Mobile app (iOS/Android)
- Real-time notifications
- Advanced search algorithms
- Business verification system

For detailed feature information, see [FEATURES.md](./FEATURES.md)
