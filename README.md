# VisitorHub - Angular Project

A professional visitor management dashboard built with Angular 17 (standalone components).

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── header/              # Reusable Header Component
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   └── header.component.scss
│   │   └── sidenav/             # Reusable Sidenav Component
│   │       ├── sidenav.component.ts
│   │       ├── sidenav.component.html
│   │       └── sidenav.component.scss
│   ├── pages/
│   │   └── dashboard/           # Dashboard Page
│   │       ├── dashboard.component.ts
│   │       ├── dashboard.component.html
│   │       └── dashboard.component.scss
│   ├── app.component.ts         # Root Component (uses Header + Sidenav)
│   ├── app.config.ts            # App Config (providers)
│   └── app.routes.ts            # Routes
├── styles.scss                  # Global Styles & CSS Variables
└── index.html
```

## Setup & Run

### Prerequisites
- Node.js 18+
- Angular CLI 17+

### Install Angular CLI (if not installed)
```bash
npm install -g @angular/cli
```

### Install dependencies
```bash
npm install
```

### Run development server
```bash
ng serve
```

Then open http://localhost:4200

### Build for production
```bash
ng build
```

## Features
- ✅ Dark sidebar with orange active state
- ✅ Sticky header with search, live data badge, notifications
- ✅ Stat cards (Total, Pending, Active, Done, Staff)
- ✅ Visitor table with filter tabs
- ✅ Status badges (Pending, Active, Completed, Approved)
- ✅ Checkout & Print action buttons
- ✅ Reusable Header & Sidenav components
- ✅ Angular standalone components (no NgModule needed)
- ✅ Responsive layout
