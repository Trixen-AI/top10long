# Top10Long

The Long.xyz Top 10 Token Index on Robinhood Chain. Live at [top10long.xyz](https://top10long.xyz).

- `/` landing page with the live top 10 (ranked by market cap, refreshed every 60s)
- `/docs/` methodology, live constituents and contracts
- `/app/` dashboard (Reown AppKit wallet, live balances, index, claim approval)

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in VITE_REOWN_PROJECT_ID
npm run dev                  # http://localhost:5173
```

`npm run build` builds all three pages into `dist/`. `npm run lint` runs oxlint.

## Environment variables

| Variable | Required | What it does |
|---|---|---|
| `VITE_REOWN_PROJECT_ID` | Yes | Reown (WalletConnect) project id for the wallet modal. Get it at [dashboard.reown.com](https://dashboard.reown.com). |
| `VITE_ROBINHOOD_RPC_URL` | Recommended | Your own Robinhood Chain RPC. The public RPCs are rate limited and are used as fallbacks. |
| `VITE_T10L_TOKEN_ADDRESS` | When live | T10L token contract. Enables T10L balance, price and the Get T10L card. |
| `VITE_T10L_CLAIM_ADDRESS` | When live | Claim contract (interface in `src/app/config/claimAbi.ts`). Enables the holder window and the claim step. |

`VITE_` variables are baked in at build time: after changing one on Vercel, redeploy.

## Deploy on Vercel

1. Import this repository in Vercel. The framework (Vite), build command and output directory come from `vercel.json`.
2. Add the environment variables above for Production (and Preview if you want previews to connect wallets).
3. Add the domain `top10long.xyz` (and `www.top10long.xyz`, which `vercel.json` redirects to the apex).
4. In the Reown dashboard, add `top10long.xyz` to the project's allowed domains, otherwise wallet connection is blocked in production.

`vercel.json` also rewrites every `/app/*` route to the dashboard, caches hashed assets for a year and sets basic security headers.

## Live index data

The index is every token launched through Long.xyz's official launcher contracts, ranked by DexScreener market cap. `npm run scan:long` scans all launches on-chain and writes the candidate pool to `public/data/long-candidates.json` (about 13 minutes, the public RPC is rate limited). The site prices that pool live and adds launches newer than the scan on each visit. Re-run the scan now and then and redeploy so older tokens that climb into the top 10 are included.

## Brand assets

`npm run brand` regenerates the logo, favicon, app icons and the social share image from `scripts/build-brand.mjs` (Geist, SIL OFL, outlined to paths).
