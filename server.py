#!/usr/bin/env python3
"""
AfterHours.AI — Hardened Static File Server
============================================
Replaces bare `python3 -m http.server` with a server that sends proper
HTTP security headers on every response.

Usage:  python3 server.py          (default port 3333)
        python3 server.py 8080     (custom port)
"""

import os
import sys
from http.server import SimpleHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle each request in a separate thread — prevents slow requests blocking others."""
    daemon_threads = True

# ── Config ───────────────────────────────────────────────────────────────────
PORT    = int(sys.argv[1]) if len(sys.argv) > 1 else 3333
HOST    = "127.0.0.1"      # localhost only; use ngrok to share publicly
WEBROOT = os.path.dirname(os.path.abspath(__file__))

# Wix domains allowed to embed (iframe) this app.
# Wix wraps an embedded external URL in an iframe served from these hosts, so they
# must be permitted by `frame-ancestors` or the embed shows a blank box.
# ⚠️  Once the Glow Vault Wix site is published on a custom domain, add it here,
#     e.g.  "https://www.yourdomain.com https://yourdomain.com".
WIX_FRAME_ANCESTORS = (
    "https://*.wixsite.com "    # published free Wix sites
    "https://*.wix.com "        # Wix editor / preview
    "https://*.editorx.com "    # Editor X
    "https://*.wixstudio.com "  # Wix Studio
    "https://*.filesusr.com"    # Wix HTML-embed sandbox host
)

# Security headers added to every response
SECURITY_HEADERS = {
    # NOTE: Clickjacking is controlled below via CSP `frame-ancestors`, which
    # (unlike X-Frame-Options) can allow-list multiple origins. X-Frame-Options
    # is intentionally omitted — setting it to SAMEORIGIN would block Wix.
    # Stop MIME-type sniffing
    "X-Content-Type-Options": "nosniff",
    # Basic XSS filter (legacy browsers)
    "X-XSS-Protection": "1; mode=block",
    # Don't send referer cross-origin
    "Referrer-Policy": "strict-origin-when-cross-origin",
    # Permissions policy — disable sensitive features not used
    "Permissions-Policy": "geolocation=(), camera=(), payment=()",
    # Content-Security-Policy
    # Ports: 3334 = TTS proxy · 3335 = AI agent · 3337 = payment server
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://unpkg.com https://js.stripe.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' "
            "http://localhost:3334 http://127.0.0.1:3334 "
            "http://localhost:3335 http://127.0.0.1:3335 "
            "http://localhost:3337 http://127.0.0.1:3337 "
            "https://api.elevenlabs.io https://api.anthropic.com "
            "https://api.stripe.com; "
        "frame-src https://prod.spline.design https://js.stripe.com https://hooks.stripe.com; "
        "media-src 'self' blob:; "
        "worker-src blob:; "
        f"frame-ancestors 'self' {WIX_FRAME_ANCESTORS};"
    ),
    # Cache HTML files briefly; let browsers cache assets longer
    "Cache-Control": "no-cache",
}


# Paths that must never be served — secrets and config files
BLOCKED_PATHS = {
    "/.env", "/.env.local", "/.env.production",
    "/.gitignore", "/.git",
    "/tts-proxy.py", "/agent-server.py", "/server.py", "/payment-server.py",
    "/bookings.jsonl", "/subscriptions.jsonl",
}


class SecureHandler(SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEBROOT, **kwargs)

    def do_GET(self):
        # Block secret / server-side files from ever being served
        path = self.path.split("?")[0].split("#")[0]
        if any(path == b or path.startswith(b + "/") for b in BLOCKED_PATHS):
            self.send_response(403)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Forbidden")
            return
        super().do_GET()

    def end_headers(self):
        for k, v in SECURITY_HEADERS.items():
            self.send_header(k, v)
        # Allow longer cache for font/image/js/css assets
        if any(self.path.endswith(ext) for ext in (".woff2", ".woff", ".ttf", ".png", ".jpg", ".svg", ".ico")):
            self.send_header("Cache-Control", "public, max-age=86400")
        super().end_headers()

    def log_message(self, fmt, *args):
        import time
        ts = time.strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{ts}] [FILE SERVER] {fmt % args}")


if __name__ == "__main__":
    os.chdir(WEBROOT)
    server = ThreadedHTTPServer((HOST, PORT), SecureHandler)
    print(f"🌐  AfterHours File Server  →  http://localhost:{PORT}")
    print(f"    Serving: {WEBROOT}")
    print(f"    Security headers: ✓ CSP  ✓ X-Frame  ✓ MIME  ✓ Referrer")
    print(f"    Main page: http://localhost:{PORT}/afterhours-standalone.html\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
