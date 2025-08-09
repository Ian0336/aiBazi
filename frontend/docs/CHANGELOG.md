# Changelog
## [1.1.0] - 2025-08-09

### Added
- Backend Python API now includes two additional fields in the Bazi response:
  - `dayun_pillar`: Current Dayun (大運) pillar with `gan`, `zhi`, `ganzhi`, `gan_ten_deity`, `zhi_ten_deity`, `hidden_stems`, `nayin`, and computed `shensha` using `apply_shensha_rules_with_certain_pillar`.
  - `liunian_pillar`: Current Liunian (流年) pillar (for the current year) with year/age and similar attributes including `shensha`.

### Fixed
- Corrected a datetime usage bug in backend when determining child age for shensha rules.

### Notes
- The computation of current Dayun aligns with frontend age reckoning (current year − birth year + 1).


This document records all modifications, updates, and changes made to the AI Bazi fortune telling application project.

## [1.0.0] - 2024-01-20

### Added

#### Initial Project Setup
- **Next.js 15.3.3** application with TypeScript support
- **Tailwind CSS 4** configuration with custom cyber aesthetic theme
- **Framer Motion** for smooth animations and micro-interactions
- **Inter font family** integration for modern typography
- Project directory structure following Next.js App Router conventions

#### Core Components
- **BaziForm component** (`src/components/BaziForm.tsx`)
  - Controlled form inputs for year, month, day, and hour
  - Real-time input validation with error messaging
  - Framer Motion animations for focus states and interactions
  - API integration for Bazi calculation
  - Loading states with animated spinners
  
- **BaziResult component** (`src/components/BaziResult.tsx`)
  - Responsive four-pillar display with animated cards
  - Interactive hover effects and 3D transformations
  - Icons and gradients for visual appeal
  - AI analysis trigger button with loading animations
  
- **AnalysisModal component** (`src/components/AnalysisModal.tsx`)
  - Full-screen modal with backdrop blur
  - Typewriter effect for analysis text display
  - Keyboard navigation (Escape to close)
  - Spring animations for modal entrance/exit
  - Decorative animated elements

#### Main Application
- **Homepage** (`src/app/page.tsx`)
  - State management for Bazi chart and analysis data
  - API integration for both calculation and analysis endpoints
  - Animated page header with gradient text effects
  - Background decorative elements with floating animations
  - Error handling and user feedback systems

#### Styling & Design
- **Global CSS** (`src/app/globals.css`)
  - Dark theme with cyber aesthetic
  - Custom scrollbar styling
  - Utility classes for buttons and inputs
  - Gradient backgrounds and neon effects
  
- **Tailwind Configuration** (`tailwind.config.js`)
  - Custom color palette (cyber-blue, cyber-purple, neon-green)
  - Custom animations (glow, float, pulse-slow)
  - Extended box-shadow utilities for neon effects
  - Gradient background utilities

#### TypeScript Definitions
- **Bazi Types** (`src/types/bazi.ts`)
  - `BaziInput` interface for form data
  - `BaziChart` interface for calculated results
  - `AnalysisResponse` interface for AI analysis
  - `ApiResponse<T>` generic interface for API responses

#### Configuration Files
- **Layout configuration** (`src/app/layout.tsx`)
  - SEO-optimized metadata in Traditional Chinese
  - Open Graph configuration
  - Font loading optimization
  
- **Environment configuration** (`env.example`)
  - API base URL configuration template
  - Development environment settings

#### Documentation
- **Directory Structure** (`docs/DirectoryStructure.md`)
  - Complete project structure documentation
  - File and folder descriptions
  - Technology stack overview
  - Naming conventions guide
  
- **Project Goals** (`docs/ProjectGoals.md`)
  - Primary objectives and vision
  - Feature goals and success metrics
  - Target audience definition
  - Long-term roadmap
  
- **Task Tracking** (`docs/TASK.md`)
  - Comprehensive task list with status tracking
  - Priority classification system
  - Category organization
  - Progress monitoring framework

### Technical Specifications

#### Dependencies Added
- `framer-motion`: ^11.x.x for animations
- `next`: 15.3.3 for React framework
- `react`: ^19.0.0 for UI components
- `tailwindcss`: ^4 for styling
- `typescript`: ^5 for type safety

#### Performance Optimizations
- Font preloading with Google Fonts
- Optimized animation performance with GPU acceleration
- Lazy loading considerations for future implementations
- Responsive design optimizations

#### Browser Support
- Modern browsers with ES2022 support
- Mobile-responsive design for all screen sizes
- Touch-friendly interactions for mobile devices

### Design Features

#### Visual Theme
- **Dark background** with subtle gradient overlays
- **Neon accent colors** (cyan, purple, orange) for highlights
- **Glassmorphism effects** with backdrop blur
- **Smooth animations** throughout the user interface

#### User Experience
- **Progressive disclosure** of information
- **Clear visual hierarchy** with typography scales
- **Intuitive navigation** with keyboard accessibility
- **Responsive feedback** for all user interactions

### Security Considerations
- Input validation on all form fields
- Secure API communication setup
- Environment variable protection
- XSS prevention through React's built-in protections

### Known Issues
- None at initial release

### Migration Notes
- This is the initial release - no migration required
- Environment variables must be configured before running
- Backend API must be available for full functionality

---

## Template for Future Entries

```markdown
## [Version] - YYYY-MM-DD

### Added
- New features and functionality

### Changed
- Modifications to existing features

### Deprecated
- Features marked for removal

### Removed
- Deleted features

### Fixed
- Bug fixes

### Security
- Security improvements
```

---

**Note**: All changes are documented in English as per project requirements. Each entry should include sufficient detail for developers to understand the scope and impact of modifications. 