#!/usr/bin/env python3
"""
AfterHours.AI — Stripe Payment Server  (v1)
==========================================
Port 3337. Handles subscription checkout, webhook events, and subscription
status checks. No third-party Python deps — uses only the stdlib.

Endpoints
  POST /checkout        { "plan": "starter|pro|business|agency", "email": "..." }
                        → { "url": "https://checkout.stripe.com/..." }
  POST /webhook         Stripe webhook — verifies signature, persists events
  GET  /subscription    ?session_id=cs_...  → subscription details
  GET  /health          → live status

Bank Setup (one-time, in Stripe Dashboard)
  stripe.com → Settings → Payouts → "+ Add bank account"
  Stripe deposits earnings to your bank account on a rolling 2-day schedule.
  Test mode uses test bank accounts (routing 110000000, account 000123456789).

Stripe Setup Checklist
  1. Create account at stripe.com
  2. Get API keys from dashboard.stripe.com/apikeys
     — Publishable key → STRIPE_PUBLIC_KEY in .env (used by frontend JS)
     — Secret key      → STRIPE_SECRET_KEY in .env (NEVER expose to browser)
  3. Create 4 recurring Products + Prices in dashboard.stripe.com/products
     One per plan. Set billing interval = monthly.
     Copy each Price ID (price_xxx) into STRIPE_PRICE_STARTER etc. in .env
  4. Set up webhook at dashboard.stripe.com/webhooks
     Endpoint URL (local): use ngrok → https://xxxx.ngrok.io/webhook
     Endpoint URL (prod):  https://yourdomain.com/webhook   (port 3337 proxied)
     Events to listen for:
       checkout.session.completed
       customer.subscription.updated
       customer.subscription.deleted
       invoice.payment_failed
       invoice.payment_succeeded
     Copy the "Signing secret" (whsec_...) → STRIPE_WEBHOOK_SECRET in .env

Usage
  python3 payment-server.py
  (set all STRIPE_* vars in .env — server starts without them but checkout will return 503)
"""

