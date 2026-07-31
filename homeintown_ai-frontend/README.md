# HomeInTown - Property Search Platform

A Next.js 14 application for property listing, searching, and connecting buyers with sellers/agents.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local` with your actual values:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
```

This will:
1. Inject env vars into the service worker (`prebuild` script)
2. Build the Next.js static export to the `out/` folder

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── account/
│   │   ├── admin/         # Admin panel pages
│   │   └── vendor/        # Vendor panel pages
│   ├── contact/
│   ├── login/
│   ├── main/
│   ├── privacy/
│   ├── terms/
│   └── view-property-details/
├── components/            # Reusable components
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── lib/                   # Utilities & configuration
│   ├── api.ts            # Centralized API helper
│   └── firebase.ts       # Firebase configuration
└── store/                # Redux store
    ├── slices/
    │   └── authSlice.ts
    ├── hooks.ts
    ├── store.ts
    └── StoreProvider.tsx
```

### Key Architecture Decisions

- **No hardcoded secrets** — All API keys and URLs come from environment variables
- **Centralized API layer** — `src/lib/api.ts` handles all HTTP requests with auth headers
- **Firebase config from env** — `src/lib/firebase.ts` reads from `NEXT_PUBLIC_*` variables
- **Static export** — Configured for `output: "export"` for deployment to any static host
- **Redux for state** — Auth state managed via Redux Toolkit
- **Protected routes** — Account layout checks for token before rendering

## Deployment

The `out/` folder after build can be deployed to:
- Vercel (automatic)
- Netlify
- AWS S3 + CloudFront
- Any static file server

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Redux Toolkit
- Firebase (Auth + Messaging)
- react-hot-toast
- lucide-react + react-icons
