# Directory Structure

This document explains the current directory structure of the AI Bazi frontend application.

## Project Structure

```
frontend/
├── docs/                           # Documentation files
│   ├── DirectoryStructure.md      # This file - project structure documentation
│   ├── ProjectGoals.md            # Project objectives and purpose
│   ├── TASK.md                    # Task tracking and progress
│   └── CHANGELOG.md               # Project modification history
├── public/                        # Static assets
├── src/                          # Source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout component
│   │   ├── page.tsx              # Main homepage component
│   │   ├── globals.css           # Global styles and Tailwind setup
│   │   └── favicon.ico           # Favicon
│   ├── components/               # Reusable React components
│   │   ├── BaziForm.tsx         # Bazi input form component
│   │   ├── BaziResult.tsx       # Bazi chart display component
│   │   └── AnalysisModal.tsx    # AI analysis modal component
│   └── types/                   # TypeScript type definitions
│       └── bazi.ts              # Bazi-related interfaces
├── node_modules/                # Dependencies (auto-generated)
├── package.json                 # Package configuration and dependencies
├── package-lock.json           # Dependency lock file
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
├── env.example                 # Environment variables example
├── .gitignore                  # Git ignore rules
├── next-env.d.ts               # Next.js type definitions
└── README.md                   # Project readme
```

## Key Directories

### `/src/app/`
Contains Next.js App Router components:
- `layout.tsx`: Root layout with metadata and global styling
- `page.tsx`: Main application page with state management
- `globals.css`: Global CSS with Tailwind imports and custom styles

### `/src/components/`
Reusable React components with TypeScript:
- `BaziForm.tsx`: Form for inputting birth date/time data
- `BaziResult.tsx`: Display component for calculated Bazi chart
- `AnalysisModal.tsx`: Modal for showing AI analysis results

### `/src/types/`
TypeScript type definitions:
- `bazi.ts`: Interfaces for Bazi data structures and API responses

### `/docs/`
Project documentation and tracking files:
- Maintains project structure, goals, tasks, and changelog

## Technology Stack

- **Next.js 15.3.3**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth UI interactions
- **React 19**: UI library for building components

## File Naming Conventions

- React components: PascalCase (e.g., `BaziForm.tsx`)
- Type definitions: camelCase (e.g., `bazi.ts`)
- Configuration files: lowercase with dots (e.g., `tailwind.config.js`)
- Documentation: PascalCase for markdown (e.g., `DirectoryStructure.md`) 