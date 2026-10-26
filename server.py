```python
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

HOST = "0.0.0.0"
PORT = 8000

# Automatically use the folder where server.py is saved
os.chdir(Path(__file__).resolve().parent)

server = ThreadingHTTPServer((HOST, PORT), SimpleHTTPRequestHandler)

print("=" * 40)
print("  INDIAN OPEN WORLD 3D GAME")
print("=" * 40)
print(f"Game URL: http://localhost:{PORT}")
print("Press Ctrl+C to stop the server.")

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nGame server stopped.")
finally:
    server.server_close()
```
