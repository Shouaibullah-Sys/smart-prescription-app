# Smart Prescription Project Structure

## Overview

This is a comprehensive Next.js TypeScript project for a smart prescription management system with AI-powered features, built using modern web technologies.

## Root Level Files

```
/home/shouaibullah/Desktop/smart-prescription/
├── .gitignore                    # Git ignore rules
├── components.json               # Shadcn/ui components configuration
├── DATABASE_CONNECTION_FIX.md    # Database connection documentation
├── drizzle.config.ts             # Drizzle ORM configuration
├── eslint.config.mjs            # ESLint configuration
├── middleware.ts                 # Next.js middleware
├── next.config.ts               # Next.js configuration
├── package.json                 # Project dependencies
├── pnpm-lock.yaml              # PNPM lock file
├── postcss.config.mjs          # PostCSS configuration
├── README.md                    # Project documentation
├── tsconfig.json               # TypeScript configuration
├── vazirmatn-normal.js         # Persian font configuration
└── vercel.json                 # Vercel deployment configuration
```

## Directory Structure

### 1. app/ - Next.js App Router Directory

```
app/
├── globals.css                 # Global styles
├── layout.tsx                  # Root layout component
├── page.tsx                    # Home page
├── sign-in/                    # Authentication pages
│   └── [[...sign-in]]/
│       └── page.tsx
└── sign-up/                    # User registration
    └── [[...sign-up]]/
        └── page.tsx
```

### 2. app/api/ - API Routes

```
app/api/
├── analyze-symptoms/           # AI symptom analysis endpoint
│   └── route.ts
├── autocomplete/               # Medication autocomplete
│   └── route.ts
├── debug/                      # Debug endpoints
│   └── route.ts
├── generate-prescription/      # AI prescription generation
│   └── route.ts
├── medical-analysis/           # Medical analysis features
│   └── route.ts
├── prescriptions/              # Prescription CRUD operations
│   ├── [id]/
│   │   └── route.ts           # Individual prescription operations
│   └── route.ts               # Prescription list operations
├── presets/                    # Prescription presets
│   ├── [id]/
│   │   └── route.ts           # Individual preset operations
│   └── route.ts               # Preset list operations
└── suggest/                    # Medication suggestions
    └── route.ts
```

### 3. components/ - React Components

```
components/
├── AutocompleteInput.tsx      # Search input with autocomplete
├── clerk-provider.tsx         # Clerk authentication provider
├── clerk-theme-provider.tsx   # Clerk theming
├── create-preset-form.tsx     # Preset creation form
├── dashboard-client.tsx       # Dashboard client component
├── editable-prescription-table.tsx # Editable prescription table
├── enhanced-prescription-form.tsx # Enhanced prescription form
├── ErrorAlert.tsx             # Error display component
├── LoadingSpinner.tsx         # Loading indicator
├── prescription-amount.tsx    # Prescription amount calculator
├── prescription-details.tsx   # Prescription details display
├── PrescriptionResult.tsx     # Prescription results display
├── presets-tab.tsx            # Presets management tab
├── providers.tsx              # Context providers
├── QuickButtons.tsx           # Quick action buttons
├── SmartTextForm.tsx          # Smart text input form
├── theme-hook.tsx             # Theme management hook
├── theme-initializer.tsx      # Theme initialization
├── theme-provider.tsx         # Theme context provider
├── theme-toggle.tsx           # Theme switcher
├── prescriptions/             # Prescription-specific components
│   ├── columns.tsx            # Data table columns
│   └── data-table.tsx         # Data table component
└── ui/                        # Reusable UI components
    ├── alert-dialog.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── calendar.tsx
    ├── card.tsx
    ├── date-picker.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── label.tsx
    ├── progress.tsx
    ├── scroll-area.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── sheet.tsx
    ├── spinner.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    └── tooltip.tsx
```

### 4. db/ - Database Configuration

```
db/
├── index.ts                    # Database connection and configuration
└── schema.ts                   # Database schema definitions
```

### 5. drizzle/ - Database Migrations

```
drizzle/
├── 0000_flowery_nehzno.sql    # Migration file
├── 0001_remove_unused_clinical_fields.sql # Migration file
└── meta/                       # Migration metadata
    ├── _journal.json
    └── 0000_snapshot.json
```

### 6. lib/ - Utility Libraries

```
lib/
└── utils.ts                    # Utility functions
```

### 7. public/ - Static Assets

```
public/
├── file.svg                    # SVG icons
├── globe.svg
├── logo.png                    # Project logo
├── next.svg
├── vercel.svg
├── window.svg
└── fonts/                      # Custom fonts
    └── vazirmatn-Regular.ttf   # Persian font
```

### 8. scripts/ - Build and Utility Scripts

```
scripts/
└── test-db-connection.js       # Database connection test script
```

### 9. services/ - Business Logic Services

```
services/
├── huggingfaceService.ts       # Hugging Face AI service integration
└── medicationService.ts        # Medication management service
```

### 10. types/ - TypeScript Type Definitions

```
types/
├── global.d.ts                 # Global type definitions
├── prescription.ts             # Prescription-related types
└── types.d.ts                  # General type definitions
```

### 11. utils/ - Utility Functions

```
utils/
├── apiClient.ts                # API client configuration
├── generatePrescriptionPDF.ts  # PDF generation utilities
├── medicationService.ts        # Medication service utilities
├── prompts.ts                  # AI prompt templates
└── validation.ts               # Input validation utilities
```

## Technology Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Font**: Vazirmatn (Persian)

### Backend

- **API**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **File Handling**: PDF generation

### AI Integration

- **AI Service**: Hugging Face
- **Features**: Symptom analysis, prescription generation, autocomplete

### Development Tools

- **Package Manager**: PNPM
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Database Migrations**: Drizzle Kit
- **Deployment**: Vercel

## Key Features

1. **Prescription Management**

   - Create, read, update, delete prescriptions
   - PDF generation
   - Prescription presets

2. **AI-Powered Features**

   - Symptom analysis
   - Prescription generation
   - Medication suggestions
   - Autocomplete search

3. **User Management**

   - Authentication via Clerk
   - User registration and sign-in

4. **Database Integration**

   - PostgreSQL with Drizzle ORM
   - Automated migrations
   - Connection management

5. **UI/UX**
   - Responsive design
   - Dark/light theme support
   - Persian language support
   - Modern, accessible interface

## Development Guidelines

1. **Component Structure**: Components are organized by feature and reusability
2. **API Organization**: RESTful API routes with proper HTTP methods
3. **Database**: Type-safe queries using Drizzle ORM
4. **Type Safety**: Comprehensive TypeScript definitions
5. **Styling**: Utility-first approach with Tailwind CSS
6. **AI Integration**: Centralized service layer for AI features

This structure provides a scalable, maintainable foundation for a modern web application with AI capabilities.
