# Self-Hosting the AuthFill Proxy

This guide explains how to deploy your own AuthFill proxy server for handling IMAP connections.

## Overview

The AuthFill proxy is a Cloudflare Worker that handles WebSocket connections for IMAP email access. Self-hosting allows you to:

- Keep email connections within your infrastructure
- Comply with data residency requirements
- Have full control over the proxy server

## Prerequisites

- [Node.js](https://nodejs.org/) 22.14.0 or later
- [pnpm](https://pnpm.io/) 8.15.6 or later
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (for Workers deployment)

## Deployment Options

### Option 1: Cloudflare Workers (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/authfill.git
   cd authfill
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure your Cloudflare account:
   ```bash
   cd apps/proxy
   npx wrangler login
   ```

4. Deploy to Cloudflare Workers:
   ```bash
   pnpm --filter proxy deploy
   ```

5. Note your deployed URL (e.g., `https://authfill-proxy.your-subdomain.workers.dev`)

### Option 2: Local Development

For testing purposes, you can run the proxy locally:

```bash
pnpm --filter proxy dev
```

The proxy will be available at `http://localhost:4000`.

## Configuration

### Environment Variables

The proxy uses the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_WEB_URL` | URL of the AuthFill web app (for CORS) | - |

### Custom Domain (Cloudflare Workers)

To use a custom domain:

1. Go to your Cloudflare dashboard
2. Navigate to Workers & Pages
3. Select your proxy worker
4. Go to Settings > Triggers
5. Add a custom domain

## Configuring the Extension

1. Open the AuthFill extension popup
2. Click the **gear icon** in the top-right corner
3. Enable **Use Custom Proxy**
4. Enter your proxy URL (e.g., `https://proxy.example.com`)
5. Click **Save Settings** (the connection will be tested automatically)

## API Endpoints

The proxy exposes the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/imap/test` | POST | Test IMAP connection credentials |
| `/imap` | WebSocket | WebSocket endpoint for IMAP connections |

## Security Considerations

- The proxy handles email credentials - deploy with HTTPS only
- Consider restricting access via Cloudflare Access or IP allowlists
- Credentials are transmitted encrypted but not stored by the proxy
- Review the proxy code before deployment to understand data handling

## Troubleshooting

### Connection Test Fails

1. Verify the proxy URL is correct (including `https://`)
2. Check that the proxy is running and accessible
3. Ensure CORS is configured to allow requests from the extension

### WebSocket Connection Issues

1. Verify the proxy supports WebSocket connections
2. Check for any firewall or proxy blocking WebSocket upgrades
3. Ensure the URL uses the correct protocol (`wss://` for HTTPS)

### IMAP Connection Errors

1. Verify your email provider allows IMAP access
2. Check that your credentials are correct
3. Some providers require app-specific passwords (e.g., Gmail)

## Support

For issues with self-hosting, please open an issue on the GitHub repository.
