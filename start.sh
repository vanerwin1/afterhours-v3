#!/bin/bash
# AfterHours.AI — Local Dev Launcher  (v5)
# Starts:
#   1. python3 server.py on port 3333         (hardened static file server)
#   2. python3 tts-proxy.py on port 3334      (ElevenLabs TTS proxy)
#   3. python3 agent-server.py on port 3335   (Claude AI conversational agent)
#   4. Next.js dev server on port 3336        (React/Spline front-end — web/)
#   5. python3 payment-server.py on port 3337 (Stripe payment integration)
#   6. ngrok tunnel (optional — run with: ./start.sh --ngrok)
#
# Usage:
#   ./start.sh                  — starts all servers
#   ./start.sh --ngrok          — also starts ngrok for a public URL
#   ./start.sh --no-next        — skip Next.js (legacy standalone only)
#   ./start.sh --no-payment     — skip payment server (Stripe not configured yet)
#   ./start.sh --stripe-listen  — force-start stripe listen even if STRIPE_WEBHOOK_SECRET is set

cd "$(dirname "$0")"

# Colours
G="\033[0;32m"; Y="\033[1;33m"; C="\033[0;36m"; R="\033[0m"; B="\033[0;34m"

echo ""
echo -e "${C}┌──────────────────────────────────────────────┐${R}"
echo -e "${C}│   🎙️  AfterHours.AI — Local Launcher  v5    │${R}"
echo -e "${C}└──────────────────────────────────────────────┘${R}"
echo ""

# Parse flags
SKIP_NEXT=false
SKIP_PAYMENT=false
USE_NGROK=false
USE_STRIPE_LISTEN=false
for arg in "$@"; do
  case "$arg" in
    --no-next)       SKIP_NEXT=true ;;
    --no-payment)    SKIP_PAYMENT=true ;;
    --ngrok)         USE_NGROK=true ;;
    --stripe-listen) USE_STRIPE_LISTEN=true ;;
  esac
done

# Kill any old instances
pkill -f "server.py"        2>/dev/null && echo -e "${Y}  → Stopped old file server${R}"
pkill -f "tts-proxy.py"     2>/dev/null && echo -e "${Y}  → Stopped old TTS proxy${R}"
pkill -f "agent-server.py"  2>/dev/null && echo -e "${Y}  → Stopped old agent server${R}"
pkill -f "payment-server.py" 2>/dev/null && echo -e "${Y}  → Stopped old payment server${R}"
pkill -f "next dev"         2>/dev/null && echo -e "${Y}  → Stopped old Next.js server${R}"
sleep 0.5

# Check .env exists
if [ ! -f ".env" ]; then
  echo -e "${Y}  ⚠ .env not found — servers will run without API keys${R}"
  echo -e "  Copy the .env template and fill in your keys\n"
fi

# 1. Start hardened file server
python3 server.py &
FS_PID=$!
echo -e "${G}  ✓ File server started${R}      http://localhost:3333"

# 2. Start TTS proxy
python3 tts-proxy.py &
TTS_PID=$!
echo -e "${G}  ✓ TTS proxy started${R}        http://localhost:3334"

# 3. Start AI Agent server
python3 agent-server.py &
AGENT_PID=$!
echo -e "${G}  ✓ Agent server started${R}     http://localhost:3335"

# 5. Start Payment server
PAYMENT_PID=""
if [ "$SKIP_PAYMENT" = false ]; then
  python3 payment-server.py &
  PAYMENT_PID=$!
  echo -e "${G}  ✓ Payment server started${R}   http://localhost:3337"
fi

echo ""
sleep 1.5

# Health checks
echo -e "  ${B}Service health:${R}"

