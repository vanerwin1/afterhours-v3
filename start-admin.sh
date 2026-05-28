#!/bin/bash
# AfterHours Admin — start dev server + Cloudflare tunnel
# Run this whenever you want to access the admin dashboard
# Also starts: agent server (port 3335), payment server (port 3337)

PROJECT_DIR="$(dirname "$0")"
ADMIN_DIR="$PROJECT_DIR/admin"
CLOUDFLARED="/tmp/cloudflared"

# Colours
G="\033[0;32m"; Y="\033[1;33m"; C="\033[0;36m"; R="\033[0m"; B="\033[0;34m"

echo ""
echo -e "${C}┌──────────────────────────────────────────────┐${R}"
echo -e "${C}│   🛡️  AfterHours Admin — Starting Services   │${R}"
echo -e "${C}└──────────────────────────────────────────────┘${R}"
echo ""

# Download cloudflared if missing
if [ ! -f "$CLOUDFLARED" ]; then
  echo "Downloading Cloudflare tunnel..."
  curl -sL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz" | tar -xz -C /tmp/
  chmod +x "$CLOUDFLARED"
fi

# Kill any existing instances
lsof -ti :3335 | xargs kill -9 2>/dev/null
lsof -ti :3337 | xargs kill -9 2>/dev/null
lsof -ti :3340 | xargs kill -9 2>/dev/null
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 1

# 1. Start agent server (bookings, AI chat)
cd "$PROJECT_DIR"
echo -e "${G}  ✓ Starting agent server${R}    (port 3335)..."
python3 agent-server.py > /tmp/agent-server.log 2>&1 &
AGENT_PID=$!

# 2. Start payment server (Stripe)
echo -e "${G}  ✓ Starting payment server${R}  (port 3337)..."
python3 payment-server.py > /tmp/payment-server.log 2>&1 &
PAYMENT_PID=$!

# 3. Start admin Next.js dev server
echo -e "${G}  ✓ Starting admin dev server${R} (port 3340)..."
cd "$ADMIN_DIR"
npm run dev -- --port 3340 > /tmp/admin-dev.log 2>&1 &
DEV_PID=$!

# Wait for dev server to be ready
echo -e "  ${B}Waiting for servers to start...${R}"
for i in $(seq 1 30); do
  if curl -s http://localhost:3340 > /dev/null 2>&1; then
    echo -e "  ${G}✓ Admin dev server ready${R}"
    break
  fi
  sleep 1
done

# 4. Start Cloudflare tunnel
echo ""
echo -e "  ${B}Starting Cloudflare tunnel...${R}"
rm -f /tmp/cf-tunnel.log
"$CLOUDFLARED" tunnel --url http://localhost:3340 --no-autoupdate > /tmp/cf-tunnel.log 2>&1 &
CF_PID=$!

# Wait for tunnel URL
for i in $(seq 1 30); do
  TUNNEL_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cf-tunnel.log | head -1)
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
  sleep 1
done

# Health checks
echo ""
AGENT_HEALTH=$(curl -s http://localhost:3335/health 2>/dev/null)
if echo "$AGENT_HEALTH" | grep -q '"status":"ok"'; then
  KEY_OK=$(echo "$AGENT_HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print('key ✓' if d.get('key_loaded') else '⚠ no API key')" 2>/dev/null || echo "ready")
  echo -e "  ${G}  ✓ Agent server${R}    — $KEY_OK (port 3335)"
else
  echo -e "  ${Y}  ⚠ Agent server not responding${R} — check /tmp/agent-server.log"
fi

PAYMENT_HEALTH=$(curl -s http://localhost:3337/health 2>/dev/null)
if echo "$PAYMENT_HEALTH" | grep -q '"status":"ok"'; then
  STRIPE_OK=$(echo "$PAYMENT_HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); n=sum(1 for v in d.get('prices_set',{}).values() if v); print(f'Stripe ✓  ({n}/4 prices)' if d.get('stripe_keys') else '⚠ no Stripe key')" 2>/dev/null || echo "ready")
  echo -e "  ${G}  ✓ Payment server${R}  — $STRIPE_OK (port 3337)"
else
  echo -e "  ${Y}  ⚠ Payment server not responding${R} — check /tmp/payment-server.log"
fi

if [ -n "$TUNNEL_URL" ]; then
  # Update .env with the new tunnel URL
  sed -i '' "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"$TUNNEL_URL\"|" "$ADMIN_DIR/.env"
  sed -i '' "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"$TUNNEL_URL\"|" "$ADMIN_DIR/.env"

  # Restart dev server to pick up new URL
  kill $DEV_PID 2>/dev/null
  sleep 1
  cd "$ADMIN_DIR"
  npm run dev -- --port 3340 > /tmp/admin-dev.log 2>&1 &
  DEV_PID=$!
  sleep 3

  echo ""
  echo -e "${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${R}"
  echo -e "${G}  ✅ Admin Dashboard is LIVE${R}"
  echo ""
  echo -e "  ${C}URL:  ${R}${Y}$TUNNEL_URL${R}"
  echo ""
  echo -e "  ${B}Login:${R}  admin@afterhours.ai / VanK1llb1gtuna"
  echo ""
  echo -e "  Share this URL with your co-founder"
  echo -e "${C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${R}"
  echo ""
  echo -e "  Also running:"
  echo -e "  ${C}  Agent server:   ${R} http://localhost:3335/health"
  echo -e "  ${C}  Payment server: ${R} http://localhost:3337/health"
  echo -e "  ${C}  Admin (local):  ${R} http://localhost:3340"
  echo ""
  echo -e "  Press ${C}Ctrl+C${R} to stop all servers"

  trap "echo ''; echo 'Stopping all servers...'; kill \$AGENT_PID \$PAYMENT_PID \$DEV_PID \$CF_PID 2>/dev/null; echo 'Done.'" INT
  wait $CF_PID
else
  echo -e "${Y}  ❌ Could not get tunnel URL. Check /tmp/cf-tunnel.log${R}"
  cat /tmp/cf-tunnel.log | tail -5
fi
