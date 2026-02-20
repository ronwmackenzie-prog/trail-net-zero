# Trail Net Zero

A professional community website for trail running sustainability. Join practitioners working toward verifiable net-zero and regenerative outcomes in trail running.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **Payments:** Stripe
- **Deployment:** Vercel (link your repo to create a project)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp env.example .env
```

Required variables:

- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID`
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **OpenAI (optional):** `OPENAI_API_KEY`

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Project Structure

- **Home:** Hero, principles, audience, how it works, join CTA
- **Forum:** Categories, threads, resources, admin (content, categories, flags, threads)
- **Auth:** Sign in, sign up, account
- **Pages:** About, contact, join, standards, roadmap, terms, privacy

## License

Private.
