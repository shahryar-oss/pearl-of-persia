#!/usr/bin/env python3
"""
Pearl of Persia — local prototype server
Serves the static site AND a small ticket API so change requests
(from Stella/Lana in the admin dashboard) are stored as real files in
./tickets/TCK-XXX/  (ticket.json + any attached Word/PDF documents).

Run:  python3 server.py   (port 4173)
"""
import json, os, re, sys, time, threading, base64
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from email import message_from_bytes
from email.policy import default as EMAIL_POLICY

ROOT = os.path.dirname(os.path.abspath(__file__))
# In production (Render) tickets live on the persistent disk via TICKETS_DIR;
# locally they stay in ./tickets next to this file.
TICKETS = os.environ.get("TICKETS_DIR") or os.path.join(ROOT, "tickets")
PORT = int(os.environ.get("PORT", "4173"))
# Server-side gate for /admin and /api. When ADMIN_PASS is set (production) those
# paths require HTTP Basic Auth. Left empty locally so the double-click workflow
# keeps working without a password. The public pages are never gated.
ADMIN_USER = os.environ.get("ADMIN_USER", "pearl")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "")
MAX_BODY = 25 * 1024 * 1024          # 25 MB per request
ALLOWED_EXT = {".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"}
LOCK = threading.Lock()

def now(): return time.strftime("%Y-%m-%d %H:%M")

def safe_name(name):
    name = os.path.basename(name or "file")
    name = re.sub(r"[^\w.\-؀-ۿ ]+", "_", name).strip() or "file"
    return name[:120]

def ticket_dir(tid): return os.path.join(TICKETS, tid)

def load_ticket(tid):
    p = os.path.join(ticket_dir(tid), "ticket.json")
    if not os.path.isfile(p): return None
    with open(p, encoding="utf-8") as f: return json.load(f)

def save_ticket(t):
    os.makedirs(ticket_dir(t["id"]), exist_ok=True)
    with open(os.path.join(ticket_dir(t["id"]), "ticket.json"), "w", encoding="utf-8") as f:
        json.dump(t, f, ensure_ascii=False, indent=2)

def list_tickets():
    if not os.path.isdir(TICKETS): return []
    out = []
    for d in sorted(os.listdir(TICKETS)):
        t = load_ticket(d)
        if t: out.append(t)
    out.sort(key=lambda t: t.get("created",""), reverse=True)
    return out

