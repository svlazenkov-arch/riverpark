# Design Guidelines for ЖК River Park Mobile Application

## Design Approach

**Selected Approach**: Design System with Material Design principles
**Justification**: This is a utility-focused application for managing residential services. Users need efficiency, clarity, and reliability over visual experimentation. The design should prioritize usability for all age groups while maintaining the brand's natural, trustworthy aesthetic.

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- Primary Green: 157 45% 27% (from logo/branding - #2d5a3d)
- Accent Green: 157 38% 39% (#4a7c59)
- Success Green: 142 76% 36%

**Semantic Colors:**
- Destructive/Error Red: 0 84% 60%
- Warning Yellow: 45 93% 47%
- Info Blue: 210 100% 40%

**Neutral Colors:**
- Background: 240 10% 98%
- Foreground: 0 0% 20%
- Muted: 240 5% 97%
- Muted Foreground: 0 0% 55%

**Chart Colors (for data visualization):**
- Chart 1: 157 45% 27%
- Chart 2: 142 76% 36%
- Chart 3: 197 92% 45%
- Chart 4: 45 93% 47%
- Chart 5: 27 87% 67%

### B. Typography

**Font Families:**
- Headings: Montserrat, sans-serif (weights: 600, 700)
- Body Text: Inter, sans-serif (weights: 400, 500, 600)
- Monospace (for numbers/codes): System monospace

**Type Scale:**
- H1 (Page Titles): text-3xl (30px), font-bold, tracking-tight
- H2 (Section Titles): text-xl (20px), font-semibold
- H3 (Card Titles): text-lg (18px), font-semibold
- Body: text-base (16px), font-normal
- Small Text: text-sm (14px)
- Extra Small: text-xs (12px)

### C. Layout System

**Spacing Primitives:** Use Tailwind units: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24
- Common spacing: p-4, p-6 for cards; gap-4, gap-6 for grids
- Section spacing: py-6, py-8 for main sections
- Component internal spacing: p-4 for card content

**Container Widths:**
- Mobile: Full width with px-4 side padding
- Desktop: max-w-7xl centered with mx-auto

**Grid System:**
- Mobile: Single column (grid-cols-1)
- Tablet: Two columns (md:grid-cols-2)
- Desktop: Up to four columns (lg:grid-cols-4) for quick actions only

### D. Component Library

**Navigation:**
- Top Bar: 56px height, white background, subtle shadow
- Bottom Navigation: 64px height, 4 primary actions (Home, Bills, Requests, Profile)
- Active state: Primary green color with icon and label

**Cards:**
- Standard Card: white background, rounded-lg (12px), shadow-sm
- Hover Effect: shadow-lg transition
- Padding: p-4 or p-6 depending on content density
- Bill Cards: Status badge, amount prominently displayed, due date
- Request Cards: Category icon, status indicator, priority dot
- News Cards: Title, excerpt, timestamp, attachment indicator

**Buttons:**
- Primary: bg-primary, text-white, h-10 or h-12, rounded-lg
- Secondary: border-primary, text-primary, outline style
- Destructive: bg-destructive, text-white
- Ghost: transparent background for utility actions
- Icon Buttons: 44x44px minimum touch target

**Forms:**
- Input Fields: h-12, rounded-lg, border, px-3
- Labels: text-sm, font-medium, mb-2
- Error States: border-destructive with error text
- Dropdowns: Chevron indicator, full clickable area

**Status Badges:**
- Paid: bg-chart-3 (green), text-white
- Pending: bg-chart-5/20 (warm), text-chart-5
- Overdue: bg-destructive, text-destructive-foreground
- In Progress: bg-chart-4/20 (amber), text-chart-4
- Completed: bg-chart-3/20, text-chart-3

**Modals & Sheets:**
- Bottom Sheets for mobile actions (payment method selection, filters)
- Full-screen modals for detail views on mobile
- Semi-transparent backdrop: rgba(0,0,0,0.5)

### E. Visual Patterns

**Icons:**
- Use Lucide React icons throughout
- Size: w-5 h-5 (20px) for inline, w-6 h-6 (24px) for emphasis
- Category icons in muted background circles (w-12 h-12)
- Consistent icon-text pairing

**Loading States:**
- Skeleton screens matching actual content structure
- Height and width matching final components
- Subtle pulse animation

**Empty States:**
- Centered icon (48px)
- Short explanatory text
- Primary action button if applicable

**Data Display:**
- Key-value pairs in grid-cols-2 or grid-cols-3
- Labels in text-muted-foreground
- Values in font-semibold
- Dividers for visual separation

## Design Principles

1. **Clarity First**: Every element serves a purpose; information hierarchy is always clear
2. **Touch-Friendly**: Minimum 44x44px touch targets for all interactive elements
3. **Accessible for All Ages**: Large text, clear labels, intuitive icons
4. **Nature-Inspired Calm**: Green color palette evokes trust and harmony
5. **Consistent Patterns**: Same interactions behave the same way throughout
6. **Progressive Disclosure**: Show essential info first, details on demand

## Screen-Specific Guidelines

**Dashboard:**
- Personalized greeting with user name
- Outstanding balance alert if applicable (destructive styling)
- 2x2 grid of quick action cards on mobile
- Active requests summary in dedicated card
- News feed with horizontal scroll on mobile

**Bills & Payments:**
- List view with most recent on top
- Status color coding (green=paid, amber=pending, red=overdue)
- Tap card to see details
- Prominent "Pay Now" button for unpaid bills
- Payment history accessible from profile

**Requests/Tickets:**
- FAB (floating action button) for new request
- Category icon for quick scanning
- Priority indicator (colored dot)
- Status badges
- Attachment thumbnails in detail view

**Meter Readings:**
- Auto-calculation of consumption
- Previous reading shown for reference
- Large input fields (h-12) for easy entry
- Consumption highlighted in green if normal, red if unusually high
- Submit all readings at once

**Profile:**
- Avatar or initial circle at top
- Apartment info in dedicated card
- Menu items as full-width cards with icons
- Clear logout button at bottom

## PWA-Specific Features

- App icon: Green with white "RP" monogram
- Splash screen: White background with centered logo
- Install prompt with benefits explanation
- Offline indicator when network unavailable
- Push notification badges on bottom navigation

## Images

**Hero/Welcome Images:** Not required for utility app
**Contextual Images:**
- Default avatar placeholders for profile
- Category illustration icons for empty states
- Success confirmation graphics (checkmark in green circle)
- Document type icons (PDF, DOC, etc.)