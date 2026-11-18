# Just an Invoicing Generator

A modern, full-featured quotation generator built with TanStack Start, React, and TypeScript. Create, manage, preview, and print professional quotations with ease.

## Features

- **Quotation Management**: Create, edit, duplicate, and delete quotations
- **Rich Form Builder**: Dynamic line items with details, quantities, rates, and multi-currency support
- **Payment Options**: Support for deposit payments, recurring payments, and second payment options
- **Preview & Print**: Professional preview with optimized print styling for A4 format
- **History & Search**: View all quotations with search and filter capabilities
- **Bulk Operations**: Select and delete multiple quotations at once
- **Dark/Light Theme**: Toggle between light and dark themes
- **Local Storage**: All quotations are saved locally in your browser
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React with SSR)
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based routing)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Deployment**: Cloudflare Workers
- **Linting/Formatting**: Biome

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun (v1.4.2 or higher)

### Installation

```bash
bun install
```

### Development

Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:3773`

### Building for Production

Build the application:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

### Deployment

Deploy to Cloudflare Workers:

```bash
bun run deploy
```

## Project Structure

```
src/
├── components/
│   ├── hooks/          # Custom hooks (calculations)
│   ├── page/           # Page components (quotation form)
│   ├── providers/      # Context providers
│   ├── shared/         # Shared components (navbar, theme toggle)
│   └── ui/             # UI components (button, input, card, etc.)
├── lib/
│   ├── provider/       # Theme provider
│   ├── theme.ts        # Theme utilities
│   └── utils.tsx       # Utility functions
├── routes/
│   ├── __root.tsx      # Root layout
│   ├── index.tsx       # Home page
│   ├── quotation/      # Quotation routes
│   │   ├── index.tsx   # Redirect to new quotation
│   │   ├── $quotation.tsx  # Quotation form/edit
│   │   └── preview.tsx # Preview page
│   └── history/        # History page
├── stores/
│   └── quotation-store.ts  # Zustand store for quotations
├── types/
│   └── quotation.ts    # TypeScript types
└── utils/
    └── quotation.ts    # Quotation utilities
```

## Usage

### Creating a New Quotation

1. Click "New Quotation" on the home page or navigate to `/quotation`
2. Fill in the quotation details:
   - Company information (from/to)
   - Project title
   - Payment type (Deposit payment or Recurring payment)
   - Bank account details
   - Line items with quantities and rates
   - Terms and conditions
3. Click "Preview" to see the formatted quotation
4. Use "Print" to generate a PDF or print the quotation

### Managing Quotations

- **View History**: Navigate to `/history` to see all saved quotations
- **Search**: Use the search bar to filter quotations by project title, client, or quotation ID
- **Edit**: Click the edit icon on any quotation in the history
- **Duplicate**: Click the copy icon to create a duplicate quotation
- **Delete**: Click the trash icon to delete a quotation (with confirmation)
- **Bulk Delete**: Select multiple quotations and use the bulk delete button

### Payment Types

- **Deposit Payment**: Requires a deposit percentage, with optional second payment
- **Recurring Payment**: No deposit required, supports optional second payment

## Development

### Testing

Run tests:

```bash
bun run test
```

### Code Quality

This project uses Biome for linting and formatting. The configuration is in `biome.jsonc`.

### Type Generation

Generate Cloudflare Workers types:

```bash
bun run cf-typegen
```

## License

This project is private.
