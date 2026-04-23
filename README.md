# 🛒 Simba Supermarket

Rwanda's premier online supermarket — shop 552+ products delivered to your door in Kigali.

## Features

- **Multi-language Support**: English, Français, and Kinyarwanda
- **Dark Mode**: Full dark/light theme toggle with persistent settings
- **Product Search**: Real-time product search across 552+ items
- **Category Browsing**: Browse by 9 product categories (Beverages, Dairy, Snacks, etc.)
- **Shopping Cart**: Add products and manage your cart
- **Responsive Design**: Mobile-first design with desktop optimization
- **Product Details**: View detailed product information, pricing, and more

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context (Cart & Language)
- **Icons**: Lucide React
- **Theme**: next-themes
- **Font**: Geist (optimized via next/font)

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Home page with hero & featured products
│   ├── products/       # Products listing and details
│   ├── cart/           # Shopping cart page
│   └── checkout/       # Checkout page
├── components/         # Reusable React components
│   ├── Navbar.tsx      # Navigation with search & language selector
│   ├── ProductCard.tsx # Individual product card
│   ├── CategoryGrid.tsx
│   ├── Pagination.tsx
│   └── Footer.tsx
├── context/            # React Context providers
│   ├── CartContext.tsx
│   └── LanguageContext.tsx
├── lib/               # Utility functions
│   ├── products.ts    # Product utilities & deterministic shuffle
│   ├── formatPrice.ts # Price formatting
│   └── translations.ts
└── types/            # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd simba-supermarket
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables for Google OAuth:
```bash
cp .env.example .env.local
```

Set these values in `.env.local`:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (for local development use `http://localhost:3000`)
- `GROQ_API_KEY` (for conversational product search)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Features Explained

### Multi-language Support
The app supports 3 languages via the `LanguageContext`. Switch languages from the navbar dropdown. Translations are managed in `lib/translations.ts`.

### Shopping Cart
Products can be added to cart from product cards. Cart state is persisted across the app using `CartContext`.

### Product Data
Products are loaded from `public/simba_products.json` and include 552 items across 9 categories with pricing and images.

## Key Components

- **Navbar**: Sticky navigation with logo, menu, search, language selector, theme toggle, and cart icon
- **ProductCard**: Displays product with image, name, price, and add-to-cart button
- **CategoryGrid**: Shows all product categories with item counts
- **Pagination**: Navigate between product pages

## Performance Notes

- Products are shuffled deterministically (seeded) to prevent hydration mismatches
- Images are lazy-loaded via Next.js Image optimization
- Search results are debounced to reduce re-renders
- CSS is optimized via Tailwind CSS tree-shaking

## Styling

The app uses **Tailwind CSS** with custom color scheme:

- **Primary Green**: `#16a34a` (Buttons, links, accents)
- **Secondary Amber**: `#f59e0b` (Highlights)
- **Navy Dark**: `#0f172a` / `#1e293b` (Dark backgrounds)
- **Light Background**: White with subtle borders

Dark mode uses complementary colors via `next-themes`.

## Deployment

Deploy easily on Vercel:

```bash
vercel
```

Or manually build and deploy:

```bash
npm run build
npm start
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

