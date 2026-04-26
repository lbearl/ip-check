# ip.bearl.me 🌐

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Deploys from GitHub](https://img.shields.io/badge/Deploy-Cloudflare%20Git%20Integration-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/ci-cd/)

A lightweight Cloudflare Worker that returns your public IP address — perfect for scripts, diagnostics, and quick checks.

It supports both plain text and JSON responses, with smart content negotiation and an optional `/details` endpoint for ASN, ISP, and geolocation data (powered by Cloudflare).

---

## 🚀 Features

- **Simple IP lookup:**  
  Returns the requester's IPv4 address as plain text or JSON. Will fall back to IPv6 if the v4 address cannot be resolved.

- **Content negotiation:**  
  Automatically chooses the right format based on:
  - `Accept` or `Content-Type` headers  
  - Query parameters (`?type=json` or `?type=text`)

- **IPv4 enforcement:**  
  Always returns IPv4, even if the request originates via IPv6 (unless there is no IPv4 address discoverable)

- **/details endpoint:**  
  Returns extended metadata including ASN, ISP, region, and approximate geolocation.

- **Fast, free, and serverless:**  
  Runs entirely on [Cloudflare Workers](https://developers.cloudflare.com/workers/) — no servers, no latency.

---

## 🧠 Example Usage

### Default (plain text)

```bash
curl https://ip.bearl.me
# → 203.0.113.45
```

### Force JSON via header

```bash
curl -H "Accept: application/json" https://ip.bearl.me
# → {"ip":"203.0.113.45"}
```

### Force text even if JSON header

```bash
curl -H "Accept: application/json" "https://ip.bearl.me?type=text"
# → 203.0.113.45
```

### Get detailed info (supports plain text and JSON)

```bash
curl https://ip.bearl.me/details
# → {"ip":"203.0.113.45","asn":13335,"isp":"Cloudflare, Inc.","country":"US","city":"Chicago", ...}
```

```bash
curl https://ip.bearl.me/details?type=text
# → ip: 203.0.113.45
#   asn: 13335
#   isp: Cloudflare, Inc.
#   country: US
#   city: Chicago
```

---

## Deploy

This project uses [Cloudflare's Git integration](https://developers.cloudflare.com/workers/ci-cd/) — pushing to the `main` branch automatically triggers a deploy.

### Manual deploy

If you need to deploy manually (e.g. for local testing):

1. Clone the repo
2. `npm install`
3. `npx wrangler deploy`
