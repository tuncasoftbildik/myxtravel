# RateHawk Static Egress Proxy Setup

All RateHawk B2B v3 calls must leave from a fixed IP so RH can whitelist us. Vercel serverless egress is dynamic, so we route through the AWS Lightsail `api-proxy` box in Frankfurt (`63.182.154.248`).

## Architecture

```
Vercel (Next.js API route)
   │
   │ HTTPS CONNECT (Basic auth)
   ▼
Lightsail api-proxy (tinyproxy, port 8888)
   │
   │ HTTPS direct
   ▼
api.worldota.net (RateHawk B2B v3)
```

## Part 1 — Lightsail setup (run on the box)

SSH into the instance (`ssh ubuntu@63.182.154.248`) and run:

```bash
sudo apt-get update
sudo apt-get install -y tinyproxy apache2-utils

# Generate a strong password (save it — you'll need it in Vercel env)
PROXY_USER=xtravel
PROXY_PASS=$(openssl rand -base64 24)
echo "PROXY_USER=$PROXY_USER"
echo "PROXY_PASS=$PROXY_PASS"

# Configure tinyproxy — bind to all interfaces, port 8888, require auth,
# only proxy to RateHawk hosts so the box can't be used as an open relay.
sudo tee /etc/tinyproxy/tinyproxy.conf > /dev/null <<EOF
User tinyproxy
Group tinyproxy
Port 8888
Listen 0.0.0.0
Timeout 600
DefaultErrorFile "/usr/share/tinyproxy/default.html"
StatFile "/usr/share/tinyproxy/stats.html"
LogFile "/var/log/tinyproxy/tinyproxy.log"
LogLevel Info
PidFile "/run/tinyproxy/tinyproxy.pid"
MaxClients 100
BasicAuth $PROXY_USER $PROXY_PASS

# Lock CONNECT to HTTPS on 443 only
ConnectPort 443

# Allowlist — only RateHawk gets proxied
Filter "/etc/tinyproxy/filter"
FilterURLs Off
FilterExtended On
FilterDefaultDeny Yes
EOF

# Domain allowlist
sudo tee /etc/tinyproxy/filter > /dev/null <<EOF
^(.*\.)?worldota\.net$
^(.*\.)?ratehawk\.com$
^(.*\.)?emergingtravel\.com$
EOF

sudo systemctl restart tinyproxy
sudo systemctl enable tinyproxy
sudo systemctl status tinyproxy --no-pager
```

Open the port in Lightsail firewall UI:
- **Networking → IPv4 Firewall → Add rule**
- Application: `Custom` · Protocol: `TCP` · Port: `8888` · Source: `Anywhere` (we rely on Basic auth + domain filter, not IP allowlist, because Vercel egress is dynamic)

Verify from your laptop:

```bash
curl -v -x http://xtravel:YOUR_PASS@63.182.154.248:8888 https://api.worldota.net/api/b2b/v3/overview/ \
  -u "422:YOUR_RH_KEY" -H "Content-Type: application/json" -d "{}"
```

Should return a 200 RH envelope (or auth error from RH — that's fine, proves the proxy hop works).

## Part 2 — Vercel env var

Add to **Vercel → Project → Settings → Environment Variables**:

```
RATEHAWK_PROXY_URL = http://xtravel:YOUR_PASS@63.182.154.248:8888
```

Set it for **Preview** and **Production**. Redeploy. Do NOT set it locally — dev hits sandbox direct from your laptop IP.

## Part 3 — Verification

After deploy, check the Vercel function logs for a booking flow. Also from the Lightsail box:

```bash
sudo tail -f /var/log/tinyproxy/tinyproxy.log
```

You should see CONNECT lines to `api.worldota.net:443` correlated with each booking attempt.

## Rollback

Delete `RATEHAWK_PROXY_URL` env var from Vercel and redeploy — client falls back to direct fetch (no code change needed; proxy is opt-in via env).

## Security notes

- BasicAuth password is the only thing preventing open proxy abuse. Rotate it every 90 days.
- Domain allowlist filter restricts CONNECT targets to RateHawk hostnames — box can't be used as generic open relay even if credentials leak.
- Lightsail `api-proxy` is shared with UETDS (port 3200 per `reference_uetds.md`). Keep ports separate; don't touch UETDS config.