def next_id():
    n = 0
    if os.path.isdir(TICKETS):
        for d in os.listdir(TICKETS):
            m = re.match(r"TCK-(\d+)$", d)
            if m: n = max(n, int(m.group(1)))
    return "TCK-%03d" % (n + 1)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, fmt, *args):  # quieter log
        sys.stderr.write("%s %s\n" % (self.log_date_time_string(), fmt % args))

    # ---------- auth ----------
    def _gated(self, path):
        return path.startswith("/admin") or path.startswith("/api")

    def _auth_ok(self):
        if not ADMIN_PASS:
            return True   # local dev: no password configured
        hdr = self.headers.get("Authorization", "")
        if hdr.startswith("Basic "):
            try:
                u, _, p = base64.b64decode(hdr[6:]).decode("utf-8").partition(":")
                if u == ADMIN_USER and p == ADMIN_PASS:
                    return True
            except Exception:
                pass
        return False

    def _auth_challenge(self):
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="Pearl of Persia"')
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write("Authentication required".encode("utf-8"))

    # ---------- helpers ----------
    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_BODY: return None
        return self.rfile.read(length)

    def parse_multipart(self, raw):
        """Return (fields dict, files list[(filename, bytes)]) from multipart body."""
        ctype = self.headers.get("Content-Type", "")
        msg = message_from_bytes(
            b"Content-Type: " + ctype.encode() + b"\r\nMIME-Version: 1.0\r\n\r\n" + raw,
            policy=EMAIL_POLICY)
        fields, files = {}, []
        if not msg.is_multipart(): return fields, files
        for part in msg.iter_parts():
            name = part.get_param("name", header="content-disposition")
            filename = part.get_filename()
            payload = part.get_payload(decode=True) or b""
            if filename:
                files.append((safe_name(filename), payload))
            elif name:
                fields[name] = payload.decode("utf-8", "replace").strip()
        return fields, files

    # ---------- API ----------
    def do_GET(self):
        path = self.path.split("?")[0]
        if self._gated(path) and not self._auth_ok():
            return self._auth_challenge()
        if path == "/api/ping":
            return self.send_json({"ok": True, "tickets": True})
        if path == "/api/tickets":
            return self.send_json({"tickets": list_tickets()})
        m = re.match(r"^/api/tickets/(TCK-\d+)$", path)
        if m:
            t = load_ticket(m.group(1))
            return self.send_json(t or {"error": "not found"}, 200 if t else 404)
        m = re.match(r"^/api/tickets/(TCK-\d+)/file/(\d+)$", path)
        if m:
            t = load_ticket(m.group(1))
            if t and 0 <= int(m.group(2)) < len(t.get("attachments", [])):
                att = t["attachments"][int(m.group(2))]
                fp = os.path.join(ticket_dir(t["id"]), att["file"])
                if os.path.isfile(fp):
                    self.send_response(200)
                    self.send_header("Content-Type", "application/octet-stream")
                    self.send_header("Content-Disposition",
                                     'attachment; filename="%s"' % att["file"].encode("ascii","ignore").decode() or "file")
                    self.send_header("Content-Length", str(os.path.getsize(fp)))
                    self.end_headers()
                    with open(fp, "rb") as f: self.wfile.write(f.read())
                    return
            return self.send_json({"error": "not found"}, 404)
        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0]
        if self._gated(path) and not self._auth_ok():
            return self._auth_challenge()
        raw = self.read_body()
        if raw is None:
            return self.send_json({"error": "empty or oversized request"}, 400)

        if path == "/api/tickets":
            fields, files = self.parse_multipart(raw)
            subject = fields.get("subject", "").strip()
            if not subject:
                return self.send_json({"error": "subject required"}, 400)
            with LOCK:
                tid = next_id()
                t = {
                    "id": tid,
                    "subject": subject,
                    "name": fields.get("name", ""),
                    "category": fields.get("category", "change"),
                    "priority": fields.get("priority", "normal"),
                    "body": fields.get("body", ""),
                    "status": "open",
                    "created": now(), "updated": now(),
                    "attachments": [], "replies": []
                }
                os.makedirs(ticket_dir(tid), exist_ok=True)
                for fname, data in files[:5]:
                    ext = os.path.splitext(fname)[1].lower()
                    if ext not in ALLOWED_EXT or not data: continue
                    with open(os.path.join(ticket_dir(tid), fname), "wb") as f:
                        f.write(data)
                    t["attachments"].append({"file": fname, "size": len(data)})
                save_ticket(t)
            return self.send_json({"ok": True, "ticket": t})

        m = re.match(r"^/api/tickets/(TCK-\d+)/status$", path)
        if m:
            t = load_ticket(m.group(1))
            if not t: return self.send_json({"error": "not found"}, 404)
            try: status = json.loads(raw.decode("utf-8")).get("status", "")
            except Exception: status = ""
            if status not in ("open", "in_progress", "resolved"):
                return self.send_json({"error": "bad status"}, 400)
            t["status"] = status; t["updated"] = now()
            save_ticket(t)
            return self.send_json({"ok": True, "ticket": t})

        m = re.match(r"^/api/tickets/(TCK-\d+)/reply$", path)
        if m:
            t = load_ticket(m.group(1))
            if not t: return self.send_json({"error": "not found"}, 404)
            try: d = json.loads(raw.decode("utf-8"))
            except Exception: d = {}
            body = (d.get("body") or "").strip()
            if not body: return self.send_json({"error": "body required"}, 400)
            t["replies"].append({"author": (d.get("author") or "").strip() or "بی‌نام",
                                 "body": body, "at": now()})
            if t["status"] == "resolved": t["status"] = "in_progress"
            t["updated"] = now()
            save_ticket(t)
            return self.send_json({"ok": True, "ticket": t})

        return self.send_json({"error": "unknown endpoint"}, 404)

if __name__ == "__main__":
    os.makedirs(TICKETS, exist_ok=True)
    os.chdir(ROOT)
    print("Pearl of Persia server on http://localhost:%d  (tickets in ./tickets)" % PORT)
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()
