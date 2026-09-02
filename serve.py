"""Simple dev server: serves Angular build + proxies /api to Django backend."""
import http.server
import urllib.request
import os
import sys

PORT = 4200
BACKEND = "http://localhost:8000"
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend", "dist", "frontend", "browser")


class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def do_GET(self):
        if self.path.startswith("/api/") or self.path.startswith("/admin/"):
            self._proxy()
        else:
            # SPA fallback: serve index.html for non-file paths
            path = self.path.split("?")[0]
            file_path = os.path.join(FRONTEND_DIR, path.lstrip("/"))
            if not os.path.exists(file_path) or os.path.isdir(file_path):
                if not os.path.exists(file_path) and "." not in os.path.basename(path):
                    self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            self._proxy()
        else:
            super().do_POST()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def _proxy(self):
        url = BACKEND + self.path
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length else None
        headers = {}
        for key in ("Content-Type", "Authorization"):
            if key in self.headers:
                headers[key] = self.headers[key]
        try:
            req = urllib.request.Request(url, data=body, headers=headers, method=self.command)
            with urllib.request.urlopen(req, timeout=30) as resp:
                resp_body = resp.read()
                self.send_response(resp.status)
                self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(resp_body)
        except urllib.error.HTTPError as e:
            resp_body = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", e.headers.get("Content-Type", "application/json"))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(resp_body)
        except Exception as e:
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(f'{{"error": "{str(e)}"}}'.encode())

    def log_message(self, format, *args):
        pass  # quiet


if __name__ == "__main__":
    print(f"Ecclesia Gestion - http://localhost:{PORT}")
    print(f"Proxy: /api -> {BACKEND}")
    print(f"Serving: {FRONTEND_DIR}")
    server = http.server.HTTPServer(("0.0.0.0", PORT), ProxyHandler)
    server.serve_forever()
