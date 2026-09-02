import http.server
import os
import sys

PORT = 4200
DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "dist", "frontend", "browser")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)
    
    def do_GET(self):
        if self.path.startswith("/api"):
            self.send_error(404, "API not available in static mode")
        else:
            super().do_GET()
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

print(f"Serving {DIR} on port {PORT}")
httpd = http.server.HTTPServer(("0.0.0.0", PORT), Handler)
httpd.serve_forever()
