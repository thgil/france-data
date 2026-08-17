#!/usr/bin/env python3
"""Static preview server for local development.

python -m http.server sends no cache headers, so browsers apply heuristic
caching to the JSON data files. During development that means editing a data
file and reloading shows the old content, which reads exactly like a rendering
bug and is not one. This server sends no-store on everything so a reload is
always a reload.

Usage: python3 scripts/dev-server.py [port]   (default 8777, not 3000)
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DEFAULT_PORT = 8777


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    # One line per request instead of the default three-part format.
    def log_message(self, fmt, *args):
        sys.stderr.write(f"{self.command} {self.path} {args[1] if len(args) > 1 else ''}\n")


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    root = Path(__file__).resolve().parent.parent
    handler = partial(NoCacheHandler, directory=str(root))
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    print(f"Serving {root} at http://localhost:{port}/ with caching disabled")
    print("Stop with ctrl-c")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped")


if __name__ == "__main__":
    main()
