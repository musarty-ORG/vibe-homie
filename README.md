This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

### Phase 1 UX Overhaul (Completed)

- **PromptInput Component**: Modern multiline input with auto-grow, attachments support, and stop/cancel functionality
- **Admin Mode**: Hidden sandbox panels by default with `?admin=1` query parameter + `ADMIN_MODE_ENABLED=true` environment variable gate
- **Embed Route**: Full-bleed `/embed` route for iframe embedding with minimal chrome
- **Preview/Code Tabs**: Tabbed interface showing preview and generated code with syntax highlighting
- **Security Improvements**: Sanitized file paths and structured logging in download route

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Copy `.env.example` to `.env.local` and configure as needed:

```bash
cp .env.example .env.local
```

- `ADMIN_MODE_ENABLED`: Set to `true` to enable admin mode (shows sandbox panels when `?admin=1` is in URL)

## Routes

- `/` - Main application interface
- `/embed` - Embed-friendly full-bleed layout (no header, optimized for iframes)

## Features

### PromptInput

- Multiline auto-growing text input
- Enter to submit, Shift+Enter for new line
- Image attachment support
- Stop/Cancel button for streaming responses
- Model selector and settings integration

### Admin Mode

By default, the Sandbox Remote Filesystem and Sandbox Remote Output panels are hidden. To enable them:

1. Set `ADMIN_MODE_ENABLED=true` in your environment
2. Add `?admin=1` to the URL

Both conditions must be met for admin mode to activate.

### Download Functionality

Generated files can be downloaded as a ZIP from the download button in the header (appears when files are generated).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
