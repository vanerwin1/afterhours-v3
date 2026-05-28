#!/usr/bin/env python3
"""
AfterHours.AI — ElevenLabs TTS Proxy Server  (hardened v2)
===========================================================
Runs on port 3334. The browser calls this instead of ElevenLabs directly so:
  • the API key stays server-side
  • CORS is handled cleanly and restricted to allowed origins
  • requests are rate-limited per IP
  • input length is capped to prevent abuse

Usage:  python3 tts-proxy.py
        (set ELABS_KEY and other settings in .env — never hard-code them)
"""

import json
import os
import time
import urllib.request
import urllib.error
from collections import defaultdict
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from typing import Optional

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Each TTS request handled in its own thread — a slow ElevenLabs call
    never blocks other callers."""
    daemon_threads = True

# ── Load .env (no third-party deps required) ────────────────────────────────
# Force-assignment so empty parent-env vars don't shadow .env values.
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.isfile(_ENV_PATH):
    with open(_ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                k, v = k.strip(), v.strip()
                if v or not os.environ.get(k):
                    os.environ[k] = v

# ── Config (read from env; safe fallbacks where appropriate) ─────────────────
PORT      = int(os.environ.get("TTS_PORT", 3334))
ELABS_KEY = os.environ.get("ELABS_KEY", "")
VOICE_ID  = os.environ.get("VOICE_ID", "EXAVITQu4vr4xnSDxMaL")  # default: Sarah
MODEL_ID  = "eleven_turbo_v2_5"

# Voice personality — read from .env so you can tune without touching code.
# Defaults tuned for "emotional, soft and intimate" (Samantha persona):
#   stability:        lower → more emotional variation, more natural
#   similarity_boost: higher → stays closer to the original voice
#   style:            higher → more expressive delivery
VOICE_SETTINGS = {
    "stability":         float(os.environ.get("VOICE_STABILITY",  0.28)),
    "similarity_boost":  float(os.environ.get("VOICE_SIMILARITY", 0.85)),
    "style":             float(os.environ.get("VOICE_STYLE",       0.45)),
    "use_speaker_boost": True,
}

# CORS — restrict to known origins (comma-separated in .env)
_raw_origins  = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3333,http://127.0.0.1:3333")
ALLOWED_ORIGINS = {o.strip().rstrip("/") for o in _raw_origins.split(",") if o.strip()}

# Rate limiting — max requests per minute per IP
RATE_LIMIT_RPM = int(os.environ.get("RATE_LIMIT_RPM", 20))
TTS_MAX_CHARS  = int(os.environ.get("TTS_MAX_CHARS", 800))

# ── Runtime state ────────────────────────────────────────────────────────────
_rate_buckets = defaultdict(list)   # ip → [timestamps]


def _check_rate_limit(ip):
    # type: (str) -> bool
    """Return True if the request is allowed, False if rate-limited."""
    now = time.monotonic()
    window = 60.0
    bucket = _rate_buckets[ip]
    # Remove timestamps older than the window
    _rate_buckets[ip] = [t for t in bucket if now - t < window]
    if len(_rate_buckets[ip]) >= RATE_LIMIT_RPM:
        return False
    _rate_buckets[ip].append(now)
    return True


def _get_cors_origin(request_origin):
    # type: (Optional[str]) -> Optional[str]
    """Return the origin to echo in ACAO header, or None if not allowed."""
    if not request_origin:
        return None
    origin = request_origin.rstrip("/")
    # Always allow localhost variants (for local dev convenience)
    if origin in ALLOWED_ORIGINS:
        return origin
    # Allow any localhost port for convenience during development
    if origin.startswith("http://localhost:") or origin.startswith("http://127.0.0.1:"):
        return origin
    return None


class TTSHandler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        ts = time.strftime("%Y-%m-%d %H:%M:%S")
        ip = self.client_address[0]
        print(f"[{ts}] [{ip}] {fmt % args}")

    def _send_cors_headers(self, request_origin=None):
        origin = _get_cors_origin(request_origin)
        if origin:
            self.send_header("Access-Control-Allow-Origin",  origin)
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Vary", "Origin")

    def _send_security_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options",         "DENY")
        self.send_header("Cache-Control",           "no-store")

    def do_OPTIONS(self):
        """Handle CORS pre-flight."""
        origin = self.headers.get("Origin")
        allowed = _get_cors_origin(origin)
        if allowed:
            self.send_response(204)
            self._send_cors_headers(origin)
            self._send_security_headers()
            self.end_headers()
        else:
            self.send_response(403)
            self.end_headers()

    def do_GET(self):
        """Health-check: GET /health"""
        if self.path == "/health":
            body = json.dumps({
                "status":      "ok",
                "voice":       VOICE_ID,
                "model":       MODEL_ID,
                "key_loaded":  bool(ELABS_KEY),
                "rate_limit":  f"{RATE_LIMIT_RPM}/min",
                "max_chars":   TTS_MAX_CHARS,
            }).encode()
            self.send_response(200)
            self.send_header("Content-Type",   "application/json")
            self.send_header("Content-Length", str(len(body)))
            origin = self.headers.get("Origin")
            self._send_cors_headers(origin)
            self._send_security_headers()
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """TTS endpoint: POST /tts  { "text": "Hello world" }"""
        if self.path != "/tts":
            self.send_response(404)
            self.end_headers()
            return

        origin = self.headers.get("Origin")
        ip     = self.client_address[0]

        # ── Rate limiting ────────────────────────────────────────────────────
        if not _check_rate_limit(ip):
            self.send_response(429)
            self.send_header("Content-Type",   "application/json")
            self.send_header("Retry-After",    "60")
            self._send_cors_headers(origin)
            self._send_security_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "rate_limited"}).encode())
            print(f"[RATE-LIMIT] {ip} exceeded {RATE_LIMIT_RPM} req/min")
            return

        # ── API key check ────────────────────────────────────────────────────
        if not ELABS_KEY:
            self.send_response(503)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers(origin)
            self.end_headers()
            self.wfile.write(json.dumps({"error": "tts_not_configured"}).encode())
            return

        # ── Parse body ───────────────────────────────────────────────────────
        length = int(self.headers.get("Content-Length", 0))
        if length > 8192:                              # hard cap on body size
            self.send_response(413)
            self.end_headers()
            return

        raw = self.rfile.read(length)
        try:
            body = json.loads(raw)
            text = str(body.get("text", "")).strip()
        except Exception:
            self.send_response(400)
            self.end_headers()
            return

        if not text:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers(origin)
            self.end_headers()
            self.wfile.write(json.dumps({"error": "empty_text"}).encode())
            return

        # ── Input validation ─────────────────────────────────────────────────
        if len(text) > TTS_MAX_CHARS:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers(origin)
            self.end_headers()
            self.wfile.write(json.dumps({
                "error":   "text_too_long",
                "max":     TTS_MAX_CHARS,
                "received": len(text),
            }).encode())
            return

        # ── Strip internal tags the UI may embed ─────────────────────────────
        import re
        clean_text = re.sub(r"\[.*?\]", "", text).strip()
        if not clean_text:
            self.send_response(400)
            self.end_headers()
            return

        # ── Call ElevenLabs ──────────────────────────────────────────────────
        payload = json.dumps({
            "text":           clean_text,
            "model_id":       MODEL_ID,
            "voice_settings": VOICE_SETTINGS,
        }).encode()

        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
            data=payload,
            headers={
                "Accept":        "audio/mpeg",
                "Content-Type":  "application/json",
                "xi-api-key":    ELABS_KEY,
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                audio = resp.read()

            self.send_response(200)
            self.send_header("Content-Type",   "audio/mpeg")
            self.send_header("Content-Length", str(len(audio)))
            self._send_cors_headers(origin)
            self._send_security_headers()
            self.end_headers()
            self.wfile.write(audio)
            print(f"[TTS] ✓ {len(audio):,} bytes — \"{clean_text[:60]}\"")

        except urllib.error.HTTPError as e:
            err_body = e.read().decode(errors="replace")
            # Don't echo the full ElevenLabs error — it may contain key info
            print(f"[TTS] ElevenLabs error {e.code}: {err_body[:200]}")
            code = 502 if e.code >= 500 else 400
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers(origin)
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"upstream_{e.code}"}).encode())

        except Exception as e:
            print(f"[TTS] Unexpected error: {e}")
            self.send_response(500)
            self._send_cors_headers(origin)
            self.end_headers()


if __name__ == "__main__":
    if not ELABS_KEY:
        print("⚠️  WARNING: ELABS_KEY not set in .env — TTS proxy will return 503")
    server = ThreadedHTTPServer(("127.0.0.1", PORT), TTSHandler)  # threaded — localhost only
    print(f"🎙️  AfterHours TTS Proxy  (hardened v2)  →  http://localhost:{PORT}")
    print(f"    Voice:       {VOICE_ID}  |  Model: {MODEL_ID}")
    print(f"    Stability:   {VOICE_SETTINGS['stability']}  |  Similarity: {VOICE_SETTINGS['similarity_boost']}  |  Style: {VOICE_SETTINGS['style']}")
    print(f"    Rate limit:  {RATE_LIMIT_RPM} req/min per IP  |  Max chars: {TTS_MAX_CHARS}")
    print(f"    Allowed origins: {', '.join(ALLOWED_ORIGINS) or 'localhost (default)'}")
    print(f"    Health: http://localhost:{PORT}/health")
    print(f"    Key loaded: {'✓' if ELABS_KEY else '✗ (set ELABS_KEY in .env)'}\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
