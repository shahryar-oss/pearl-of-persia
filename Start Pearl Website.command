#!/bin/zsh
# Double-click this file to start the Pearl of Persia prototype
# (site + admin + ticket system), then open http://localhost:4173
cd "$(dirname "$0")"
if lsof -ti:4173 >/dev/null 2>&1; then
  echo "Already running — opening the site…"
else
  nohup python3 server.py >/tmp/pearl_server.log 2>&1 &
  disown
  sleep 1
  echo "Server started."
fi
open "http://localhost:4173"