TTS_HEALTH=$(curl -s http://localhost:3334/health 2>/dev/null)
if echo "$TTS_HEALTH" | grep -q '"ok"'; then
  TTS_KEY=$(echo "$TTS_HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print('✓ ElevenLabs key loaded' if d.get('key_loaded') else '⚠ No ElevenLabs key — browser TTS fallback')" 2>/dev/null || echo "ready")
  echo -e "  ${G}  ✓ TTS proxy${R}      — $TTS_KEY"
else
  echo -e "  ${Y}  ⚠ TTS proxy not responding${R}"
fi

AGENT_HEALTH=$(curl -s http://localhost:3335/health 2>/dev/null)
if echo "$AGENT_HEALTH" | grep -q '"ok"\|"maintenance"'; then
  AGENT_STATUS=$(echo "$AGENT_HEALTH" | python3 -c "
import sys, json
d = json.load(sys.stdin)
model = d.get('model','?')
key   = d.get('key_loaded', False)
maint = d.get('maintenance', False)
dau   = d.get('unique_users', {}).get('dau', 0)
if maint:
    print(f'⚠ MAINTENANCE MODE  ({model})')
elif key:
    print(f'✓ Anthropic key loaded  ({model})  DAU: {dau}')
else:
    print(f'⚠ No Anthropic key — add ANTHROPIC_API_KEY to .env')
" 2>/dev/null || echo "ready")
  echo -e "  ${G}  ✓ Agent server${R}   — $AGENT_STATUS"
else
  echo -e "  ${Y}  ⚠ Agent server not responding — check logs above${R}"
fi

if [ "$SKIP_PAYMENT" = false ]; then
  PAYMENT_HEALTH=$(curl -s http://localhost:3337/health 2>/dev/null)
  if echo "$PAYMENT_HEALTH" | grep -q '"ok"'; then
    PAYMENT_STATUS=$(echo "$PAYMENT_HEALTH" | python3 -c "
import sys, json
d = json.load(sys.stdin)
keys   = d.get('stripe_keys', False)
prices = d.get('prices_set', {})
n      = sum(1 for v in prices.values() if v)
if keys and n == 4:
    print(f'✓ Stripe configured  ({n}/4 plans)')
elif keys:
    print(f'⚠ Stripe keys loaded but only {n}/4 Price IDs set in .env')
else:
    print(f'⚠ Stripe not configured — add STRIPE_SECRET_KEY + Price IDs to .env')
" 2>/dev/null || echo "ready")
    echo -e "  ${G}  ✓ Payment server${R} — $PAYMENT_STATUS"
  else
    echo -e "  ${Y}  ⚠ Payment server not responding — check logs above${R}"
  fi
fi

# 6. Stripe webhook listener
STRIPE_PID=""
if [ "$SKIP_PAYMENT" = false ] && command -v stripe &>/dev/null; then
  STRIPE_WHSEC=$(grep -E '^STRIPE_WEBHOOK_SECRET=' .env 2>/dev/null | cut -d= -f2- | tr -d '"'"'"' \t\r')
  if [ -z "$STRIPE_WHSEC" ] || [ "$USE_STRIPE_LISTEN" = true ]; then
    echo ""
    echo -e "  ${B}Stripe webhook listener:${R}"
    echo -e "  ${C}  Forwarding:${R}  https://stripe.com → http://localhost:3337/webhook"
    echo -e "  ${Y}  ↳ Copy the whsec_… secret printed below into .env as STRIPE_WEBHOOK_SECRET${R}"
    echo ""
    stripe listen --forward-to localhost:3337/webhook &
    STRIPE_PID=$!
  fi
fi

# 4. Next.js dev server (React/Spline front-end)
NEXT_PID=""
if [ "$SKIP_NEXT" = false ] && [ -d "web" ] && [ -f "web/package.json" ]; then
  (cd web && npx next dev --port 3336 2>&1 | sed 's/^/  [next] /') &
  NEXT_PID=$!
  echo -e "\n  ${G}✓ Next.js dev started${R}     http://localhost:3336"
fi

echo ""
echo -e "  ${C}Standalone site:${R}  http://localhost:3333/afterhours-standalone.html"
echo -e "  ${C}React/Spline:   ${R}  http://localhost:3336"
echo -e "  ${C}TTS API:        ${R}  http://localhost:3334/tts"
echo -e "  ${C}Agent API:      ${R}  http://localhost:3335/chat"
echo -e "  ${C}Payment API:    ${R}  http://localhost:3337/checkout"
echo -e "  ${C}Agent health:   ${R}  http://localhost:3335/health"
echo -e "  ${C}Payment health: ${R}  http://localhost:3337/health"
echo ""
echo -e "  ${B}Data logs:${R}"
echo -e "  ${C}Bookings:       ${R}  bookings.jsonl  (created on first booking)"
echo -e "  ${C}Subscriptions:  ${R}  subscriptions.jsonl  (created on first payment)"
echo ""

# ngrok (optional)
if [ "$USE_NGROK" = true ]; then
  if [ -f "./ngrok" ]; then
    echo -e "${G}  Starting ngrok tunnel…${R}"
    echo -e "  ${Y}Once ngrok starts, update SITE_BASE_URL in .env to your https:// URL.${R}"
    echo -e "  ${Y}Also update your Stripe webhook endpoint to https://<ngrok-url>/webhook${R}"
    echo ""
    ./ngrok http 3333
  else
    echo -e "${Y}  ngrok binary not found. Download it at https://ngrok.com/download${R}"
  fi
else
  echo -e "  To share publicly:  ${C}./start.sh --ngrok${R}"
  echo ""
fi

# Keep running; stop all on Ctrl+C
trap "echo ''; echo 'Stopping all servers…'; kill \$FS_PID \$TTS_PID \$AGENT_PID \$PAYMENT_PID \$STRIPE_PID \$NEXT_PID 2>/dev/null; echo 'Done.'" INT
echo -e "  Press ${C}Ctrl+C${R} to stop all servers"
wait