import hashlib
import hmac
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from typing import Optional, Dict, Any


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Each request handled in its own thread."""
    daemon_threads = True


# ── Load .env ────────────────────────────────────────────────────────────────
# Force-assignment so empty parent-env vars don't shadow .env values.
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.isfile(_ENV_PATH):
    with open(_ENV_PATH) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _, _v = _line.partition("=")
                _k, _v = _k.strip(), _v.strip()
                if _v or not os.environ.get(_k):
                    os.environ[_k] = _v

# ── Config ───────────────────────────────────────────────────────────────────
PORT               = int(os.environ.get("PAYMENT_PORT",          3337))
STRIPE_SECRET_KEY  = os.environ.get("STRIPE_SECRET_KEY",         "")
STRIPE_PUBLIC_KEY  = os.environ.get("STRIPE_PUBLIC_KEY",         "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET",  "")

# Monthly Price IDs — create in stripe.com/products (monthly recurring)
STRIPE_PRICES_MONTHLY = {
    "starter":  os.environ.get("STRIPE_PRICE_STARTER",         ""),   # $297/mo
    "pro":      os.environ.get("STRIPE_PRICE_PRO",              ""),   # $497/mo
    "business": os.environ.get("STRIPE_PRICE_BUSINESS",         ""),   # $897/mo
    "agency":   os.environ.get("STRIPE_PRICE_AGENCY",           ""),   # $1,497/mo
}
# Annual Price IDs — create separate yearly recurring prices in Stripe (~17% discount)
STRIPE_PRICES_ANNUAL = {
    "starter":  os.environ.get("STRIPE_PRICE_STARTER_ANNUAL",  ""),   # $2,970/yr ($247/mo equivalent)
    "pro":      os.environ.get("STRIPE_PRICE_PRO_ANNUAL",       ""),   # $4,970/yr ($414/mo equivalent)
    "business": os.environ.get("STRIPE_PRICE_BUSINESS_ANNUAL",  ""),   # $8,970/yr ($747/mo equivalent)
    "agency":   os.environ.get("STRIPE_PRICE_AGENCY_ANNUAL",    ""),   # $14,970/yr ($1,247/mo equivalent)
}

PLAN_NAMES          = {"starter": "Starter", "pro": "Pro", "business": "Business", "agency": "Agency"}
PLAN_AMOUNTS_MONTHLY = {"starter": 297,       "pro": 497,   "business": 897,        "agency": 1497}
PLAN_AMOUNTS_ANNUAL  = {"starter": 2970,      "pro": 4970,  "business": 8970,       "agency": 14970}

# Base URL for redirect after checkout (no trailing slash)
# Local dev: http://localhost:3333
# Production: https://yourdomain.com
BASE_URL = os.environ.get("SITE_BASE_URL", "http://localhost:3333")

# Subscriptions log — one JSON object per line
SUBS_LOG = os.path.join(os.path.dirname(__file__), "subscriptions.jsonl")

# CORS
_raw_origins    = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3333,http://127.0.0.1:3333")
ALLOWED_ORIGINS = {o.strip().rstrip("/") for o in _raw_origins.split(",") if o.strip()}

# Rate limiting
RATE_LIMIT_RPM  = int(os.environ.get("RATE_LIMIT_RPM", 20))
_rate_buckets: Dict[str, list] = defaultdict(list)

_start_time     = time.time()
SERVER_VERSION  = os.environ.get("SERVER_VERSION", "1.0.0")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _ts() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S")


def _check_rate_limit(ip: str) -> bool:
    now = time.monotonic()
    win = 60.0
    _rate_buckets[ip] = [t for t in _rate_buckets[ip] if now - t < win]
    if len(_rate_buckets[ip]) >= RATE_LIMIT_RPM:
        return False
    _rate_buckets[ip].append(now)
    return True


def _allowed_origin(origin: Optional[str]) -> Optional[str]:
    if not origin:
        return None
    o = origin.rstrip("/")
    if o in ALLOWED_ORIGINS:
        return o
    if o.startswith("http://localhost:") or o.startswith("http://127.0.0.1:"):
        return o
    return None


def _stripe_request(method: str, path: str, data: Optional[dict] = None) -> dict:
    """
    Make an authenticated Stripe API request.
    Uses application/x-www-form-urlencoded (Stripe's preferred format).
    Raises urllib.error.HTTPError on 4xx/5xx.
    """
    url = f"https://api.stripe.com{path}"
    body = urllib.parse.urlencode(data).encode() if data else None
    req = urllib.request.Request(
        url,
        data    = body,
        method  = method,
        headers = {
            "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
            "Content-Type":  "application/x-www-form-urlencoded",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def _verify_webhook_signature(body: bytes, sig_header: str, secret: str) -> bool:
    """
    Verify a Stripe webhook signature.
    Spec: https://stripe.com/docs/webhooks/signatures
    """
    try:
        parts  = {k: v for k, v in (p.split("=", 1) for p in sig_header.split(","))}
        ts     = parts.get("t", "")
        sigs   = [v for k, v in parts.items() if k == "v1"]
        # Replay-attack check — reject events older than 5 minutes
        if abs(time.time() - int(ts)) > 300:
            return False
        signed = f"{ts}.".encode() + body
        mac    = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
        return any(hmac.compare_digest(mac, s) for s in sigs)
    except Exception:
        return False


def _log_event(event: dict):
    """Append a Stripe event to the local JSONL log."""
    try:
        record = {
            "logged_at":  time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "event_type": event.get("type", "unknown"),
            "event_id":   event.get("id",   ""),
            "data":       event.get("data", {}).get("object", {}),
        }
        with open(SUBS_LOG, "a") as f:
            f.write(json.dumps(record) + "\n")
    except Exception as e:
        print(f"[{_ts()}] [LOG-ERROR] {e}")


# ── HTTP Handler ───────────────────────────────────────────────────────────────

class PaymentHandler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        print(f"[{_ts()}] [{self.client_address[0]}] {fmt % args}")

    def _send_cors(self, origin=None):
        o = _allowed_origin(origin)
        if o:
            self.send_header("Access-Control-Allow-Origin",  o)
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Vary", "Origin")

    def _send_security(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options",         "DENY")
        self.send_header("Cache-Control",           "no-store")

    def _json(self, code: int, data: dict, origin=None):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type",   "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors(origin)
        self._send_security()
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self) -> Optional[bytes]:
        length = int(self.headers.get("Content-Length", 0))
        if length > 65536:
            self.send_response(413)
            self.end_headers()
            return None
        return self.rfile.read(length)

    def do_OPTIONS(self):
        origin  = self.headers.get("Origin")
        allowed = _allowed_origin(origin)
        if allowed:
            self.send_response(204)
            self._send_cors(origin)
            self._send_security()
            self.end_headers()
        else:
            self.send_response(403)
            self.end_headers()

    def do_GET(self):
        origin = self.headers.get("Origin")

        # ── GET /health ───────────────────────────────────────────────────────
        if self.path == "/health":
            keys_ready   = bool(STRIPE_SECRET_KEY and STRIPE_PUBLIC_KEY)
            prices_monthly = {k: bool(v) for k, v in STRIPE_PRICES_MONTHLY.items()}
            prices_annual  = {k: bool(v) for k, v in STRIPE_PRICES_ANNUAL.items()}
            self._json(200, {
                "status":          "ok",
                "version":         SERVER_VERSION,
                "stripe_keys":     keys_ready,
                "prices_set":      prices_monthly,
                "prices_annual":   prices_annual,
                "webhook_secret":  bool(STRIPE_WEBHOOK_SECRET),
                "uptime_seconds":  int(time.time() - _start_time),
            }, origin)
            return

        # ── GET /subscription?session_id=cs_... ──────────────────────────────
        if self.path.startswith("/subscription"):
            qs    = {}
            if "?" in self.path:
                qs = dict(urllib.parse.parse_qsl(self.path.split("?", 1)[1]))

            session_id = qs.get("session_id", "").strip()

            # Validate session_id format (Stripe IDs look like cs_test_xxx or cs_live_xxx)
            if not session_id or not re.match(r'^cs_(test|live)_[A-Za-z0-9]{20,}$', session_id):
                self._json(400, {"error": "invalid_session_id"}, origin)
                return

            if not STRIPE_SECRET_KEY:
                self._json(503, {"error": "stripe_not_configured"}, origin)
                return

            try:
                session = _stripe_request(
                    "GET",
                    f"/v1/checkout/sessions/{urllib.parse.quote(session_id)}?expand[]=subscription",
                )
                sub = session.get("subscription") or {}
                if isinstance(sub, str):
                    # Not expanded — just return basic status
                    self._json(200, {
                        "status":       session.get("status"),
                        "payment_status": session.get("payment_status"),
                        "customer_email": session.get("customer_email"),
                    }, origin)
                else:
                    self._json(200, {
                        "status":           session.get("status"),
                        "payment_status":   session.get("payment_status"),
                        "customer_email":   session.get("customer_email"),
                        "subscription_id":  sub.get("id"),
                        "sub_status":       sub.get("status"),
                        "current_period_end": sub.get("current_period_end"),
                        "cancel_at_period_end": sub.get("cancel_at_period_end"),
                    }, origin)
            except urllib.error.HTTPError as e:
                code = 502 if e.code >= 500 else 400
                self._json(code, {"error": f"stripe_{e.code}"}, origin)
            except Exception as e:
                print(f"[{_ts()}] [PAYMENT-ERROR] {e}")
                self._json(500, {"error": "lookup_failed"}, origin)
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        origin = self.headers.get("Origin")
        ip     = self.client_address[0]
        path   = self.path.split("?")[0]

        # ── POST /webhook — Stripe webhook, no rate limit, no CORS check ─────
        if path == "/webhook":
            raw = self._read_body()
            if raw is None:
                return
            sig = self.headers.get("Stripe-Signature", "")
            if not STRIPE_WEBHOOK_SECRET:
                print(f"[{_ts()}] [WEBHOOK] ⚠ STRIPE_WEBHOOK_SECRET not set — skipping verification")
            elif not _verify_webhook_signature(raw, sig, STRIPE_WEBHOOK_SECRET):
                print(f"[{_ts()}] [WEBHOOK] ✗ Signature verification failed")
                self.send_response(400)
                self.end_headers()
                return

            try:
                event = json.loads(raw)
            except Exception:
                self.send_response(400)
                self.end_headers()
                return

            event_type = event.get("type", "")
            obj        = event.get("data", {}).get("object", {})

            if event_type == "checkout.session.completed":
                email  = obj.get("customer_email") or obj.get("customer_details", {}).get("email", "")
                amount = obj.get("amount_total", 0)
                print(f"[{_ts()}] [WEBHOOK] ✓ checkout.session.completed  email={email}  amount=${amount/100:.0f}")

            elif event_type == "customer.subscription.deleted":
                cust = obj.get("customer", "")
                print(f"[{_ts()}] [WEBHOOK] ✓ subscription cancelled  customer={cust}")

            elif event_type == "invoice.payment_failed":
                email  = obj.get("customer_email", "")
                amount = obj.get("amount_due", 0)
                print(f"[{_ts()}] [WEBHOOK] ⚠ payment_failed  email={email}  amount=${amount/100:.0f}")

            elif event_type == "invoice.payment_succeeded":
                email  = obj.get("customer_email", "")
                amount = obj.get("amount_paid", 0)
                print(f"[{_ts()}] [WEBHOOK] ✓ payment_succeeded  email={email}  amount=${amount/100:.0f}")

            _log_event(event)

            # Stripe expects a 200 within a few seconds — respond immediately
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"received":true}')
            return

        # ── Rate limiting for all other POST endpoints ────────────────────────
        if not _check_rate_limit(ip):
            self._json(429, {"error": "rate_limited"}, origin)
            return

        # ── POST /checkout — create a Stripe checkout session ────────────────
        if path == "/checkout":
            if not STRIPE_SECRET_KEY:
                self._json(503, {"error": "stripe_not_configured",
                                 "message": "Add STRIPE_SECRET_KEY to .env"}, origin)
                return

            raw = self._read_body()
            if raw is None:
                return
            try:
                body = json.loads(raw)
            except Exception:
                self._json(400, {"error": "invalid_json"}, origin)
                return

            plan    = str(body.get("plan",    "")).strip().lower()
            email   = str(body.get("email",   "")).strip().lower()
            billing = str(body.get("billing", "monthly")).strip().lower()
            if billing not in ("monthly", "annual"):
                billing = "monthly"

            if plan not in STRIPE_PRICES_MONTHLY:
                self._json(400, {"error": "invalid_plan",
                                 "valid": list(STRIPE_PRICES_MONTHLY.keys())}, origin)
                return

            # Choose monthly or annual price table
            price_table = STRIPE_PRICES_ANNUAL if billing == "annual" else STRIPE_PRICES_MONTHLY
            price_id    = price_table.get(plan, "")

            # Fall back to monthly if annual price not yet configured
            if not price_id and billing == "annual":
                price_id = STRIPE_PRICES_MONTHLY.get(plan, "")
                billing  = "monthly"  # so the metadata is accurate

            if not price_id:
                env_key = f"STRIPE_PRICE_{plan.upper()}"
                self._json(503, {"error": "price_not_configured",
                                 "message": f"Set {env_key} in .env"}, origin)
                return

            amounts  = PLAN_AMOUNTS_ANNUAL if billing == "annual" else PLAN_AMOUNTS_MONTHLY
            amount   = amounts[plan]
            plan_label = f"{PLAN_NAMES[plan]} ({billing})"

            # Build the checkout session payload
            checkout_data: Dict[str, Any] = {
                "mode":                                "subscription",
                "line_items[0][price]":                price_id,
                "line_items[0][quantity]":             "1",
                "success_url":                         f"{BASE_URL}/success.html?session_id={{CHECKOUT_SESSION_ID}}&plan={plan}&billing={billing}",
                "cancel_url":                          f"{BASE_URL}/afterhours-standalone.html#pricing",
                "subscription_data[metadata][plan]":   plan,
                "subscription_data[metadata][billing]": billing,
                # Allow promo codes at checkout
                "allow_promotion_codes":               "true",
                # Collect billing address for tax purposes
                "billing_address_collection":          "auto",
            }

            # Pre-fill email if provided and looks valid
            if email and re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
                checkout_data["customer_email"] = email

            try:
                session = _stripe_request("POST", "/v1/checkout/sessions", checkout_data)
                checkout_url = session.get("url", "")
                session_id   = session.get("id", "")
                print(f"[{_ts()}] [CHECKOUT] Created  plan={plan_label}  session={session_id[:16]}…")
                self._json(200, {
                    "url":        checkout_url,
                    "session_id": session_id,
                    "plan":       plan,
                    "billing":    billing,
                    "plan_name":  plan_label,
                    "amount":     amount,
                }, origin)
            except urllib.error.HTTPError as e:
                err_body = e.read().decode(errors="replace")
                # Never forward full Stripe error — may contain card details
                print(f"[{_ts()}] [CHECKOUT] Stripe error {e.code}: {err_body[:200]}")
                code = 502 if e.code >= 500 else 400
                self._json(code, {"error": f"stripe_{e.code}"}, origin)
            except Exception as e:
                print(f"[{_ts()}] [CHECKOUT] Unexpected: {e}")
                self._json(500, {"error": "checkout_failed"}, origin)
            return

        self.send_response(404)
        self.end_headers()


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    keys_ready      = bool(STRIPE_SECRET_KEY)
    prices_monthly  = sum(1 for v in STRIPE_PRICES_MONTHLY.values() if v)
    prices_annual   = sum(1 for v in STRIPE_PRICES_ANNUAL.values()  if v)
    wh_ready        = bool(STRIPE_WEBHOOK_SECRET)

    if not keys_ready:
        print("⚠️  WARNING: STRIPE_SECRET_KEY not set — /checkout will return 503")
        print("   Get your keys from dashboard.stripe.com/apikeys")
    if prices_monthly < 4:
        print(f"⚠️  WARNING: Only {prices_monthly}/4 monthly Price IDs set in .env")
        print("   Create products at dashboard.stripe.com/products then set")
        print("   STRIPE_PRICE_STARTER / _PRO / _BUSINESS / _AGENCY")
    if prices_annual < 4:
        print(f"   (optional) Annual pricing: only {prices_annual}/4 annual Price IDs set")
        print("   Set STRIPE_PRICE_STARTER_ANNUAL etc. to enable annual checkout")
    if not wh_ready:
        print("⚠️  WARNING: STRIPE_WEBHOOK_SECRET not set — webhooks won't verify")
        print("   Add webhook at dashboard.stripe.com/webhooks → copy signing secret")
        print("   For local testing:  stripe listen --forward-to localhost:3337/webhook")

    server = ThreadedHTTPServer(("127.0.0.1", PORT), PaymentHandler)
    print(f"\n💳  AfterHours Payment Server  (v{SERVER_VERSION})  →  http://localhost:{PORT}")
    print(f"    Stripe keys:    {'✓' if keys_ready else '✗ (set STRIPE_SECRET_KEY in .env)'}")
    print(f"    Monthly prices: {prices_monthly}/4 plans configured")
    print(f"    Annual prices:  {prices_annual}/4 plans configured")
    print(f"    Webhook secret: {'✓' if wh_ready else '✗ (set STRIPE_WEBHOOK_SECRET in .env)'}")
    print(f"    Site base URL:  {BASE_URL}")
    print(f"    Subs log:       {SUBS_LOG}")
    print(f"    Health: http://localhost:{PORT}/health\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
